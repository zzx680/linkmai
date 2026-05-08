import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runPlanner } from '@/lib/ai/agents/planner-agent'
import { runDraftAgent } from '@/lib/ai/agents/draft-agent'
import { createDocument, saveDocumentVersion } from '@/lib/data/documents'
import { getCaseById } from '@/lib/data/cases'
import { hasEnoughBalance, deductAction } from '@/lib/billing/credits'
import { PRICES } from '@/lib/billing/config'
import type { DraftPlan } from '@/lib/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Check balance — need at least the card price to proceed
  if (!(await hasEnoughBalance(user.id, PRICES.DRAFT_CARD))) {
    return new Response(JSON.stringify({ error: '余额不足，请充值后继续使用' }), {
      status: 402,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await req.json()
  const { caseId, docType, instruction, conversationId } = body

  const caseData = await getCaseById(caseId)
  if (!caseData) return new Response('Case not found', { status: 404 })

  const caseContext = `案件名称：${caseData.title}\n案件类型：${caseData.case_type}\n当事人：${caseData.client_name || '未填写'}\n对方：${caseData.opponent || '未填写'}\n受理法院：${caseData.court || '未填写'}\n案情摘要：${caseData.description || '暂无'}`

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (chunk: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
      }

      try {
        // Phase 1: Plan
        send({ type: 'tool_call', name: 'planning', args: {} })
        const plan = await runPlanner({ caseContext, docType, instruction })

        // Phase 2: Search (bundled into draft, no separate charge)
        if (plan.searchQueries.length > 0) {
          send({ type: 'tool_call', name: 'search_legal_database', args: { queries: plan.searchQueries } })
          const { bingLegalSearch } = await import('@/lib/legal-search/bing')
          const searchResults = await Promise.all(
            plan.searchQueries.map(q => bingLegalSearch(q).catch(() => []))
          )
          plan.legalRefs = searchResults
            .flat()
            .filter((r, i, arr) => arr.findIndex(x => x.url === r.url) === i)
            .slice(0, 15)
            .map(r => `- ${r.title}：${r.snippet}\n  来源：${r.url}`)
            .join('\n\n')
          send({ type: 'tool_result', name: 'search_legal_database', result: `检索到 ${searchResults.flat().length} 条结果` })
        }

        send({ type: 'plan', plan })

        // Phase 3: Draft (streaming)
        let documentId: string | undefined
        let fullContent = ''

        for await (const chunk of runDraftAgent({
          caseId, docType, instruction, conversationId,
          userId: user.id,
          caseTitle: caseData.title,
          caseDescription: caseData.description || undefined,
          caseContext, plan,
        })) {
          if (chunk.type === 'text') fullContent += chunk.content

          if (chunk.type === 'tool_call' && chunk.name === 'save_document_draft') {
            const args = chunk.args as { title: string; doc_type: string; content: string; case_id: string }
            const doc = await createDocument({
              case_id: args.case_id,
              title: args.title,
              doc_type: args.doc_type as 'complaint' | 'defense' | 'contract' | 'lawyer_letter' | 'motion' | 'other',
            })
            documentId = doc.id
            await saveDocumentVersion(doc.id, args.content, 'ai', 'AI 自动起草')
          }

          send(chunk)
        }

        // Auto-save if agent didn't call save tool
        if (!documentId && fullContent.length > 100) {
          const typeLabel: Record<string, string> = {
            complaint: '起诉状', defense: '答辩状', contract: '合同',
            lawyer_letter: '律师函', motion: '申请书',
          }
          const doc = await createDocument({
            case_id: caseId,
            title: `${typeLabel[docType] || '文书'} - ${caseData.title}`,
            doc_type: docType,
          })
          documentId = doc.id
          await saveDocumentVersion(doc.id, fullContent, 'ai', 'AI 自动起草')
        }

        // Deduct per-result price (after successful generation)
        const { cost, newBalance } = await deductAction(
          user.id,
          'draft',
          `AI 文书起草 · ${caseData.title}`,
          { caseId, docType, documentId }
        )
        send({ type: 'billing', cost, balance: newBalance })

        if (documentId) send({ type: 'done', document_id: documentId })

      } catch (e) {
        send({ type: 'error', message: String(e) })
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runDraftAgent } from '@/lib/ai/agents/draft-agent'
import { createDocument, saveDocumentVersion } from '@/lib/data/documents'
import { getCaseById } from '@/lib/data/cases'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { caseId, docType, instruction, conversationId } = body

  const caseData = await getCaseById(caseId)
  if (!caseData) return new Response('Case not found', { status: 404 })

  let documentId: string | undefined
  let fullContent = ''

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        for await (const chunk of runDraftAgent({
          caseId,
          docType,
          instruction,
          conversationId,
          userId: user.id,
          caseTitle: caseData.title,
          caseDescription: caseData.description || undefined,
          caseContext: `案件名称：${caseData.title}\n案件类型：${caseData.case_type}\n当事人：${caseData.client_name || '未填写'}\n对方：${caseData.opponent || '未填写'}\n受理法院：${caseData.court || '未填写'}\n案情摘要：${caseData.description || '暂无'}`,
        })) {
          if (chunk.type === 'text') {
            fullContent += chunk.content
          }

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

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
        }

        // If agent finished without calling save tool but generated content, auto-save
        if (!documentId && fullContent.length > 100) {
          const doc = await createDocument({
            case_id: caseId,
            title: `${docType === 'complaint' ? '起诉状' : docType === 'defense' ? '答辩状' : docType === 'contract' ? '合同' : docType === 'lawyer_letter' ? '律师函' : '文书'} - ${caseData.title}`,
            doc_type: docType,
          })
          documentId = doc.id
          await saveDocumentVersion(doc.id, fullContent, 'ai', 'AI 自动起草')
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', document_id: doc.id })}\n\n`))
        }
      } catch (e) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: String(e) })}\n\n`))
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

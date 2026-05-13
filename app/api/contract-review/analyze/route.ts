import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { runExtractionAgent } from '@/lib/ai/agents/extraction-agent'
import type { ExtractionColumn } from '@/lib/types'

const CONTRACT_REVIEW_COLUMNS: ExtractionColumn[] = [
  { key: 'parties',   label: '合同主体', format: 'text',         description: '甲乙双方名称、统一社会信用代码' },
  { key: 'amount',    label: '合同金额', format: 'text',         description: '合同总价款及支付方式' },
  { key: 'term',      label: '履行期限', format: 'text',         description: '合同开始和结束日期' },
  { key: 'duties',    label: '核心义务', format: 'bulleted_list', description: '双方主要权利义务' },
  { key: 'breach',    label: '违约责任', format: 'text',         description: '违约金比例或计算方式' },
  { key: 'dispute',   label: '争议解决', format: 'text',         description: '仲裁或诉讼，管辖地' },
  { key: 'nda',       label: '保密条款', format: 'yes_no',       description: '是否有保密约定' },
  { key: 'risks',     label: '风险条款', format: 'bulleted_list', description: '不平等、模糊或对己方不利的条款，如无则填"未发现明显风险"' },
]

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { contractText, contractName } = await req.json()
  if (!contractText?.trim()) return NextResponse.json({ error: '请提供合同文本' }, { status: 400 })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        send({ type: 'start', total: CONTRACT_REVIEW_COLUMNS.length })

        const output = await runExtractionAgent({
          materialContent: contractText,
          materialName: contractName || '合同文本',
          columns: CONTRACT_REVIEW_COLUMNS,
        })

        for (const result of output.results) {
          send({ type: 'column_result', ...result })
        }

        send({ type: 'done' })
      } catch (err) {
        send({ type: 'error', message: err instanceof Error ? err.message : '分析失败' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getKimi, AI_MODEL } from '@/lib/ai/kimi'

const REVIEW_SYSTEM_PROMPT = (context: string) => `你是一位资深中国执业律师，正在帮助审查一份合同。

以下是对该合同的结构化分析结果：
${context}

请基于以上分析结果回答用户的问题。回答时：
1. 引用具体条款内容，指出原文位置
2. 指出潜在法律风险，说明风险等级（高/中/低）
3. 给出具体的修改建议
4. 语言专业、简洁，使用中文

如果用户问的问题超出合同内容范围，请如实说明。`

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { messages, extractionContext } = await req.json()
  if (!messages?.length) return NextResponse.json({ error: '缺少消息' }, { status: 400 })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await getKimi().chat.completions.create({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: REVIEW_SYSTEM_PROMPT(extractionContext || '（暂无结构化分析结果）') },
            ...messages,
          ],
          temperature: 0.3,
          stream: true,
        })

        for await (const chunk of response) {
          const delta = chunk.choices[0]?.delta?.content
          if (delta) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: delta })}\n\n`))
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: err instanceof Error ? err.message : '对话失败' })}\n\n`))
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

import { getKimi, AI_MODEL } from '@/lib/ai/kimi'
import { tools, DOC_TEMPLATES } from '@/lib/ai/tools'
import { DRAFT_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import type { StreamChunk, Json } from '@/lib/types'
import OpenAI from 'openai'

interface DraftAgentInput {
  caseId: string
  docType: string
  instruction: string
  conversationId: string
  userId: string
  caseTitle?: string
  caseDescription?: string
  caseContext?: string
}

interface AccumulatedToolCall {
  id: string
  name: string
  arguments: string
}

export async function* runDraftAgent(input: DraftAgentInput): AsyncGenerator<StreamChunk> {
  const caseInfo = input.caseContext || `案件：${input.caseTitle || ''}\n案情：${input.caseDescription || '暂无'}`

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: DRAFT_SYSTEM_PROMPT },
    { role: 'user', content: `案件信息：\n${caseInfo}\n\n请帮我起草：${input.instruction}` },
  ]

  const maxIterations = 5

  for (let i = 0; i < maxIterations; i++) {
    let fullContent = ''
    const accToolCalls: AccumulatedToolCall[] = []

    const stream = await getKimi().chat.completions.create({
      model: AI_MODEL,
      messages,
      tools,
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta
      if (!delta) continue

      if (delta.content) {
        fullContent += delta.content
        yield { type: 'text', content: delta.content }
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0
          while (accToolCalls.length <= idx) {
            accToolCalls.push({ id: '', name: '', arguments: '' })
          }
          if (tc.id) accToolCalls[idx].id = tc.id
          if (tc.function?.name) accToolCalls[idx].name += tc.function.name
          if (tc.function?.arguments) accToolCalls[idx].arguments += tc.function.arguments
        }
      }
    }

    if (accToolCalls.length === 0) {
      messages.push({ role: 'assistant', content: fullContent })
      break
    }

    const openaiToolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[] = accToolCalls.map((tc) => ({
      id: tc.id,
      type: 'function' as const,
      function: { name: tc.name, arguments: tc.arguments },
    }))

    messages.push({ role: 'assistant', content: fullContent || null, tool_calls: openaiToolCalls })

    for (const toolCall of accToolCalls) {
      const name = toolCall.name
      let args: Record<string, unknown>
      try {
        args = JSON.parse(toolCall.arguments)
      } catch {
        continue
      }

      yield { type: 'tool_call', name, args: args as Json }

      let result: string

      if (name === 'get_document_template') {
        result = DOC_TEMPLATES[args.doc_type as string] || '未找到该类型模板'
      } else if (name === 'search_legal_database') {
        const { bingLegalSearch } = await import('@/lib/legal-search/bing')
        const searchResults = await bingLegalSearch(args.query as string)
        result = JSON.stringify(searchResults)
      } else if (name === 'save_document_draft') {
        result = JSON.stringify({ saved: true, document_id: 'will-be-saved-by-route' })
      } else {
        result = 'Unknown tool'
      }

      yield { type: 'tool_result', name, result }
      messages.push({ role: 'tool', tool_call_id: toolCall.id, content: result })
    }
  }

  yield { type: 'done' }
}

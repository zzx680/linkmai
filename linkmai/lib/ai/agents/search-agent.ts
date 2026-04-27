import { getKimi, AI_MODEL } from '@/lib/ai/kimi'
import { tools } from '@/lib/ai/tools'
import { SEARCH_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import type { SearchResult } from '@/lib/types'
import OpenAI from 'openai'

interface SearchAgentInput {
  query: string
  caseId?: string
}

export async function runSearchAgent(input: SearchAgentInput): Promise<{
  summary: string
  results: SearchResult[]
}> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SEARCH_SYSTEM_PROMPT },
    { role: 'user', content: `请检索：${input.query}` },
  ]

  const response = await getKimi().chat.completions.create({
    model: AI_MODEL,
    messages,
    tools,
    tool_choice: 'auto',
  })

  const choice = response.choices[0]
  if (!choice?.message?.tool_calls?.length) {
    return {
      summary: choice?.message?.content || '未找到相关结果',
      results: [],
    }
  }

  const toolCall = choice.message.tool_calls[0]
  const tc = toolCall as OpenAI.Chat.ChatCompletionMessageToolCall & { function: { name: string; arguments: string } }
  const args = JSON.parse(tc.function.arguments)

  const { bingLegalSearch } = await import('@/lib/legal-search/bing')
  const searchResults = await bingLegalSearch(args.query || input.query, args.search_type)

  const summaryResponse = await getKimi().chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: 'system', content: SEARCH_SYSTEM_PROMPT },
      { role: 'user', content: `请检索：${input.query}` },
      { role: 'assistant', content: null, tool_calls: choice.message.tool_calls },
      { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(searchResults) },
      { role: 'user', content: '请根据以上检索结果，整理出结构化的摘要，按效力等级排序，标注完整出处。' },
    ],
  })

  return {
    summary: summaryResponse.choices[0]?.message?.content || '',
    results: searchResults,
  }
}

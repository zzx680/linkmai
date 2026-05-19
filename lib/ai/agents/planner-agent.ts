import { getKimi, AI_MODEL } from '@/lib/ai/kimi'
import { DOC_TEMPLATES } from '@/lib/ai/tools'
import type { DraftPlan } from '@/lib/types'

interface PlannerInput {
  caseContext: string
  docType: string
  instruction: string
}

const PLANNER_PROMPT = `你是一位资深中国律师的助手，专门负责规划法律文书起草方案。

你的任务：分析案件信息和用户指令，输出一份结构化的起草计划。

你必须输出合法的 JSON，格式如下：
{
  "keyFacts": ["从案情中提取的关键事实1", "关键事实2"],
  "legalIssues": ["涉及的法律问题1", "法律问题2"],
  "searchQueries": ["需要检索的关键词1", "关键词2"],
  "outline": ["文书大纲第一部分", "第二部分", "第三部分"]
}

规则：
1. keyFacts：提取对文书起草有决定作用的事实，不要超过 5 条
2. legalIssues：识别案件涉及的核心法律争议点，不要超过 3 条
3. searchQueries：列出需要检索的法条或判例关键词，用于后续法律检索，2-4 条
4. outline：根据文书类型和案情，列出文书的结构大纲，每个元素是一个章节标题
5. 只输出 JSON，不要输出任何其他内容`

export async function runPlanner(input: PlannerInput): Promise<DraftPlan> {
  const template = DOC_TEMPLATES[input.docType] || ''
  const templateHint = template
    ? `\n\n该文书类型的标准格式模板：\n${template.slice(0, 500)}`
    : ''

  const messages = [
    { role: 'system' as const, content: PLANNER_PROMPT },
    { role: 'user' as const, content: `案件信息：\n${input.caseContext}\n\n文书类型：${input.docType}\n用户指令：${input.instruction}${templateHint}` },
  ]

  const client = getKimi()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugBaseURL = (client as any).baseURL ?? (client as any)._options?.baseURL ?? 'unknown'
  const debugKey = (process.env.DEEPSEEK_API_KEY ?? 'missing').slice(0, 8) + '...'
  console.log('[planner] baseURL:', debugBaseURL, 'key prefix:', debugKey)

  const response = await client.chat.completions.create({
    model: AI_MODEL,
    messages,
    temperature: 0.3,
  })

  const raw = response.choices[0]?.message?.content || '{}'

  let parsed: Partial<DraftPlan>
  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    parsed = JSON.parse(jsonStr)
  } catch {
    parsed = {}
  }

  return {
    docType: input.docType,
    keyFacts: parsed.keyFacts || [],
    legalIssues: parsed.legalIssues || [],
    searchQueries: parsed.searchQueries || [],
    outline: parsed.outline || [],
    legalRefs: '',
  }
}

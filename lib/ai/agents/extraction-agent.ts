import { getKimi, AI_MODEL } from '@/lib/ai/kimi'
import type { ExtractionColumn, CellFlag, CellCitation } from '@/lib/types'

interface ExtractionInput {
  materialContent: string
  materialName: string
  columns: ExtractionColumn[]
  caseContext?: string
}

interface ExtractionResult {
  column_index: number
  summary: string
  flag: CellFlag
  citations: CellCitation[]
}

interface ExtractionOutput {
  results: ExtractionResult[]
}

const EXTRACTION_PROMPT = `你是一位资深中国律师的助手，专门负责从证据材料中提取结构化信息。

你的任务：阅读给定的法律材料，按照指定的列配置提取关键信息。

输出格式要求：
必须输出合法 JSON，格式如下：
{
  "results": [
    {
      "column_index": 0,
      "summary": "提取的内容摘要",
      "flag": "green",
      "citations": [{"quote": "原文引用", "position": "位置描述"}]
    }
  ]
}

flag 含义：
- green: 信息完整明确
- grey: 材料中未提及此项
- yellow: 信息存在但不完整或需要推断
- red: 信息存在矛盾或异常

规则：
1. summary 必须简洁精炼，适合在表格中展示
2. citations 中的 quote 必须是原文的精确引用，不可改写
3. position 描述引用在原文中的位置（如"第三段"、"签名栏"）
4. 如果某列信息在材料中完全不存在，flag 设为 grey，summary 填"未提及"，citations 为空数组
5. date 格式的列，summary 应输出标准日期格式（YYYY-MM-DD），如无法确定则输出原文
6. yes_no 格式的列，summary 只能是"是"或"否"
7. bulleted_list 格式的列，summary 使用换行符分隔的列表项，每项以"• "开头
8. 只输出 JSON，不要输出任何其他内容`

function buildColumnPrompt(columns: ExtractionColumn[]): string {
  return columns.map((col, i) =>
    `列 ${i}（column_index: ${i}）：${col.label}（格式：${col.format}）${col.description ? `\n  说明：${col.description}` : ''}`
  ).join('\n')
}

export async function runExtractionAgent(input: ExtractionInput): Promise<ExtractionOutput> {
  const columnPrompt = buildColumnPrompt(input.columns)
  const contextHint = input.caseContext ? `\n\n案件背景：\n${input.caseContext}` : ''

  const userMessage = `材料名称：${input.materialName}${contextHint}

需要提取的列：
${columnPrompt}

材料内容：
${input.materialContent.slice(0, 12000)}`

  const response = await getKimi().chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: 'system', content: EXTRACTION_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.1,
  })

  const raw = response.choices[0]?.message?.content || '{}'

  let parsed: Partial<ExtractionOutput>
  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    parsed = JSON.parse(jsonStr)
  } catch {
    parsed = {}
  }

  const results: ExtractionResult[] = (parsed.results || []).map((r: Partial<ExtractionResult>) => ({
    column_index: r.column_index ?? 0,
    summary: r.summary || '未提及',
    flag: (['green', 'grey', 'yellow', 'red'].includes(r.flag as string) ? r.flag : 'grey') as CellFlag,
    citations: Array.isArray(r.citations) ? r.citations : [],
  }))

  // Fill in missing columns with grey
  const resultMap = new Map(results.map(r => [r.column_index, r]))
  const fullResults = input.columns.map((_, i) =>
    resultMap.get(i) ?? { column_index: i, summary: '未提及', flag: 'grey' as CellFlag, citations: [] }
  )

  return { results: fullResults }
}

import { getDeepSeek, AI_MODEL } from '@/lib/ai/deepseek'
import type { EditSuggestion } from '@/lib/types'

interface EditAgentInput {
  content: string
  instruction: string
}

interface EditAgentOutput {
  edits: EditSuggestion[]
}

const EDIT_PROMPT = `你是一位资深中国律师的助手，专门负责修改法律文书。

你的任务：根据用户的修改指令，对文书内容提出精确的修改建议。

输出格式要求：
必须输出合法 JSON，格式如下：
{
  "edits": [
    {
      "find": "需要被替换的原文片段（必须是原文中的精确文本）",
      "replace": "替换后的文本",
      "reason": "修改理由（一句话）"
    }
  ]
}

规则：
1. find 必须是原文中的精确文本，不可改写或省略
2. find 应尽量短，只包含需要修改的部分，不要包含不需要修改的上下文
3. 每条修改应最小化范围，不要把多处修改合并成一条
4. replace 是修改后的完整替换文本
5. reason 简洁说明为什么要这样修改
6. 如果用户的指令无法对应到具体文本，返回空数组 {"edits": []}
7. 只输出 JSON，不要输出任何其他内容`

export async function runEditAgent(input: EditAgentInput): Promise<EditAgentOutput> {
  const response = await getDeepSeek().chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: 'system', content: EDIT_PROMPT },
      { role: 'user', content: `文书内容：\n${input.content.slice(0, 8000)}\n\n修改指令：${input.instruction}` },
    ],
    temperature: 0.1,
  })

  const raw = response.choices[0]?.message?.content || '{}'

  let parsed: Partial<EditAgentOutput>
  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    parsed = JSON.parse(jsonStr)
  } catch {
    parsed = {}
  }

  const edits: EditSuggestion[] = (parsed.edits || [])
    .filter((e: Partial<EditSuggestion>) => e.find && e.replace !== undefined)
    .map((e: Partial<EditSuggestion>) => ({
      find: e.find!,
      replace: e.replace!,
      reason: e.reason || '',
    }))

  return { edits }
}

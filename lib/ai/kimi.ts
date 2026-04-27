import OpenAI from 'openai'

export const AI_MODEL = 'deepseek-chat'

let _client: OpenAI | null = null

export function getKimi(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || 'placeholder',
      baseURL: 'https://api.deepseek.com/v1',
    })
  }
  return _client
}

// ── Billing constants ──────────────────────────────────────────────────────────
// DeepSeek API pricing (RMB per 1M tokens):
//   Input: ¥1, Output: ¥2
// Per-result pricing (value-based, not token-based):
//   Draft: ¥19/doc (pay-as-you-go), ¥9/doc (annual card)
//   Search: ¥3/query (pay-as-you-go), ¥1.5/query (annual card)

// Per-action prices in 分
export const PRICES = {
  DRAFT_PAYG: 1900,       // ¥19 per document
  DRAFT_CARD: 900,        // ¥9 per document (annual card)
  SEARCH_PAYG: 300,       // ¥3 per search
  SEARCH_CARD: 150,       // ¥1.5 per search (annual card)
} as const

// Annual card price
export const ANNUAL_CARD_PRICE = 128000 // ¥1,280/year

// Break-even: 9 drafts/month (9 × ¥10 saved = ¥90/mo > ¥106.7/mo card cost)
export const CARD_BREAKEVEN_DRAFTS_PER_MONTH = 9

// Minimum balance to allow a request (in 分)
export const MIN_BALANCE_FOR_REQUEST = 10 // ¥0.10

// ── Top-up packs ──────────────────────────────────────────────────────────────
export interface TopUpPack {
  id: string
  label: string
  amount: number       // 实付金额（分）
  bonus: number        // 赠送金额（分）
  totalCredits: number // amount + bonus
  badge?: string
}

export const TOP_UP_PACKS: TopUpPack[] = [
  { id: 'pack_50',  label: '入门包',  amount: 5000,  bonus: 0,    totalCredits: 5000  },
  { id: 'pack_100', label: '标准包',  amount: 10000, bonus: 0,    totalCredits: 10000 },
  { id: 'pack_300', label: '进阶包',  amount: 30000, bonus: 0,    totalCredits: 30000 },
  { id: 'pack_500', label: '专业包',  amount: 50000, bonus: 0,    totalCredits: 50000 },
]

// New user welcome: 1 free draft credit
export const WELCOME_BONUS = 1900 // ¥19 — exactly one free draft

// ── Cost calculation ──────────────────────────────────────────────────────────

export type ActionType = 'draft' | 'search'

export function getActionPrice(action: ActionType, hasAnnualCard: boolean): number {
  if (action === 'draft')  return hasAnnualCard ? PRICES.DRAFT_CARD  : PRICES.DRAFT_PAYG
  if (action === 'search') return hasAnnualCard ? PRICES.SEARCH_CARD : PRICES.SEARCH_PAYG
  return 0
}

// Format cents to yuan string
export function formatBalance(cents: number): string {
  const yuan = cents / 100
  if (yuan >= 1) return `¥${yuan.toFixed(2)}`
  return `¥0.${String(Math.abs(cents)).padStart(2, '0')}`
}

// Legacy token-based calc kept for reference / future hybrid use
export interface TokenUsage {
  inputTokens: number
  outputTokens: number
}

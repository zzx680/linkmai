export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type CaseType = 'civil' | 'criminal' | 'administrative' | 'arbitration'
export type CaseStatus = 'active' | 'closed' | 'archived'
export type DocType = 'complaint' | 'defense' | 'contract' | 'lawyer_letter' | 'motion' | 'other'
export type DocStatus = 'draft' | 'review' | 'final'
export type AgentType = 'general' | 'draft' | 'search'
export type MessageRole = 'user' | 'assistant' | 'tool'

export interface Case {
  id: string
  user_id: string
  title: string
  case_type: CaseType
  status: CaseStatus
  client_name: string | null
  opponent: string | null
  court: string | null
  case_number: string | null
  description: string | null
  client_phone?: string | null
  fee_amount?: number | null
  fee_status?: 'unpaid' | 'partial' | 'paid' | null
  metadata: Json
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  case_id: string
  user_id: string
  title: string
  doc_type: DocType
  current_version: number
  status: DocStatus
  share_token?: string | null
  share_enabled?: boolean
  created_at: string
  updated_at: string
}

export interface DocumentVersion {
  id: string
  document_id: string
  user_id: string
  version: number
  content: string
  change_note: string | null
  source: 'ai' | 'human'
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  case_id: string | null
  title: string | null
  agent_type: AgentType
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  role: MessageRole
  content: string | null
  tool_calls: Json | null
  tool_call_id: string | null
  tool_name: string | null
  metadata: Json
  created_at: string
}

export interface SearchHistory {
  id: string
  user_id: string
  case_id: string | null
  query: string
  intent: string | null
  source: string
  results: Json
  created_at: string
}

export interface SearchResult {
  id: number
  title: string
  url: string
  snippet: string
  source: string
}

export interface DraftPlan {
  docType: string
  keyFacts: string[]
  legalIssues: string[]
  searchQueries: string[]
  outline: string[]
  legalRefs: string // pre-fetched search results, injected into draft prompt
}

export type StreamChunk =
  | { type: 'text'; content: string }
  | { type: 'tool_call'; name: string; args: Json }
  | { type: 'tool_result'; name: string; result: string }
  | { type: 'plan'; plan: DraftPlan }
  | { type: 'billing'; cost: number; balance: number }
  | { type: 'done'; document_id?: string }
  | { type: 'error'; message: string }

export interface CreateCaseInput {
  title: string
  case_type: CaseType
  client_name?: string
  opponent?: string
  court?: string
  case_number?: string
  description?: string
}

export interface CreateDocumentInput {
  case_id: string
  title: string
  doc_type: DocType
}

// ===== 功能 2: 模板系统 =====

export interface DraftTemplate {
  id: string
  user_id: string | null
  title: string
  doc_type: string
  prompt_md: string
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface CreateTemplateInput {
  title: string
  doc_type: string
  prompt_md: string
}

// ===== 功能 1: 材料提取 =====

export type ColumnFormat = 'text' | 'date' | 'yes_no' | 'bulleted_list'

export interface ExtractionColumn {
  key: string
  label: string
  format: ColumnFormat
  description?: string
}

export type CellFlag = 'green' | 'grey' | 'yellow' | 'red'

export interface CellCitation {
  quote: string
  position: string
}

export interface CellContent {
  summary: string
  flag: CellFlag
  citations: CellCitation[]
}

export type CellStatus = 'pending' | 'extracting' | 'done' | 'error'

export interface Material {
  id: string
  case_id: string
  user_id: string
  filename: string
  content: string
  file_type: 'text' | 'pdf' | 'image'
  created_at: string
}

export interface MaterialReview {
  id: string
  case_id: string
  user_id: string
  title: string
  columns_config: ExtractionColumn[]
  created_at: string
}

export interface MaterialCell {
  id: string
  review_id: string
  material_id: string
  column_index: number
  content: CellContent
  status: CellStatus
}

// ===== 功能 3: 文书编辑 =====

export interface EditSuggestion {
  find: string
  replace: string
  reason: string
}

export interface EditSuggestionsResponse {
  edits: EditSuggestion[]
}

// ===== 功能: 案件期限 =====

export interface CaseDeadline {
  id: string
  case_id: string
  user_id: string
  title: string
  due_date: string  // date string YYYY-MM-DD
  status: 'pending' | 'done'
  created_at: string
}

export interface CreateDeadlineInput {
  case_id: string
  title: string
  due_date: string
  status?: 'pending' | 'done'
}

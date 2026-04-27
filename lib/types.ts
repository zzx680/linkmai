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
  title: string
  url: string
  snippet: string
  source: string
}

export type StreamChunk =
  | { type: 'text'; content: string }
  | { type: 'tool_call'; name: string; args: Json }
  | { type: 'tool_result'; name: string; result: string }
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

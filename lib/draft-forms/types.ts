import type { DocType } from '@/lib/types'

export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'array'

export interface FormField {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  required: boolean
  hint?: string
  options?: string[]
  arrayItemLabel?: string
  maxItems?: number
  colSpan?: 1 | 2
}

export interface FormStep {
  title: string
  description: string
  fields: FormField[]
}

export interface DocFormSchema {
  docType: DocType
  label: string
  icon: string
  desc: string
  steps: FormStep[]
}

export type FormData = Record<string, string | string[]>

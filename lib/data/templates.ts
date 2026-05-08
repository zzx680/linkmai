import { createClient } from '@/lib/supabase/server'
import type { DraftTemplate, CreateTemplateInput } from '@/lib/types'

export async function getTemplates(): Promise<DraftTemplate[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('draft_templates')
    .select('*')
    .or(`is_system.eq.true,user_id.eq.${user.id}`)
    .order('is_system', { ascending: false })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getTemplatesByDocType(docType: string): Promise<DraftTemplate[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('draft_templates')
    .select('*')
    .eq('doc_type', docType)
    .or(`is_system.eq.true,user_id.eq.${user.id}`)
    .order('is_system', { ascending: false })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getTemplateById(id: string): Promise<DraftTemplate | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('draft_templates')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createTemplate(input: CreateTemplateInput): Promise<DraftTemplate> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('draft_templates')
    .insert({ ...input, user_id: user.id, is_system: false })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTemplate(id: string, input: Partial<CreateTemplateInput>): Promise<DraftTemplate> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('draft_templates')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_system', false)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTemplate(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('draft_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_system', false)
  if (error) throw error
}

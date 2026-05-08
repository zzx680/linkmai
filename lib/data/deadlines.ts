import { createClient } from '@/lib/supabase/server'
import type { CaseDeadline, CreateDeadlineInput } from '@/lib/types'

export async function getDeadlinesByCaseId(caseId: string): Promise<CaseDeadline[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('case_deadlines')
    .select('*')
    .eq('case_id', caseId)
    .order('due_date', { ascending: true })
  if (error) throw error
  return data
}

export async function createDeadline(input: CreateDeadlineInput): Promise<CaseDeadline> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data, error } = await supabase
    .from('case_deadlines')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDeadline(id: string, updates: Partial<CaseDeadline>): Promise<CaseDeadline> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('case_deadlines')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDeadline(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('case_deadlines').delete().eq('id', id)
  if (error) throw error
}

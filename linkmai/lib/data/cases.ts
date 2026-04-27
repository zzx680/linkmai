import { createClient } from '@/lib/supabase/server'
import type { Case, CreateCaseInput } from '@/lib/types'

export async function getCases(): Promise<Case[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getCaseById(id: string): Promise<Case | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createCase(input: CreateCaseInput): Promise<Case> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('cases')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCase(id: string, updates: Partial<Case>): Promise<Case> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cases')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCase(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('cases').delete().eq('id', id)
  if (error) throw error
}

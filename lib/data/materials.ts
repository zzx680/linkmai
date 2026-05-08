import { createClient } from '@/lib/supabase/server'
import type { Material, MaterialReview, MaterialCell, ExtractionColumn, CellContent } from '@/lib/types'

// ── Materials ──────────────────────────────────────────────────────────────────

export async function getMaterialsByCase(caseId: string): Promise<Material[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createMaterial(input: {
  case_id: string
  filename: string
  content: string
  file_type: 'text' | 'pdf' | 'image'
}): Promise<Material> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('materials')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMaterial(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('materials').delete().eq('id', id)
  if (error) throw error
}

// ── Material Reviews ───────────────────────────────────────────────────────────

export async function getMaterialReviewsByCase(caseId: string): Promise<MaterialReview[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('material_reviews')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getMaterialReviewById(id: string): Promise<MaterialReview | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('material_reviews')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createMaterialReview(input: {
  case_id: string
  title: string
  columns_config: ExtractionColumn[]
}): Promise<MaterialReview> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('material_reviews')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMaterialReview(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('material_reviews').delete().eq('id', id)
  if (error) throw error
}

// ── Material Cells ─────────────────────────────────────────────────────────────

export async function getMaterialCellsByReview(reviewId: string): Promise<MaterialCell[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('material_cells')
    .select('*')
    .eq('review_id', reviewId)
  if (error) throw error
  return data
}

export async function upsertMaterialCell(input: {
  review_id: string
  material_id: string
  column_index: number
  content: CellContent
  status: string
}): Promise<MaterialCell> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('material_cells')
    .upsert(input, { onConflict: 'review_id,material_id,column_index' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function batchUpsertMaterialCells(cells: Array<{
  review_id: string
  material_id: string
  column_index: number
  content: CellContent
  status: string
}>): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('material_cells')
    .upsert(cells, { onConflict: 'review_id,material_id,column_index' })
  if (error) throw error
}

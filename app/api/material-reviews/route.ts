import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMaterialReviewsByCase, createMaterialReview } from '@/lib/data/materials'
import type { ExtractionColumn } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const caseId = req.nextUrl.searchParams.get('caseId')
    if (!caseId) return NextResponse.json({ error: 'Missing caseId' }, { status: 400 })
    const reviews = await getMaterialReviewsByCase(caseId)
    return NextResponse.json(reviews)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { caseId, title, columnsConfig } = body

    if (!caseId || !title || !columnsConfig) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const review = await createMaterialReview({
      case_id: caseId,
      title,
      columns_config: columnsConfig as ExtractionColumn[],
    })

    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}

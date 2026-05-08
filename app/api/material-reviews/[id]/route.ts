import { NextRequest, NextResponse } from 'next/server'
import { getMaterialReviewById, getMaterialCellsByReview, getMaterialsByCase } from '@/lib/data/materials'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const review = await getMaterialReviewById(id)
    if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [materials, cells] = await Promise.all([
      getMaterialsByCase(review.case_id),
      getMaterialCellsByReview(id),
    ])

    return NextResponse.json({ review, materials, cells })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCases, createCase } from '@/lib/data/cases'

export async function GET() {
  try {
    const cases = await getCases()
    return NextResponse.json(cases)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const newCase = await createCase(body)
    return NextResponse.json(newCase, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
  }
}

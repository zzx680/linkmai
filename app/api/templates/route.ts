import { NextRequest, NextResponse } from 'next/server'
import { getTemplates, getTemplatesByDocType, createTemplate } from '@/lib/data/templates'

export async function GET(req: NextRequest) {
  try {
    const docType = req.nextUrl.searchParams.get('docType')
    const templates = docType ? await getTemplatesByDocType(docType) : await getTemplates()
    return NextResponse.json(templates)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, doc_type, prompt_md } = body
    if (!title || !doc_type || !prompt_md) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const template = await createTemplate({ title, doc_type, prompt_md })
    return NextResponse.json(template, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}

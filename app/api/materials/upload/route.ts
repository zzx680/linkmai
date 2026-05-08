import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createMaterial } from '@/lib/data/materials'
import pdfParse from 'pdf-parse'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const contentType = req.headers.get('content-type') ?? ''

    let caseId: string
    let filename: string
    let content: string
    let fileType: 'text' | 'pdf' | 'image' = 'text'

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file')
      const caseIdField = formData.get('caseId')

      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: 'Missing file' }, { status: 400 })
      }
      if (!caseIdField || typeof caseIdField !== 'string') {
        return NextResponse.json({ error: 'Missing caseId' }, { status: 400 })
      }

      caseId = caseIdField
      filename = file.name

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      if (file.name.toLowerCase().endsWith('.pdf')) {
        const parsed = await pdfParse(buffer)
        content = parsed.text
        fileType = 'pdf'
      } else {
        content = buffer.toString('utf-8')
        fileType = 'text'
      }
    } else {
      const body = await req.json()
      caseId = body.caseId
      filename = body.filename
      content = body.content
      fileType = body.fileType ?? 'text'
    }

    if (!caseId || !filename || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const material = await createMaterial({
      case_id: caseId,
      filename,
      content,
      file_type: fileType,
    })

    return NextResponse.json(material, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to upload material' }, { status: 500 })
  }
}

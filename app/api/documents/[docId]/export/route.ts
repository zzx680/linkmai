import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDocumentById } from '@/lib/data/documents'
import { getLatestVersion } from '@/lib/data/documents'
import { generateLegalDocx } from '@/lib/docx/generator'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  const { docId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const [doc, version] = await Promise.all([
    getDocumentById(docId),
    getLatestVersion(docId),
  ])
  if (!doc || !version) return new NextResponse('Not found', { status: 404 })

  try {
    const buffer = await generateLegalDocx(doc.title, doc.doc_type, version.content)
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(doc.title)}.docx`,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMaterialReviewById, getMaterialsByCase, batchUpsertMaterialCells } from '@/lib/data/materials'
import { runExtractionAgent } from '@/lib/ai/agents/extraction-agent'
import type { CellContent } from '@/lib/types'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { id } = await params
  const review = await getMaterialReviewById(id)
  if (!review) return new Response('Not found', { status: 404 })

  const materials = await getMaterialsByCase(review.case_id)
  if (materials.length === 0) {
    return new Response(JSON.stringify({ error: '没有可提取的材料' }), { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (chunk: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
      }

      try {
        for (const material of materials) {
          send({ type: 'material_start', materialId: material.id, materialName: material.filename })

          const result = await runExtractionAgent({
            materialContent: material.content,
            materialName: material.filename,
            columns: review.columns_config,
          })

          const cells = result.results.map(r => ({
            review_id: review.id,
            material_id: material.id,
            column_index: r.column_index,
            content: {
              summary: r.summary,
              flag: r.flag,
              citations: r.citations,
            } as CellContent,
            status: 'done',
          }))

          await batchUpsertMaterialCells(cells)

          send({ type: 'material_done', materialId: material.id, cells })
        }

        send({ type: 'done' })
      } catch (e) {
        send({ type: 'error', message: String(e) })
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

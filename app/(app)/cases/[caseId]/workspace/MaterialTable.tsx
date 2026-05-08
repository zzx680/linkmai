'use client'

import { useState } from 'react'
import type { Material, MaterialCell, ExtractionColumn } from '@/lib/types'
import { Loader2 } from 'lucide-react'
import MaterialCellComponent from './MaterialCell'

interface Props {
  materials: Material[]
  columns: ExtractionColumn[]
  cells: MaterialCell[]
  extractingMaterialIds: Set<string>
}

export default function MaterialTable({ materials, columns, cells, extractingMaterialIds }: Props) {
  const getCell = (materialId: string, colIndex: number) =>
    cells.find(c => c.material_id === materialId && c.column_index === colIndex)

  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #ebebf0', background: '#fff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f8f8fb' }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 12, borderBottom: '1px solid #ebebf0', whiteSpace: 'nowrap', minWidth: 160, position: 'sticky', left: 0, background: '#f8f8fb', zIndex: 1 }}>
              材料
            </th>
            {columns.map((col, i) => (
              <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 12, borderBottom: '1px solid #ebebf0', whiteSpace: 'nowrap', minWidth: 200 }}>
                {col.label}
                <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#f0f0f5', color: '#aaa', fontWeight: 400 }}>
                  {col.format}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {materials.map((material, rowIdx) => {
            const isExtracting = extractingMaterialIds.has(material.id)
            return (
              <tr key={material.id} style={{ borderBottom: rowIdx < materials.length - 1 ? '1px solid #f0f0f5' : 'none' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200, position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '1px solid #f0f0f5' }}>
                  {isExtracting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb' }}>
                      <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                      {material.filename}
                    </span>
                  ) : material.filename}
                </td>
                {columns.map((_, colIdx) => {
                  const cell = getCell(material.id, colIdx)
                  return (
                    <td key={colIdx} style={{ padding: '8px 14px', verticalAlign: 'top' }}>
                      {isExtracting && !cell ? (
                        <div style={{ height: 32, borderRadius: 6, background: 'linear-gradient(90deg, #f0f0f5 25%, #e8e8f0 50%, #f0f0f5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                      ) : cell ? (
                        <MaterialCellComponent cell={cell} />
                      ) : (
                        <span style={{ color: '#ddd', fontSize: 12 }}>—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

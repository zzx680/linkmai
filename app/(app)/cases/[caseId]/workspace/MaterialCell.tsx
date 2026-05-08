'use client'

import { useState } from 'react'
import type { MaterialCell } from '@/lib/types'

const FLAG_COLORS: Record<string, string> = {
  green: '#16a34a',
  grey: '#aaa',
  yellow: '#d97706',
  red: '#dc2626',
}

interface Props {
  cell: MaterialCell
}

export default function MaterialCellComponent({ cell }: Props) {
  const [showCitations, setShowCitations] = useState(false)
  const flag = cell.content?.flag || 'grey'
  const summary = cell.content?.summary || ''
  const citations = cell.content?.citations || []

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => citations.length > 0 && setShowCitations(!showCitations)}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 6, cursor: citations.length > 0 ? 'pointer' : 'default' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: FLAG_COLORS[flag], flexShrink: 0, marginTop: 6 }} />
        <span style={{ fontSize: 12, color: flag === 'grey' ? '#aaa' : '#333', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
          {summary}
        </span>
      </div>

      {showCitations && citations.length > 0 && (
        <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 6, background: '#f8faff', border: '1px solid #e0e8ff', fontSize: 11, color: '#555', lineHeight: 1.6 }}>
          <p style={{ fontWeight: 600, color: '#2563eb', margin: '0 0 4px', fontSize: 10 }}>原文引用</p>
          {citations.map((c, i) => (
            <div key={i} style={{ marginTop: i > 0 ? 4 : 0 }}>
              <span style={{ color: '#aaa' }}>{c.position}：</span>
              <span style={{ color: '#444' }}>"{c.quote}"</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

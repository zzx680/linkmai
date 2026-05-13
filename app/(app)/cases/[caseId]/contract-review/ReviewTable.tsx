'use client'

import { useState, useRef, useEffect } from 'react'
import type { CellFlag, CellCitation } from '@/lib/types'
import { ChevronDown, ChevronUp, Quote } from 'lucide-react'

export type ColumnResult = {
  column_index: number
  summary: string
  flag: CellFlag
  citations: CellCitation[]
}

const COLUMNS = [
  '合同主体', '合同金额', '履行期限', '核心义务',
  '违约责任', '争议解决', '保密条款', '风险条款',
]

const FLAG_CONFIG: Record<CellFlag, { color: string; bg: string; label: string }> = {
  green:  { color: '#16a34a', bg: '#f0fdf4', label: '完整' },
  yellow: { color: '#d97706', bg: '#fffbeb', label: '不完整' },
  red:    { color: '#dc2626', bg: '#fef2f2', label: '风险' },
  grey:   { color: '#aaa',    bg: '#f5f5f8', label: '未提及' },
}

function FlagDot({ flag }: { flag: CellFlag }) {
  const cfg = FLAG_CONFIG[flag]
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: cfg.color, flexShrink: 0,
    }} title={cfg.label} />
  )
}

function Cell({ label, result }: { label: string; result: ColumnResult | undefined }) {
  const [expanded, setExpanded] = useState(false)
  const flag = result?.flag ?? 'grey'
  const cfg = FLAG_CONFIG[flag]

  const renderSummary = (summary: string) => {
    if (summary.includes('• ')) {
      return (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {summary.split('\n').filter(Boolean).map((line, i) => (
            <li key={i} style={{ fontSize: 13, color: '#333', lineHeight: 1.7, paddingLeft: 12, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: cfg.color }}>•</span>
              {line.replace(/^• /, '')}
            </li>
          ))}
        </ul>
      )
    }
    return <span style={{ fontSize: 13, color: result ? '#333' : '#bbb', lineHeight: 1.6 }}>{result?.summary ?? '分析中...'}</span>
  }

  return (
    <div style={{ borderBottom: '1px solid #f0f0f5' }}>
      <div
        onClick={() => result?.citations?.length && setExpanded(!expanded)}
        style={{
          display: 'grid', gridTemplateColumns: '160px 1fr auto',
          alignItems: 'start', gap: 16, padding: '14px 20px',
          cursor: result?.citations?.length ? 'pointer' : 'default',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => { if (result?.citations?.length) e.currentTarget.style.background = '#fafafa' }}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Label + flag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 2 }}>
          <FlagDot flag={flag} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{label}</span>
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: cfg.bg, color: cfg.color, fontWeight: 600 }}>
            {cfg.label}
          </span>
        </div>

        {/* Summary */}
        <div>{renderSummary(result?.summary ?? '')}</div>

        {/* Expand toggle */}
        <div style={{ paddingTop: 2, color: '#ccc' }}>
          {result?.citations?.length ? (
            expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          ) : null}
        </div>
      </div>

      {/* Citations */}
      {expanded && result?.citations?.length ? (
        <div style={{ padding: '0 20px 14px 196px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {result.citations.map((c, i) => (
            <div key={i} style={{ background: '#f8f9fc', borderRadius: 8, padding: '10px 14px', borderLeft: `3px solid ${cfg.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Quote size={11} style={{ color: cfg.color }} />
                <span style={{ fontSize: 11, color: '#aaa' }}>{c.position}</span>
              </div>
              <p style={{ fontSize: 12, color: '#555', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>"{c.quote}"</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function ReviewTable({ results }: { results: ColumnResult[] }) {
  const resultMap = new Map(results.map(r => [r.column_index, r]))

  const riskResult = resultMap.get(7)
  const hasRisk = riskResult && riskResult.flag === 'red'
  const redCount = results.filter(r => r.flag === 'red').length
  const yellowCount = results.filter(r => r.flag === 'yellow').length

  return (
    <div>
      {/* Summary bar */}
      {results.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { flag: 'red' as CellFlag, count: redCount, label: '风险项' },
            { flag: 'yellow' as CellFlag, count: yellowCount, label: '待确认' },
            { flag: 'green' as CellFlag, count: results.filter(r => r.flag === 'green').length, label: '完整' },
          ].map(({ flag, count, label }) => (
            <div key={flag} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: FLAG_CONFIG[flag].bg }}>
              <FlagDot flag={flag} />
              <span style={{ fontSize: 12, fontWeight: 600, color: FLAG_CONFIG[flag].color }}>{count} 项{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f5', background: '#fafafa', display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa' }}>审查项目</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa' }}>分析结果</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa' }}>原文</span>
        </div>
        {COLUMNS.map((label, i) => (
          <Cell key={i} label={label} result={resultMap.get(i)} />
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { ExtractionColumn, ColumnFormat } from '@/lib/types'
import { X, Plus, Trash2, ChevronDown } from 'lucide-react'

const PRESET_TEMPLATES: Record<string, { label: string; columns: ExtractionColumn[] }> = {
  timeline: {
    label: '时间线',
    columns: [
      { key: 'event_date', label: '事件时间', format: 'date', description: '事件发生的时间' },
      { key: 'event_desc', label: '事件描述', format: 'text', description: '发生了什么事' },
      { key: 'parties', label: '涉及当事人', format: 'text', description: '涉及的当事人' },
      { key: 'evidence_no', label: '证据编号', format: 'text', description: '对应证据材料编号' },
    ],
  },
  contract_review: {
    label: '合同审查',
    columns: [
      { key: 'party', label: '当事人', format: 'text', description: '合同当事人' },
      { key: 'sign_date', label: '签署日期', format: 'date', description: '合同签署日期' },
      { key: 'amount', label: '合同金额', format: 'text', description: '合同涉及的金额' },
      { key: 'breach_clause', label: '违约条款', format: 'bulleted_list', description: '违约责任相关条款' },
      { key: 'dispute_resolution', label: '争议解决', format: 'text', description: '争议解决方式' },
    ],
  },
  evidence_list: {
    label: '证据清单',
    columns: [
      { key: 'evidence_name', label: '证据名称', format: 'text', description: '证据名称或编号' },
      { key: 'proof_purpose', label: '证明事项', format: 'text', description: '该证据要证明什么' },
      { key: 'evidence_source', label: '证据来源', format: 'text', description: '证据的来源和取得方式' },
      { key: 'proof_strength', label: '证明力评估', format: 'text', description: '证明力强弱的评估' },
    ],
  },
}

const FORMAT_OPTIONS: { value: ColumnFormat; label: string }[] = [
  { value: 'text', label: '文本' },
  { value: 'date', label: '日期' },
  { value: 'yes_no', label: '是/否' },
  { value: 'bulleted_list', label: '列表' },
]

interface Props {
  columns: ExtractionColumn[]
  onConfirm: (columns: ExtractionColumn[]) => void
  onClose: () => void
}

export default function ColumnConfigModal({ columns: initialColumns, onConfirm, onClose }: Props) {
  const [cols, setCols] = useState<ExtractionColumn[]>(
    initialColumns.length > 0 ? initialColumns : []
  )
  const [newLabel, setNewLabel] = useState('')
  const [newFormat, setNewFormat] = useState<ColumnFormat>('text')

  const handlePreset = (key: string) => {
    setCols(PRESET_TEMPLATES[key].columns)
  }

  const handleAddColumn = () => {
    if (!newLabel.trim()) return
    const key = `col_${Date.now()}`
    setCols(prev => [...prev, { key, label: newLabel.trim(), format: newFormat }])
    setNewLabel('')
    setNewFormat('text')
  }

  const handleRemove = (index: number) => {
    setCols(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateFormat = (index: number, format: ColumnFormat) => {
    setCols(prev => prev.map((c, i) => i === index ? { ...c, format } : c))
  }

  const handleUpdateLabel = (index: number, label: string) => {
    setCols(prev => prev.map((c, i) => i === index ? { ...c, label } : c))
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: 560, maxHeight: '85vh', background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f0f0f5' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>配置提取列</span>
          <button onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#f5f5f8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            <X size={15} />
          </button>
        </div>

        {/* Presets */}
        <div style={{ padding: '14px 22px', borderBottom: '1px solid #f0f0f5' }}>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>快速选择预设模板：</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(PRESET_TEMPLATES).map(([key, t]) => (
              <button key={key} onClick={() => handlePreset(key)}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e0e0e8', background: '#fafafa', cursor: 'pointer', fontSize: 12, color: '#555' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px' }}>
          {cols.length === 0 ? (
            <p style={{ fontSize: 13, color: '#bbb', textAlign: 'center', padding: '20px 0' }}>暂无列，选择预设或手动添加</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cols.map((col, i) => (
                <div key={col.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #ebebf0', background: '#fafafa' }}>
                  <span style={{ fontSize: 12, color: '#aaa', width: 20, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <input value={col.label} onChange={e => handleUpdateLabel(i, e.target.value)}
                    style={{ flex: 1, height: 30, padding: '0 8px', borderRadius: 6, border: '1px solid #e0e0e8', background: '#fff', fontSize: 13, color: '#111', outline: 'none' }} />
                  <select value={col.format} onChange={e => handleUpdateFormat(i, e.target.value as ColumnFormat)}
                    style={{ height: 30, padding: '0 8px', borderRadius: 6, border: '1px solid #e0e0e8', background: '#fff', fontSize: 12, color: '#555', outline: 'none' }}>
                    {FORMAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <button onClick={() => handleRemove(i)}
                    style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#fff0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add column */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddColumn() }}
              placeholder="新列名称..."
              style={{ flex: 1, height: 34, padding: '0 10px', borderRadius: 7, border: '1px solid #e0e0e8', background: '#fafafa', fontSize: 13, color: '#111', outline: 'none' }} />
            <select value={newFormat} onChange={e => setNewFormat(e.target.value as ColumnFormat)}
              style={{ height: 34, padding: '0 8px', borderRadius: 7, border: '1px solid #e0e0e8', background: '#fafafa', fontSize: 12, color: '#555', outline: 'none' }}>
              {FORMAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={handleAddColumn} disabled={!newLabel.trim()}
              style={{ height: 34, padding: '0 12px', borderRadius: 7, border: 'none', background: !newLabel.trim() ? '#e0e0e8' : '#111', color: !newLabel.trim() ? '#aaa' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <Plus size={13} />添加
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 22px', borderTop: '1px solid #f0f0f5' }}>
          <button onClick={onClose}
            style={{ height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fff', fontSize: 13, color: '#666', cursor: 'pointer' }}>
            取消
          </button>
          <button onClick={() => onConfirm(cols)} disabled={cols.length === 0}
            style={{ height: 36, padding: '0 18px', borderRadius: 8, border: 'none', background: cols.length === 0 ? '#e0e0e8' : '#111', color: cols.length === 0 ? '#aaa' : '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            确认（{cols.length} 列）
          </button>
        </div>
      </div>
    </div>
  )
}

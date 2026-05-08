'use client'

import { useState, useRef } from 'react'
import type { Material, MaterialReview, MaterialCell, ExtractionColumn, Case } from '@/lib/types'
import { Plus, ClipboardList, Play, Download, Settings2, X, Loader2, Upload, ChevronDown } from 'lucide-react'
import ColumnConfigModal from './ColumnConfigModal'
import MaterialTable from './MaterialTable'

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

interface Props {
  caseData: Case
  onInjectContext?: (text: string) => void
}

export default function MaterialsPanel({ caseData, onInjectContext }: Props) {
  const [columns, setColumns] = useState<ExtractionColumn[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [cells, setCells] = useState<MaterialCell[]>([])
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [extractingMaterialIds, setExtractingMaterialIds] = useState<Set<string>>(new Set())

  const handlePasteSubmit = async () => {
    if (!pasteText.trim() || uploading) return
    setUploading(true)
    try {
      const res = await fetch('/api/materials/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseData.id,
          filename: `粘贴文本 ${materials.length + 1}`,
          content: pasteText.trim(),
          fileType: 'text',
        }),
      })
      if (res.ok) {
        const material = await res.json()
        setMaterials(prev => [...prev, material])
        setPasteText('')
        setShowPaste(false)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const isPdf = file.name.toLowerCase().endsWith('.pdf')
      let res: Response
      if (isPdf) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('caseId', caseData.id)
        res = await fetch('/api/materials/upload', {
          method: 'POST',
          body: formData,
        })
      } else {
        const text = await file.text()
        res = await fetch('/api/materials/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId: caseData.id,
            filename: file.name,
            content: text,
            fileType: 'text',
          }),
        })
      }
      if (res.ok) {
        const material = await res.json()
        setMaterials(prev => [...prev, material])
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleStartExtraction = async () => {
    if (columns.length === 0 || materials.length === 0 || generating) return
    setGenerating(true)
    setCells([])

    try {
      // Create review if not exists
      let currentReviewId = reviewId
      if (!currentReviewId) {
        const res = await fetch('/api/material-reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId: caseData.id,
            title: `${caseData.title} - 材料提取`,
            columnsConfig: columns,
          }),
        })
        if (res.ok) {
          const review = await res.json()
          currentReviewId = review.id
          setReviewId(currentReviewId)
        } else {
          throw new Error('Failed to create review')
        }
      }

      // Start streaming generation
      const res = await fetch(`/api/material-reviews/${currentReviewId}/generate`, { method: 'POST' })
      if (!res.body) throw new Error('No stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const chunk = JSON.parse(line.slice(6))
            if (chunk.type === 'material_start') {
              setExtractingMaterialIds(prev => new Set([...prev, chunk.materialId]))
            } else if (chunk.type === 'material_done') {
              setExtractingMaterialIds(prev => {
                const next = new Set(prev)
                next.delete(chunk.materialId)
                return next
              })
              setCells(prev => [...prev, ...chunk.cells])
            } else if (chunk.type === 'error') {
              console.error('Extraction error:', chunk.message)
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error('Extraction failed:', e)
    } finally {
      setGenerating(false)
    }
  }

  const handleExportCSV = () => {
    const header = ['材料', ...columns.map(c => c.label)].join(',')
    const rows = materials.map(m => {
      const row = [m.filename]
      for (let i = 0; i < columns.length; i++) {
        const cell = cells.find(c => c.material_id === m.id && c.column_index === i)
        row.push(cell?.content?.summary?.replace(/"/g, '""') || '')
      }
      return row.map(r => `"${r}"`).join(',')
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `材料提取_${caseData.title}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderBottom: '1px solid #ebebf0', background: '#fff', flexWrap: 'wrap' as const }}>
        <button onClick={() => setShowColumnConfig(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', borderRadius: 7, border: columns.length > 0 ? '1px solid #d0d8ff' : '1px solid #e0e0e8', background: columns.length > 0 ? '#f8faff' : '#fafafa', cursor: 'pointer', fontSize: 12, color: columns.length > 0 ? '#2563eb' : '#666' }}>
          <Settings2 size={13} />
          {columns.length > 0 ? `${columns.length} 列已配置` : '配置提取列'}
        </button>

        <button onClick={() => setShowPaste(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', borderRadius: 7, border: '1px solid #e0e0e8', background: '#fafafa', cursor: 'pointer', fontSize: 12, color: '#666' }}>
          <Upload size={13} />添加材料
        </button>

        <div style={{ flex: 1 }} />

        {cells.length > 0 && (
          <button onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', borderRadius: 7, border: '1px solid #e0e0e8', background: '#fafafa', cursor: 'pointer', fontSize: 12, color: '#666' }}>
            <Download size={13} />导出 CSV
          </button>
        )}

        {cells.length > 0 && onInjectContext && (
          <button
            onClick={() => {
              const lines = materials.map(m => {
                const cellSummaries = columns.map((col, i) => {
                  const cell = cells.find(c => c.material_id === m.id && c.column_index === i)
                  return cell?.content?.summary ? `${col.label}：${cell.content.summary}` : null
                }).filter(Boolean).join('；')
                return `- ${m.filename}：${cellSummaries}`
              })
              const text = `【已提取的材料信息】\n${lines.join('\n')}`
              onInjectContext(text)
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', borderRadius: 7, border: '1px solid #d0d8ff', background: '#f8faff', cursor: 'pointer', fontSize: 12, color: '#2563eb' }}>
            用于起草
          </button>
        )}

        <button onClick={handleStartExtraction}
          disabled={columns.length === 0 || materials.length === 0 || generating}
          style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 14px', borderRadius: 7, border: 'none', background: columns.length === 0 || materials.length === 0 || generating ? '#e0e0e8' : '#111', color: columns.length === 0 || materials.length === 0 || generating ? '#aaa' : '#fff', cursor: generating ? 'default' : 'pointer', fontSize: 12, fontWeight: 500 }}>
          {generating ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Play size={13} />}
          {generating ? '提取中...' : '开始提取'}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        {columns.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <ClipboardList size={36} style={{ color: '#ddd' }} />
            <p style={{ fontSize: 14, color: '#bbb' }}>先配置提取列，再添加材料</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {Object.entries(PRESET_TEMPLATES).map(([key, template]) => (
                <button key={key} onClick={() => { setColumns(template.columns); setShowColumnConfig(true) }}
                  style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid #e0e0e8', background: '#fff', cursor: 'pointer', fontSize: 12, color: '#555' }}>
                  {template.label}
                </button>
              ))}
            </div>
          </div>
        ) : materials.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <Upload size={36} style={{ color: '#ddd' }} />
            <p style={{ fontSize: 14, color: '#bbb' }}>添加材料后即可开始提取</p>
            <button onClick={() => setShowPaste(true)}
              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', cursor: 'pointer', fontSize: 13 }}>
              粘贴文本或上传文件
            </button>
          </div>
        ) : (
          <MaterialTable
            materials={materials}
            columns={columns}
            cells={cells}
            extractingMaterialIds={extractingMaterialIds}
          />
        )}
      </div>

      {/* Paste modal */}
      {showPaste && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={e => { if (e.target === e.currentTarget) setShowPaste(false) }}>
          <div style={{ width: 520, background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f0f0f5' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>添加材料</span>
              <button onClick={() => setShowPaste(false)}
                style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#f5f5f8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <textarea
                value={pasteText} onChange={e => setPasteText(e.target.value)}
                placeholder="粘贴材料文本内容..."
                rows={8}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fafafa', fontSize: 13, color: '#111', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: '#aaa' }}>或上传文件：</span>
                <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} disabled={uploading}
                  style={{ fontSize: 12, color: '#666' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 22px', borderTop: '1px solid #f0f0f5' }}>
              <button onClick={() => setShowPaste(false)}
                style={{ height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fff', fontSize: 13, color: '#666', cursor: 'pointer' }}>
                取消
              </button>
              <button onClick={handlePasteSubmit} disabled={!pasteText.trim() || uploading}
                style={{ height: 36, padding: '0 18px', borderRadius: 8, border: 'none', background: !pasteText.trim() || uploading ? '#e0e0e8' : '#111', color: !pasteText.trim() || uploading ? '#aaa' : '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                {uploading ? '上传中...' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showColumnConfig && (
        <ColumnConfigModal
          columns={columns}
          onConfirm={cols => { setColumns(cols); setShowColumnConfig(false) }}
          onClose={() => setShowColumnConfig(false)}
        />
      )}
    </div>
  )
}

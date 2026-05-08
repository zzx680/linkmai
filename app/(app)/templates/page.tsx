'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen, Zap,
  Plus, Pencil, Trash2, Loader2,
} from 'lucide-react'
import type { DraftTemplate } from '@/lib/types'
import NewTemplateModal from './NewTemplateModal'
import Sidebar from '@/app/components/Sidebar'

const DOC_TYPE_LABELS: Record<string, string> = {
  complaint: '起诉状', defense: '答辩状', contract: '合同',
  lawyer_letter: '律师函', motion: '申请书', other: '其他文书',
}

const DOC_TYPE_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'complaint', label: '起诉状' },
  { key: 'defense', label: '答辩状' },
  { key: 'contract', label: '合同' },
  { key: 'lawyer_letter', label: '律师函' },
  { key: 'motion', label: '申请书' },
  { key: 'other', label: '其他' },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<DraftTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<DraftTemplate | null>(null)

  const loadTemplates = async () => {
    const res = await fetch('/api/templates')
    if (res.ok) setTemplates(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadTemplates() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此模板？')) return
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const handleSaved = (template: DraftTemplate, isNew: boolean) => {
    if (isNew) {
      setTemplates(prev => [...prev, template])
    } else {
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t))
    }
    setShowModal(false)
    setEditingTemplate(null)
  }

  const filtered = filter === 'all' ? templates : templates.filter(t => t.doc_type === filter)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f6fa', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif" }}>

      <Sidebar />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', background: '#fff', borderBottom: '1px solid #ebebf0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={18} style={{ color: '#2563eb' }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>模板库</span>
            <span style={{ fontSize: 12, color: '#bbb', marginLeft: 4 }}>{templates.length} 个模板</span>
          </div>
          <button
            onClick={() => { setEditingTemplate(null); setShowModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <Plus size={14} />新建模板
          </button>
        </header>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '14px 28px 0', background: '#fff', borderBottom: '1px solid #ebebf0' }}>
          {DOC_TYPE_FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: filter === f.key ? 600 : 400, color: filter === f.key ? '#2563eb' : '#888', background: 'none', borderBottom: filter === f.key ? '2px solid #2563eb' : '2px solid transparent', marginBottom: -1, transition: 'all 0.15s' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 8, color: '#bbb' }}>
              <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 13 }}>加载中...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10 }}>
              <BookOpen size={32} style={{ color: '#ddd' }} />
              <p style={{ fontSize: 14, color: '#bbb' }}>暂无模板</p>
              <button onClick={() => setShowModal(true)}
                style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                新建一个
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filtered.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => { setEditingTemplate(template); setShowModal(true) }}
                  onDelete={() => handleDelete(template.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <NewTemplateModal
          template={editingTemplate}
          onClose={() => { setShowModal(false); setEditingTemplate(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

function TemplateCard({ template, onEdit, onDelete }: {
  template: DraftTemplate
  onEdit: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', borderRadius: 12, border: `1px solid ${hovered ? '#d0d8ff' : '#ebebf0'}`, padding: '18px 20px', cursor: 'default', transition: 'all 0.15s', boxShadow: hovered ? '0 4px 16px rgba(37,99,235,0.08)' : '0 1px 4px rgba(0,0,0,0.04)', position: 'relative' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: '#f0f4ff', color: '#2563eb', fontWeight: 500 }}>
              {DOC_TYPE_LABELS[template.doc_type] || template.doc_type}
            </span>
            {template.is_system && (
              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: '#f5f5f8', color: '#888' }}>内置</span>
            )}
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0, lineHeight: 1.4 }}>{template.title}</h3>
        </div>

        {!template.is_system && hovered && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
            <button onClick={onEdit}
              style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#f5f5f8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              <Pencil size={13} />
            </button>
            <button onClick={onDelete}
              style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#fff0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
        {template.prompt_md}
      </p>
    </div>
  )
}

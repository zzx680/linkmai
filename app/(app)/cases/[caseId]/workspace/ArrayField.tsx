'use client'

import { useState } from 'react'
import type { FormField } from '@/lib/draft-forms/types'
import { Plus, X } from 'lucide-react'

interface Props {
  field: FormField
  items: string[]
  onChange: (items: string[]) => void
}

export default function ArrayField({ field, items, onChange }: Props) {
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    if (!newItem.trim()) return
    if (field.maxItems && items.length >= field.maxItems) return
    onChange([...items, newItem.trim()])
    setNewItem('')
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, value: string) => {
    onChange(items.map((v, i) => i === index ? value : v))
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
        {field.label}
        {field.required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
      </label>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'var(--accent-dim)', color: 'var(--accent-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, flexShrink: 0, marginTop: 8,
            }}>
              {i + 1}
            </span>
            <textarea
              value={item}
              onChange={e => updateItem(i, e.target.value)}
              rows={2}
              className="input-base"
              style={{ resize: 'none', flex: 1, lineHeight: 1.5 }}
            />
            <button
              onClick={() => removeItem(i)}
              style={{
                width: 28, height: 28, borderRadius: 6, marginTop: 6,
                border: '1px solid var(--border-default)', background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-tertiary)', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--border-default)' }}
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Add new item */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        <span style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'var(--bg-elevated)', color: 'var(--text-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, flexShrink: 0, marginTop: 8,
        }}>
          +
        </span>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          <textarea
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addItem() } }}
            placeholder={field.placeholder}
            rows={2}
            className="input-base"
            style={{ resize: 'none', flex: 1, lineHeight: 1.5 }}
          />
          <button
            onClick={addItem}
            disabled={!newItem.trim()}
            style={{
              height: 28, padding: '0 10px', borderRadius: 6,
              border: 'none',
              background: newItem.trim() ? 'var(--accent-500)' : 'var(--bg-elevated)',
              color: newItem.trim() ? '#fff' : 'var(--text-tertiary)',
              cursor: newItem.trim() ? 'pointer' : 'not-allowed',
              fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4,
              flexShrink: 0, marginTop: 8,
              transition: 'all 0.15s',
            }}
          >
            <Plus size={12} />
            添加
          </button>
        </div>
      </div>

      {field.hint && (
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, marginLeft: 28 }}>
          {field.hint}
        </p>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { DocFormSchema, FormData } from '@/lib/draft-forms/types'
import ArrayField from './ArrayField'
import { ChevronLeft, ChevronRight, Wand2 } from 'lucide-react'

interface Props {
  schema: DocFormSchema
  formData: FormData
  onChange: (key: string, value: string | string[]) => void
  onGenerate: () => void
  isGenerating: boolean
  prefilled?: Set<string>
}

export default function StepForm({ schema, formData, onChange, onGenerate, isGenerating, prefilled }: Props) {
  const [step, setStep] = useState(0)
  const totalSteps = schema.steps.length
  const currentStepData = schema.steps[step]

  const isStepValid = () => {
    return currentStepData.fields.every(f => {
      if (!f.required) return true
      const val = formData[f.key]
      if (!val) return false
      if (Array.isArray(val)) return val.length > 0 && val.some(v => v.trim())
      return String(val).trim().length > 0
    })
  }

  const isLastStep = step === totalSteps - 1

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {schema.steps.map((_, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: '100%', height: 3, borderRadius: 2,
                background: i <= step ? 'var(--accent-500)' : 'var(--border-default)',
                transition: 'background 0.2s',
              }} />
              {i === step && (
                <span style={{ fontSize: 11, color: 'var(--accent-500)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {schema.steps[i].title}
                </span>
              )}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
          {step + 1} / {totalSteps}
        </span>
      </div>

      {/* Step title */}
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
        {currentStepData.title}
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>
        {currentStepData.description}
      </p>

      {/* Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {currentStepData.fields.map(field => {
          const value = formData[field.key] ?? ''
          const isPrefilled = prefilled?.has(field.key) && !!value

          if (field.type === 'array') {
            return (
              <div key={field.key} style={{ gridColumn: field.colSpan === 2 ? '1 / -1' : 'auto' }}>
                <ArrayField
                  field={field}
                  items={(value as string[]) || []}
                  onChange={items => onChange(field.key, items)}
                />
              </div>
            )
          }

          if (field.type === 'select') {
            return (
              <div key={field.key} style={{ gridColumn: field.colSpan === 2 ? '1 / -1' : 'auto' }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  {field.label}
                  {field.required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
                </label>
                <select
                  value={value as string}
                  onChange={e => onChange(field.key, e.target.value)}
                  className="input-base"
                  style={{ height: 38 }}
                >
                  <option value="">请选择</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {field.hint && (
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>{field.hint}</p>
                )}
              </div>
            )
          }

          if (field.type === 'textarea') {
            return (
              <div key={field.key} style={{ gridColumn: field.colSpan === 2 ? '1 / -1' : 'auto' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  {field.label}
                  {field.required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
                  {isPrefilled && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#e8f0fe', color: '#2563eb' }}>来自案件</span>}
                </label>
                <textarea
                  value={value as string}
                  onChange={e => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="input-base"
                  style={{ resize: 'vertical', lineHeight: 1.6, ...(isPrefilled ? { background: '#f5f8ff', borderColor: '#c7d9ff' } : {}) }}
                />
                {field.hint && (
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>{field.hint}</p>
                )}
              </div>
            )
          }

          return (
            <div key={field.key} style={{ gridColumn: field.colSpan === 2 ? '1 / -1' : 'auto' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                {field.label}
                {field.required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
                {isPrefilled && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#e8f0fe', color: '#2563eb' }}>来自案件</span>}
              </label>
              <input
                type={field.type === 'date' ? 'date' : 'text'}
                value={value as string}
                onChange={e => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="input-base"
                style={{ height: 38, ...(isPrefilled ? { background: '#f5f8ff', borderColor: '#c7d9ff' } : {}) }}
              />
              {field.hint && (
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>{field.hint}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="btn-outline"
            style={{ height: 38 }}
          >
            <ChevronLeft size={14} />
            上一步
          </button>
        )}

        {isLastStep ? (
          <button
            onClick={onGenerate}
            disabled={!isStepValid() || isGenerating}
            className="btn-primary"
            style={{ height: 38, padding: '0 20px' }}
          >
            <Wand2 size={14} />
            生成文书
          </button>
        ) : (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!isStepValid()}
            className="btn-primary"
            style={{ height: 38, padding: '0 20px' }}
          >
            下一步
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

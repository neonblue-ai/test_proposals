'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { slugify } from '@/lib/utils'

interface ProposalFormProps {
  mode: 'new' | 'edit'
  initialData: Record<string, string>
  onSave: (data: Record<string, string>) => void
  onDelete?: () => void
  saving: boolean
  saveError: string
  saveStatus?: 'idle' | 'saved' | 'saving' | 'error'
}

const EMPTY: Record<string, string> = {
  test_name: '', flow_name: '', canvas_link: '',
  entry_trigger: '', entry_rules: '', exit_rules: '',
  primary_goal: '', secondary_goals: '',
  step_message: '', template_name: '', send_timing: '',
  primary_kpi: '', secondary_kpis: '', guardrails: '',
  test_direction: '', test_hypothesis: '', hypothesis_reasons: '', hypothesis_exclusion: '',
  seg_1: '', seg_2: '', seg_3: '',
  expected_learning_1: '', expected_learning_2: '', expected_learning_3: '',
  next_test_1: '', next_test_2: '', next_test_3: '',
  strategic_angle: '', claims: '', proof_assets: '', message_structure: '',
}

// ─── Icons (outside component so they never re-create) ───────────────────────

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

// ─── Reusable field components (outside ProposalForm to prevent unmount on re-render) ─

interface FieldProps {
  label: string
  placeholder?: string
  optional?: boolean
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function Field({ label, placeholder, optional, value, onChange }: FieldProps) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{optional && <span className="optional">(optional)</span>}
      </label>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

interface TextAreaProps {
  label: string
  placeholder?: string
  optional?: boolean
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

function TextArea({ label, placeholder, optional, value, onChange }: TextAreaProps) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{optional && <span className="optional">(optional)</span>}
      </label>
      <textarea
        className="form-textarea"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

interface SelectProps {
  label: string
  options: string[]
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

function Select({ label, options, value, onChange }: SelectProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select className="form-input form-select" value={value} onChange={onChange}>
        <option value="">Select KPI…</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProposalForm({
  mode, initialData, onSave, onDelete, saving, saveError, saveStatus = 'idle'
}: ProposalFormProps) {
  const [data, setData] = useState<Record<string, string>>({ ...EMPTY, ...initialData })

  const set = useCallback((key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setData((prev) => ({ ...prev, [key]: e.target.value }))
  }, [])

  const slug = slugify(data.test_name || '')

  return (
    <div className="page-proposal">
      <div className="proposal-outer fade-in">

        {/* Header */}
        <div className="proposal-page-header">
          <div className="proposal-page-header-left">
            <div className="proposal-badge">
              <span className="proposal-badge-dot" />
              {mode === 'new' ? 'New Proposal' : 'Edit Proposal'}
              <span className="proposal-badge-dot" />
            </div>
            <h1 className="proposal-page-title">
              {mode === 'new' ? 'Create Test Proposal' : (data.test_name || 'Edit Proposal')}
            </h1>
            <p className="proposal-page-subtitle">
              {mode === 'new'
                ? 'Fill in the details below to propose a new campaign test.'
                : 'Update or review this test proposal.'}
            </p>
          </div>
          <div className="proposal-header-actions">
            {saveStatus === 'saved' && (
              <span className="save-status saved"><CheckIcon /> Saved</span>
            )}
            {saveStatus === 'saving' && (
              <span className="save-status saving">Saving…</span>
            )}
            {saveError && (
              <span className="save-status error">{saveError}</span>
            )}
            <Link href="/" className="btn-back">
              <ArrowLeftIcon />
              All Proposals
            </Link>
            {mode === 'edit' && onDelete && (
              <button
                className="btn-delete"
                onClick={() => {
                  if (confirm('Delete this proposal? This cannot be undone.')) onDelete()
                }}
                title="Delete proposal"
              >
                <TrashIcon />
              </button>
            )}
            <button
              className="btn-save"
              onClick={() => onSave(data)}
              disabled={saving}
            >
              <SaveIcon />
              {saving ? 'Saving…' : 'Save Proposal'}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="proposal-form">

          {/* Test Name — top, dark card */}
          <div className="form-card test-name-card">
            <div className="form-card-header">
              <div className="form-card-icon icon-navy" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <span className="form-card-title">Test Name</span>
            </div>
            <input
              type="text"
              className="test-name-input"
              placeholder="e.g., Behavior-Based Welcome Series"
              value={data.test_name}
              onChange={set('test_name')}
              autoFocus={mode === 'new'}
            />
            {slug && (
              <div className="test-name-slug">/{slug}</div>
            )}
          </div>

          {/* Row 1: Flow Details + Message Spec */}
          <div className="form-two-col">
            {/* Section 1: Flow Details */}
            <div className="form-card">
              <div className="form-card-header">
                <div className="form-card-icon icon-navy">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                    <path d="M18 9a9 9 0 0 1-9 9"/>
                  </svg>
                </div>
                <h2 className="form-card-title">1. Flow Details</h2>
              </div>
              <div className="form-fields">
                <Field label="Flow Name" placeholder="e.g., Behavior-Based Welcome Series" value={data.flow_name || ''} onChange={set('flow_name')} />
                <Field label="Canvas Link" placeholder="https://canvas.neonblue.app/…" value={data.canvas_link || ''} onChange={set('canvas_link')} />
                <div className="form-subheader">Triggers &amp; Rules</div>
                <Field label="Entry Trigger" placeholder="Event / property / segment join" value={data.entry_trigger || ''} onChange={set('entry_trigger')} />
                <Field label="Entry Rules" placeholder="Eligibility, exclusions, cooldowns…" value={data.entry_rules || ''} onChange={set('entry_rules')} />
                <Field label="Exit Rules" placeholder="What removes them" value={data.exit_rules || ''} onChange={set('exit_rules')} />
                <div className="form-subheader">Flow Goals</div>
                <div className="form-row-2">
                  <Field label="Primary Goal" placeholder="Primary objective" value={data.primary_goal || ''} onChange={set('primary_goal')} />
                  <Field label="Secondary Goals" placeholder="Secondary objectives" value={data.secondary_goals || ''} onChange={set('secondary_goals')} />
                </div>
              </div>
            </div>

            {/* Section 2: Message Spec */}
            <div className="form-card">
              <div className="form-card-header">
                <div className="form-card-icon icon-blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <h2 className="form-card-title">2. Message Spec</h2>
              </div>
              <div className="form-fields">
                <Field label="Step / Message" placeholder="e.g., Email 2 / Push 1" value={data.step_message || ''} onChange={set('step_message')} />
                <div className="form-row-2">
                  <Field label="Template" placeholder="Klaviyo/Braze template" value={data.template_name || ''} onChange={set('template_name')} />
                  <Field label="Send Timing" placeholder="Relative delay" value={data.send_timing || ''} onChange={set('send_timing')} />
                </div>
                <div className="form-subheader">Success KPI</div>
                <div className="form-row-2">
                  <Select
                    label="Primary KPI"
                    options={['Clips per User', 'Conversion Rate', 'Click-Through Rate', 'Open Rate', 'Revenue per User', 'Retention Rate']}
                    value={data.primary_kpi || ''}
                    onChange={set('primary_kpi')}
                  />
                  <Field label="Secondary KPIs" placeholder="Other metrics" value={data.secondary_kpis || ''} onChange={set('secondary_kpis')} />
                </div>
                <Field label="Guardrails" placeholder="Unsubscribe, churn, CS tickets…" value={data.guardrails || ''} onChange={set('guardrails')} />
              </div>
            </div>
          </div>

          {/* Section 3: Testing Goals — full width */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-card-icon icon-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <h2 className="form-card-title">3. Testing Goals</h2>
            </div>
            <div className="form-fields">
              <div className="form-row-2">
                <TextArea label="Overall Test Direction" placeholder="What is the theme of this test? (e.g., Persona differentiation, feature-focus)" value={data.test_direction || ''} onChange={set('test_direction')} />
                <TextArea label="Test Hypothesis" placeholder="What exactly are we trying to test?" value={data.test_hypothesis || ''} onChange={set('test_hypothesis')} />
              </div>
              <div className="form-row-2">
                <TextArea label="Hypothesis Reasons" placeholder="What in previous tests or performance informs this hypothesis?" value={data.hypothesis_reasons || ''} onChange={set('hypothesis_reasons')} />
                <TextArea label="Hypothesis Exclusion" placeholder="What could be misinterpreted as the purpose of this test?" optional value={data.hypothesis_exclusion || ''} onChange={set('hypothesis_exclusion')} />
              </div>
            </div>
          </div>

          {/* Row 2: Personalization + Results */}
          <div className="form-two-col">
            {/* Section 4: Personalization */}
            <div className="form-card">
              <div className="form-card-header">
                <div className="form-card-icon icon-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
                    <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
                    <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
                  </svg>
                </div>
                <h2 className="form-card-title">4. Personalization Strategy</h2>
              </div>
              <div className="form-fields">
                <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: 'var(--beige-text-sec)' }}>What variables are we isolating?</p>
                {(['seg_1', 'seg_2', 'seg_3'] as const).map((key, i) => (
                  <div key={key} className="segment-row">
                    <span className="segment-pill">Seg {i + 1}</span>
                    <input type="text" className="form-input" placeholder={`Segmentation ${i + 1}`} value={data[key] || ''} onChange={set(key)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Results & Learning */}
            <div className="form-card">
              <div className="form-card-header">
                <div className="form-card-icon icon-teal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <h2 className="form-card-title">5. Results &amp; Learning Capture</h2>
              </div>
              <div className="form-fields">
                <div className="form-subheader">Expected Learnings</div>
                <Field label="Learning 1" placeholder="Expected Learning 1" value={data.expected_learning_1 || ''} onChange={set('expected_learning_1')} />
                <Field label="Learning 2" placeholder="Expected Learning 2" value={data.expected_learning_2 || ''} onChange={set('expected_learning_2')} />
                <Field label="Learning 3" placeholder="Expected Learning 3" optional value={data.expected_learning_3 || ''} onChange={set('expected_learning_3')} />
                <div className="form-subheader">Next Test Proposals</div>
                <Field label="Follow-up Test 1" placeholder="Follow-up test idea based on learnings" value={data.next_test_1 || ''} onChange={set('next_test_1')} />
                <Field label="Follow-up Test 2" placeholder="Follow-up test idea based on learnings" value={data.next_test_2 || ''} onChange={set('next_test_2')} />
                <Field label="Follow-up Test 3" placeholder="Follow-up test idea based on learnings" optional value={data.next_test_3 || ''} onChange={set('next_test_3')} />
              </div>
            </div>
          </div>

          {/* Section 6: Creative Strategy — full width */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-card-icon icon-navy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
                </svg>
              </div>
              <h2 className="form-card-title">6. Creative Strategy</h2>
            </div>
            <div className="form-fields">
              <div className="form-row-2">
                <TextArea label="Strategic Angle" placeholder="e.g. Problem/Solution, Education, Premium, Social proof, Founder story…" value={data.strategic_angle || ''} onChange={set('strategic_angle')} />
                <TextArea label="Claims" placeholder="Specific product/brand elements we want to include" value={data.claims || ''} onChange={set('claims')} />
              </div>
              <div className="form-row-2">
                <TextArea label="Proof Assets" placeholder="Stats, testimonials, certifications, screenshots, product GIFs…" value={data.proof_assets || ''} onChange={set('proof_assets')} />
                <TextArea label="Message Structure" placeholder="Required messaging structure beyond the template" value={data.message_structure || ''} onChange={set('message_structure')} />
              </div>
            </div>
          </div>

          {/* Bottom save */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, paddingBottom: 24 }}>
            <button className="btn-save" onClick={() => onSave(data)} disabled={saving}>
              <SaveIcon />
              {saving ? 'Saving…' : 'Save Proposal'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { slugify } from '@/lib/utils'

interface ProposalFormProps {
  mode: 'new' | 'edit'
  initialData: Record<string, string>
  onSave: (data: Record<string, string>) => void
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

export default function ProposalForm({
  mode, initialData, onSave, saving, saveError, saveStatus = 'idle'
}: ProposalFormProps) {
  const [data, setData] = useState<Record<string, string>>({ ...EMPTY, ...initialData })

  const set = useCallback((key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setData((prev) => ({ ...prev, [key]: e.target.value }))
  }, [])

  const slug = slugify(data.test_name || '')

  function Field({ label, field, placeholder, optional }: { label: string; field: string; placeholder?: string; optional?: boolean }) {
    return (
      <div className="form-group">
        <label className="form-label">
          {label}{optional && <span className="optional">(optional)</span>}
        </label>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={data[field] || ''}
          onChange={set(field)}
        />
      </div>
    )
  }

  function TextArea({ label, field, placeholder, optional }: { label: string; field: string; placeholder?: string; optional?: boolean }) {
    return (
      <div className="form-group">
        <label className="form-label">
          {label}{optional && <span className="optional">(optional)</span>}
        </label>
        <textarea
          className="form-textarea"
          placeholder={placeholder}
          value={data[field] || ''}
          onChange={set(field)}
        />
      </div>
    )
  }

  function Select({ label, field, options }: { label: string; field: string; options: string[] }) {
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <select className="form-input form-select" value={data[field] || ''} onChange={set(field)}>
          <option value="">Select KPI…</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
    )
  }

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
                <Field label="Flow Name" field="flow_name" placeholder="e.g., Behavior-Based Welcome Series" />
                <Field label="Canvas Link" field="canvas_link" placeholder="https://canvas.neonblue.app/…" />
                <div className="form-subheader">Triggers & Rules</div>
                <Field label="Entry Trigger" field="entry_trigger" placeholder="Event / property / segment join" />
                <Field label="Entry Rules" field="entry_rules" placeholder="Eligibility, exclusions, cooldowns…" />
                <Field label="Exit Rules" field="exit_rules" placeholder="What removes them" />
                <div className="form-subheader">Flow Goals</div>
                <div className="form-row-2">
                  <Field label="Primary Goal" field="primary_goal" placeholder="Primary objective" />
                  <Field label="Secondary Goals" field="secondary_goals" placeholder="Secondary objectives" />
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
                <Field label="Step / Message" field="step_message" placeholder="e.g., Email 2 / Push 1" />
                <div className="form-row-2">
                  <Field label="Template" field="template_name" placeholder="Klaviyo/Braze template" />
                  <Field label="Send Timing" field="send_timing" placeholder="Relative delay" />
                </div>
                <div className="form-subheader">Success KPI</div>
                <div className="form-row-2">
                  <Select
                    label="Primary KPI"
                    field="primary_kpi"
                    options={['Clips per User', 'Conversion Rate', 'Click-Through Rate', 'Open Rate', 'Revenue per User', 'Retention Rate']}
                  />
                  <Field label="Secondary KPIs" field="secondary_kpis" placeholder="Other metrics" />
                </div>
                <Field label="Guardrails" field="guardrails" placeholder="Unsubscribe, churn, CS tickets…" />
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
                <TextArea label="Overall Test Direction" field="test_direction" placeholder="What is the theme of this test? (e.g., Persona differentiation, feature-focus)" />
                <TextArea label="Test Hypothesis" field="test_hypothesis" placeholder="What exactly are we trying to test?" />
              </div>
              <div className="form-row-2">
                <TextArea label="Hypothesis Reasons" field="hypothesis_reasons" placeholder="What in previous tests or performance informs this hypothesis?" />
                <TextArea label="Hypothesis Exclusion" field="hypothesis_exclusion" placeholder="What could be misinterpreted as the purpose of this test?" optional />
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
                <h2 className="form-card-title">5. Results & Learning Capture</h2>
              </div>
              <div className="form-fields">
                <div className="form-subheader">Expected Learnings</div>
                <Field label="Learning 1" field="expected_learning_1" placeholder="Expected Learning 1" />
                <Field label="Learning 2" field="expected_learning_2" placeholder="Expected Learning 2" />
                <Field label="Learning 3" field="expected_learning_3" placeholder="Expected Learning 3" optional />
                <div className="form-subheader">Next Test Proposals</div>
                <Field label="Follow-up Test 1" field="next_test_1" placeholder="Follow-up test idea based on learnings" />
                <Field label="Follow-up Test 2" field="next_test_2" placeholder="Follow-up test idea based on learnings" />
                <Field label="Follow-up Test 3" field="next_test_3" placeholder="Follow-up test idea based on learnings" optional />
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
                <TextArea label="Strategic Angle" field="strategic_angle" placeholder="e.g. Problem/Solution, Education, Premium, Social proof, Founder story…" />
                <TextArea label="Claims" field="claims" placeholder="Specific product/brand elements we want to include" />
              </div>
              <div className="form-row-2">
                <TextArea label="Proof Assets" field="proof_assets" placeholder="Stats, testimonials, certifications, screenshots, product GIFs…" />
                <TextArea label="Message Structure" field="message_structure" placeholder="Required messaging structure beyond the template" />
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

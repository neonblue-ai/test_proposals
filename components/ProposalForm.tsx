'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { slugify } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreativeEntries {
  h1: string
  subject: string
  preview: string
  body: string
  cta: string
  cta_url: string
}

const EMPTY_CREATIVE: CreativeEntries = {
  h1: '', subject: '', preview: '', body: '', cta: '', cta_url: '',
}

export interface Step {
  id: string
  label: string
  // Message Spec
  template_name: string
  guardrails: string
  // Personalization — dynamic array
  segmentations: string[]
  // Creative Strategy
  strategic_angle: string
  detailed_creative_direction: string
  creative_entries: CreativeEntries
  // Rules
  rules: string[]
}

const EMPTY_STEP: Omit<Step, 'id' | 'label'> = {
  template_name: '', guardrails: '',
  segmentations: [''],
  strategic_angle: '', detailed_creative_direction: '',
  creative_entries: { ...EMPTY_CREATIVE },
  rules: [''],
}

function newStep(index: number): Step {
  return { id: crypto.randomUUID(), label: `Message ${index + 1}`, ...EMPTY_STEP, segmentations: [''], creative_entries: { ...EMPTY_CREATIVE }, rules: [''] }
}

interface ProposalFormProps {
  mode: 'new' | 'edit'
  initialData: Record<string, unknown>
  onSave: (data: Record<string, unknown>) => void
  onDelete?: () => void
  saving: boolean
  saveError: string
  saveStatus?: 'idle' | 'saved' | 'saving' | 'error'
}

// ─── Field components ─────────────────────────────────────────────────────────

interface FieldProps {
  label: string; placeholder?: string; optional?: boolean
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
function Field({ label, placeholder, optional, value, onChange }: FieldProps) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{optional && <span className="optional">(optional)</span>}
      </label>
      <input type="text" className="form-input" placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  )
}

interface TextAreaProps {
  label: string; placeholder?: string; optional?: boolean
  value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}
function TextArea({ label, placeholder, optional, value, onChange }: TextAreaProps) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{optional && <span className="optional">(optional)</span>}
      </label>
      <textarea className="form-textarea" placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SaveIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
}
function ArrowLeftIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
}
function TrashIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
}
function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
}
function ChevronIcon({ open }: { open: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: 16, height: 16, transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
}

// ─── Collapsible Section ──────────────────────────────────────────────────────

function CollapsibleCard({ title, icon, iconClass, children, defaultOpen = false, optional = false }: {
  title: string; icon: React.ReactNode; iconClass: string; children: React.ReactNode; defaultOpen?: boolean; optional?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`form-card ${optional && !open ? 'form-card-optional' : ''}`}>
      <div className="form-card-header form-card-header-clickable" onClick={() => setOpen(o => !o)}>
        <div className={`form-card-icon ${iconClass}`}>{icon}</div>
        <h2 className="form-card-title">{title}</h2>
        {optional && <span className="optional-badge">Optional</span>}
        <div style={{ marginLeft: 'auto' }}><ChevronIcon open={open} /></div>
      </div>
      {open && <div className="form-fields">{children}</div>}
    </div>
  )
}

// ─── Step Collapsible Section ──────────────────────────────────────────────────

function StepCollapsible({ label, dotClass, optional = false, children }: {
  label: string; dotClass: string; optional?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`step-section ${!open ? 'step-section-collapsed' : ''}`}>
      <div className="step-section-label step-section-label-clickable" onClick={() => setOpen(o => !o)}>
        <span className={`step-section-dot ${dotClass}`} />
        {label}
        {optional && <span className="optional-badge">Optional</span>}
        <div style={{ marginLeft: 'auto' }}><ChevronIcon open={open} /></div>
      </div>
      {open && children}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const PROPOSAL_FIELDS = [
  'test_name', 'flow_name', 'canvas_link', 'entry_trigger', 'entry_rules', 'exit_rules',
  'primary_goal', 'secondary_goals', 'test_direction', 'test_hypothesis',
  'hypothesis_reasons', 'hypothesis_exclusion',
  'expected_learning_1', 'expected_learning_2', 'expected_learning_3',
  'next_test_1', 'next_test_2', 'next_test_3',
]

type ProposalData = Record<string, string>

export default function ProposalForm({
  mode, initialData, onSave, onDelete, saving, saveError, saveStatus = 'idle'
}: ProposalFormProps) {
  const [data, setData] = useState<ProposalData>(() => {
    const d: ProposalData = {}
    for (const f of PROPOSAL_FIELDS) d[f] = (initialData[f] as string) ?? ''
    return d
  })

  const [steps, setSteps] = useState<Step[]>(() => {
    const raw = initialData.steps
    if (Array.isArray(raw) && raw.length > 0) {
      // Migrate old steps that don't have new fields
      return (raw as Record<string, unknown>[]).map(s => {
        const old = s as Record<string, unknown>
        const segs = (old.segmentations as string[]) ||
          [old.seg_1 as string || '', old.seg_2 as string || '', old.seg_3 as string || ''].filter(Boolean)
        return {
          ...newStep(0),
          ...s,
          segmentations: segs.length > 0 ? segs : [''],
          creative_entries: (old.creative_entries as CreativeEntries) || { ...EMPTY_CREATIVE },
          detailed_creative_direction: (old.detailed_creative_direction as string) || '',
          rules: (old.rules as string[]) || [''],
        } as Step
      })
    }
    return [newStep(0)]
  })

  const [activeStepIndex, setActiveStepIndex] = useState(0)

  const set = useCallback((key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setData((prev) => ({ ...prev, [key]: e.target.value })), [])

  const setStep = useCallback((id: string, key: keyof Step) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setSteps((prev) => prev.map((s) => s.id === id ? { ...s, [key]: e.target.value } : s)), [])

  const setStepCreative = useCallback((id: string, key: keyof CreativeEntries) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setSteps((prev) => prev.map((s) => s.id === id ? { ...s, creative_entries: { ...s.creative_entries, [key]: e.target.value } } : s)), [])

  const addSegmentation = (id: string) => setSteps(prev => prev.map(s =>
    s.id === id ? { ...s, segmentations: [...s.segmentations, ''] } : s
  ))

  const updateSegmentation = (id: string, index: number, value: string) => setSteps(prev => prev.map(s =>
    s.id === id ? { ...s, segmentations: s.segmentations.map((seg, i) => i === index ? value : seg) } : s
  ))

  const removeSegmentation = (id: string, index: number) => setSteps(prev => prev.map(s =>
    s.id === id ? { ...s, segmentations: s.segmentations.filter((_, i) => i !== index) } : s
  ))

  const addRule = (id: string) => setSteps(prev => prev.map(s =>
    s.id === id ? { ...s, rules: [...s.rules, ''] } : s
  ))

  const updateRule = (id: string, index: number, value: string) => setSteps(prev => prev.map(s =>
    s.id === id ? { ...s, rules: s.rules.map((r, i) => i === index ? value : r) } : s
  ))

  const removeRule = (id: string, index: number) => setSteps(prev => prev.map(s =>
    s.id === id ? { ...s, rules: s.rules.filter((_, i) => i !== index) } : s
  ))

  const addStep = () => {
    setSteps(prev => [...prev, newStep(prev.length)])
    setActiveStepIndex(steps.length)
  }
  const removeStep = (id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id))
    setActiveStepIndex(i => Math.max(0, i - 1))
  }

  const slug = slugify(data.test_name || '')

  function handleSave() {
    onSave({ ...data, steps })
  }

  const activeStep = steps[activeStepIndex] || steps[0]

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
              {mode === 'new' ? 'Fill in the details below to propose a new campaign test.' : 'Update or review this test proposal.'}
            </p>
          </div>
          <div className="proposal-header-actions">
            {saveStatus === 'saved' && <span className="save-status saved"><CheckIcon /> Saved</span>}
            {saveStatus === 'saving' && <span className="save-status saving">Saving…</span>}
            {saveError && <span className="save-status error">{saveError}</span>}
            <Link href="/" className="btn-back"><ArrowLeftIcon /> All Proposals</Link>
            {mode === 'edit' && onDelete && (
              <button className="btn-delete" onClick={() => { if (confirm('Delete this proposal? This cannot be undone.')) onDelete() }} title="Delete proposal">
                <TrashIcon />
              </button>
            )}
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              <SaveIcon />{saving ? 'Saving…' : 'Save Proposal'}
            </button>
          </div>
        </div>

        <div className="proposal-form">

          {/* Test Name */}
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
            <input type="text" className="test-name-input" placeholder="e.g., Behavior-Based Welcome Series"
              value={data.test_name} onChange={set('test_name')} autoFocus={mode === 'new'} />
            {slug && <div className="test-name-slug">/{slug}</div>}
          </div>

          {/* Section 1: Flow Details — collapsible */}
          <CollapsibleCard
            title="1. Flow Details"
            iconClass="icon-navy"
            optional
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>}
          >
            <div className="form-row-2">
              <Field label="Flow Name" placeholder="e.g., Behavior-Based Welcome Series" value={data.flow_name} onChange={set('flow_name')} />
              <Field label="Canvas Link" placeholder="https://canvas.neonblue.app/…" value={data.canvas_link} onChange={set('canvas_link')} />
            </div>
            <div className="form-subheader">Triggers &amp; Rules</div>
            <div className="form-row-2">
              <Field label="Entry Trigger" placeholder="Event / property / segment join" value={data.entry_trigger} onChange={set('entry_trigger')} />
              <Field label="Entry Rules" placeholder="Eligibility, exclusions, cooldowns…" value={data.entry_rules} onChange={set('entry_rules')} />
            </div>
            <Field label="Exit Rules" placeholder="What removes them from the flow" value={data.exit_rules} onChange={set('exit_rules')} />
            <div className="form-subheader">Flow Goals</div>
            <div className="form-row-2">
              <Field label="Primary Goal" placeholder="Primary objective" value={data.primary_goal} onChange={set('primary_goal')} />
              <Field label="Secondary Goals" placeholder="Secondary objectives" value={data.secondary_goals} onChange={set('secondary_goals')} />
            </div>
          </CollapsibleCard>

          {/* Section 2: Testing Goals — collapsible */}
          <CollapsibleCard
            title="2. Testing Goals"
            iconClass="icon-purple"
            optional
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}
          >
            <div className="form-row-2">
              <TextArea label="Overall Test Direction" placeholder="What is the theme of this test?" value={data.test_direction} onChange={set('test_direction')} />
              <TextArea label="Test Hypothesis" placeholder="What exactly are we trying to test?" value={data.test_hypothesis} onChange={set('test_hypothesis')} />
            </div>
            <div className="form-row-2">
              <TextArea label="Hypothesis Reasons" placeholder="What in previous tests informs this hypothesis?" value={data.hypothesis_reasons} onChange={set('hypothesis_reasons')} />
              <TextArea label="Hypothesis Exclusion" placeholder="What could be misinterpreted?" optional value={data.hypothesis_exclusion} onChange={set('hypothesis_exclusion')} />
            </div>
          </CollapsibleCard>

          {/* Section 3: Results & Learning — collapsible */}
          <CollapsibleCard
            title="3. Results & Learning Capture"
            iconClass="icon-teal"
            optional
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
          >
            <div className="form-subheader">Expected Learnings</div>
            <div className="form-row-2">
              <Field label="Learning 1" placeholder="Expected Learning 1" value={data.expected_learning_1} onChange={set('expected_learning_1')} />
              <Field label="Learning 2" placeholder="Expected Learning 2" value={data.expected_learning_2} onChange={set('expected_learning_2')} />
            </div>
            <Field label="Learning 3" placeholder="Expected Learning 3" optional value={data.expected_learning_3} onChange={set('expected_learning_3')} />
            <div className="form-subheader">Next Test Proposals</div>
            <div className="form-row-2">
              <Field label="Follow-up Test 1" placeholder="Follow-up test idea" value={data.next_test_1} onChange={set('next_test_1')} />
              <Field label="Follow-up Test 2" placeholder="Follow-up test idea" value={data.next_test_2} onChange={set('next_test_2')} />
            </div>
            <Field label="Follow-up Test 3" placeholder="Follow-up test idea" optional value={data.next_test_3} onChange={set('next_test_3')} />
          </CollapsibleCard>

          {/* Section 4: Creative Strategy — wraps message steps */}
          <div className="form-card creative-strategy-card">
            <div className="form-card-header">
              <div className="form-card-icon icon-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h2 className="form-card-title">4. Creative Strategy</h2>
            </div>

            <div className="steps-section">
              <div className="steps-section-header">
                <p className="steps-section-subtitle">Add a message for each email, push, or SMS in the flow</p>
                <button className="btn-add-step" onClick={addStep}>
                  <PlusIcon /> Add Message
                </button>
              </div>

              {/* Step tabs */}
              <div className="step-tabs">
                {steps.map((step, i) => (
                  <button
                    key={step.id}
                    className={`step-tab ${i === activeStepIndex ? 'active' : ''}`}
                    onClick={() => setActiveStepIndex(i)}
                  >
                    <span className="step-tab-number">{i + 1}</span>
                    {step.label || `Message ${i + 1}`}
                  </button>
                ))}
              </div>

              {/* Active step content */}
              {activeStep && (
                <div className="step-card">
                  <div className="step-card-header">
                    <div className="step-number">{activeStepIndex + 1}</div>
                    <input
                      type="text"
                      className="step-label-input"
                      value={activeStep.label}
                      onChange={setStep(activeStep.id, 'label')}
                      placeholder="e.g., Email 1, Push 2…"
                    />
                    {steps.length > 1 && (
                      <button className="step-remove-btn" onClick={() => removeStep(activeStep.id)} title="Remove step">
                        <TrashIcon />
                      </button>
                    )}
                  </div>

                  <div className="step-card-body">
                    {/* Message Spec — optional, collapsible */}
                    <StepCollapsible label="Message Spec" dotClass="dot-blue" optional>
                      <div className="form-fields">
                        <Field label="Template" placeholder="Klaviyo/Braze template name" value={activeStep.template_name} onChange={setStep(activeStep.id, 'template_name')} />
                        <Field label="Guardrails" placeholder="Unsubscribes, churn signals, CS tickets…" value={activeStep.guardrails} onChange={setStep(activeStep.id, 'guardrails')} />
                      </div>
                    </StepCollapsible>

                    <div className="step-section">
                      <div className="form-fields">
                        <div className="form-subheader">Strategic Direction</div>
                        <TextArea label="Strategic Angle" placeholder="e.g. Problem/Solution, Education, Premium, Social proof…" value={activeStep.strategic_angle} onChange={setStep(activeStep.id, 'strategic_angle')} />
                        <TextArea label="Detailed Creative Direction" placeholder="Specific direction for copy, tone, and structure…" value={activeStep.detailed_creative_direction} onChange={setStep(activeStep.id, 'detailed_creative_direction')} />

                        {/* Personalization Strategy — segmentations */}
                        <div className="form-subheader">Personalization Strategy</div>
                        <p style={{ margin: '-8px 0 8px', fontSize: '0.85rem', color: 'var(--beige-text-sec)' }}>Segmentations being isolated in this step</p>
                        {activeStep.segmentations.map((seg, si) => (
                          <div key={si} className="segment-row">
                            <span className="segment-pill">Seg {si + 1}</span>
                            <input
                              type="text"
                              className="form-input"
                              placeholder={`Segmentation ${si + 1}`}
                              value={seg}
                              onChange={(e) => updateSegmentation(activeStep.id, si, e.target.value)}
                            />
                            {activeStep.segmentations.length > 1 && (
                              <button className="seg-remove-btn" onClick={() => removeSegmentation(activeStep.id, si)} title="Remove">
                                &times;
                              </button>
                            )}
                          </div>
                        ))}
                        <button className="btn-add-seg" onClick={() => addSegmentation(activeStep.id)}>
                          <PlusIcon /> Add Segmentation
                        </button>

                        <div className="form-subheader">Creative Entries</div>
                        <div className="form-row-2">
                          <Field label="Subject Direction" placeholder="Direction for subject line, e.g. urgency-driven, question-based…" value={activeStep.creative_entries.subject} onChange={setStepCreative(activeStep.id, 'subject')} />
                          <Field label="Preview Direction" placeholder="Direction for preview text, e.g. complement subject, tease content…" value={activeStep.creative_entries.preview} onChange={setStepCreative(activeStep.id, 'preview')} />
                        </div>
                        <Field label="H1 Direction" placeholder="Direction for headline, e.g. benefit-led, persona-specific…" value={activeStep.creative_entries.h1} onChange={setStepCreative(activeStep.id, 'h1')} />
                        <TextArea label="Body" placeholder="Email body content direction" value={activeStep.creative_entries.body} onChange={setStepCreative(activeStep.id, 'body')} />
                        <div className="form-row-2">
                          <Field label="CTA Direction" placeholder="Direction for CTA, e.g. action-oriented, low-commitment…" value={activeStep.creative_entries.cta} onChange={setStepCreative(activeStep.id, 'cta')} />
                          <Field label="CTA URL" placeholder="https://…" value={activeStep.creative_entries.cta_url} onChange={setStepCreative(activeStep.id, 'cta_url')} />
                        </div>

                        <div className="form-subheader">Rules</div>
                        <p style={{ margin: '-8px 0 8px', fontSize: '0.85rem', color: 'var(--beige-text-sec)' }}>Additional rules on top of existing hard rules</p>
                        {activeStep.rules.map((rule, ri) => (
                          <div key={ri} className="segment-row">
                            <span className="segment-pill" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>Rule {ri + 1}</span>
                            <input
                              type="text"
                              className="form-input"
                              placeholder={`e.g. No discount language, Max 2 CTAs…`}
                              value={rule}
                              onChange={(e) => updateRule(activeStep.id, ri, e.target.value)}
                            />
                            {activeStep.rules.length > 1 && (
                              <button className="seg-remove-btn" onClick={() => removeRule(activeStep.id, ri)} title="Remove">
                                &times;
                              </button>
                            )}
                          </div>
                        ))}
                        <button className="btn-add-seg" onClick={() => addRule(activeStep.id)}>
                          <PlusIcon /> Add Rule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom save */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, paddingBottom: 24 }}>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              <SaveIcon />{saving ? 'Saving…' : 'Save Proposal'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

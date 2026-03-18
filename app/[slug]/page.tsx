'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProposalForm from '@/components/ProposalForm'

export default function ProposalPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()

  const [initialData, setInitialData] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving' | 'error'>('idle')

  useEffect(() => {
    fetch(`/api/proposals/${slug}`)
      .then((r) => {
        if (r.status === 404) { router.push('/'); return null }
        return r.json()
      })
      .then((data) => {
        if (data) setInitialData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug, router])

  async function handleSave(data: Record<string, string>) {
    setSaving(true)
    setSaveStatus('saving')
    setSaveError('')
    try {
      const res = await fetch(`/api/proposals/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to save')
      }
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save')
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await fetch(`/api/proposals/${slug}`, { method: 'DELETE' })
      router.push('/')
    } catch {
      // silently fail — user stays on page
    }
  }

  if (loading) {
    return (
      <div className="page-proposal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: 'rgba(12,22,40,0.3)', fontSize: '0.9rem' }}>Loading…</div>
      </div>
    )
  }

  if (!initialData) return null

  return (
    <ProposalForm
      mode="edit"
      initialData={initialData}
      onSave={handleSave}
      onDelete={handleDelete}
      saving={saving}
      saveError={saveError}
      saveStatus={saveStatus}
    />
  )
}

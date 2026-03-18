'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProposalForm from '@/components/ProposalForm'
import { slugify } from '@/lib/utils'

export default function NewProposalPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(data: Record<string, unknown>) {
    if (!(data.test_name as string)?.trim()) {
      setError('Please enter a test name before saving.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to save')
      }
      const proposal = await res.json()
      router.push(`/${proposal.slug}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save proposal')
      setSaving(false)
    }
  }

  return (
    <ProposalForm
      mode="new"
      initialData={{}}
      onSave={handleSave}
      saving={saving}
      saveError={error}
    />
  )
}

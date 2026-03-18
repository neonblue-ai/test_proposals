import { sql, initDb } from '@/lib/db'
import Link from 'next/link'
import { auth } from '@/auth'
import { signOut } from '@/auth'

interface Proposal {
  id: number
  slug: string
  test_name: string
  created_at: string
  created_by: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

export default async function HomePage() {
  await initDb()
  const session = await auth()

  let proposals: Proposal[] = []
  try {
    proposals = await sql`
      SELECT id, slug, test_name, created_at, created_by
      FROM proposals
      ORDER BY created_at DESC
    ` as Proposal[]
  } catch { /* handled gracefully */ }

  return (
    <div className="page-home">
      {/* Background effects */}
      <div className="home-bg">
        <div className="home-grid-overlay" />
        <div className="home-glow top-left" />
        <div className="home-glow bottom-right" />
      </div>

      <div className="home-container fade-in">
        {/* Header */}
        <header className="home-header">
          <div className="home-badge">
            <span className="home-badge-dot" />
            Neonblue × Suno
            <span className="home-badge-dot" />
          </div>
          <h1 className="home-title">Test Proposals</h1>
          <p className="home-subtitle">
            Campaign test proposals — {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} total
          </p>
        </header>

        {/* Top bar */}
        <div className="home-topbar">
          <span className="home-topbar-label">All Proposals</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {session?.user && (
              <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }) }}>
                <button type="submit" style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.8rem', cursor: 'pointer', padding: '8px 12px',
                  fontFamily: 'inherit'
                }}>
                  Sign out
                </button>
              </form>
            )}
            <Link href="/new" className="btn-new">
              <PlusIcon />
              New Proposal
            </Link>
          </div>
        </div>

        {/* List */}
        {proposals.length === 0 ? (
          <div className="empty-state">
            <FileIcon />
            <p>No proposals yet. Create your first one.</p>
          </div>
        ) : (
          <div className="proposal-list">
            {proposals.map((p) => (
              <Link key={p.id} href={`/${p.slug}`} className="proposal-card">
                <div className="proposal-card-left">
                  <span className="proposal-card-name">{p.test_name}</span>
                  <div className="proposal-card-meta">
                    <span>{formatDate(p.created_at)}</span>
                    {p.created_by && (
                      <>
                        <span className="sep">·</span>
                        <span>{p.created_by}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="proposal-card-arrow" style={{ width: 20, height: 20 }}>
                  <ArrowRight />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

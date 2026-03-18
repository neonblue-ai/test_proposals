import { NextRequest, NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'
import { auth } from '@/auth'
import { slugify } from '@/lib/utils'

// GET /api/proposals — list all
export async function GET() {
  try {
    await initDb()
    const proposals = await sql`
      SELECT id, slug, test_name, created_at, updated_at, created_by
      FROM proposals
      ORDER BY created_at DESC
    `
    return NextResponse.json(proposals)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
  }
}

// POST /api/proposals — create new
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await initDb()
    const body = await req.json()
    const { test_name, ...rest } = body

    if (!test_name?.trim()) {
      return NextResponse.json({ error: 'test_name is required' }, { status: 400 })
    }

    let slug = slugify(test_name)
    // Ensure uniqueness
    const existing = await sql`SELECT slug FROM proposals WHERE slug LIKE ${slug + '%'}`
    if (existing.length > 0) {
      slug = `${slug}-${existing.length + 1}`
    }

    const [proposal] = await sql`
      INSERT INTO proposals (
        slug, test_name, created_by,
        flow_name, canvas_link, entry_trigger, entry_rules, exit_rules, primary_goal, secondary_goals,
        step_message, template_name, send_timing, primary_kpi, secondary_kpis, guardrails,
        test_direction, test_hypothesis, hypothesis_reasons, hypothesis_exclusion,
        seg_1, seg_2, seg_3,
        expected_learning_1, expected_learning_2, expected_learning_3,
        next_test_1, next_test_2, next_test_3,
        strategic_angle, claims, proof_assets, message_structure
      ) VALUES (
        ${slug}, ${test_name}, ${session.user?.email ?? ''},
        ${rest.flow_name ?? ''}, ${rest.canvas_link ?? ''}, ${rest.entry_trigger ?? ''},
        ${rest.entry_rules ?? ''}, ${rest.exit_rules ?? ''}, ${rest.primary_goal ?? ''}, ${rest.secondary_goals ?? ''},
        ${rest.step_message ?? ''}, ${rest.template_name ?? ''}, ${rest.send_timing ?? ''},
        ${rest.primary_kpi ?? ''}, ${rest.secondary_kpis ?? ''}, ${rest.guardrails ?? ''},
        ${rest.test_direction ?? ''}, ${rest.test_hypothesis ?? ''}, ${rest.hypothesis_reasons ?? ''}, ${rest.hypothesis_exclusion ?? ''},
        ${rest.seg_1 ?? ''}, ${rest.seg_2 ?? ''}, ${rest.seg_3 ?? ''},
        ${rest.expected_learning_1 ?? ''}, ${rest.expected_learning_2 ?? ''}, ${rest.expected_learning_3 ?? ''},
        ${rest.next_test_1 ?? ''}, ${rest.next_test_2 ?? ''}, ${rest.next_test_3 ?? ''},
        ${rest.strategic_angle ?? ''}, ${rest.claims ?? ''}, ${rest.proof_assets ?? ''}, ${rest.message_structure ?? ''}
      )
      RETURNING *
    `
    return NextResponse.json(proposal, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 })
  }
}

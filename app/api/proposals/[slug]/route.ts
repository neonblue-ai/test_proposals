import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { auth } from '@/auth'

interface RouteParams {
  params: Promise<{ slug: string }>
}

// GET /api/proposals/[slug]
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  try {
    const [proposal] = await sql`SELECT * FROM proposals WHERE slug = ${slug}`
    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(proposal)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 })
  }
}

// PUT /api/proposals/[slug]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  try {
    const body = await req.json()
    const [proposal] = await sql`
      UPDATE proposals SET
        test_name = ${body.test_name ?? ''},
        flow_name = ${body.flow_name ?? ''},
        canvas_link = ${body.canvas_link ?? ''},
        entry_trigger = ${body.entry_trigger ?? ''},
        entry_rules = ${body.entry_rules ?? ''},
        exit_rules = ${body.exit_rules ?? ''},
        primary_goal = ${body.primary_goal ?? ''},
        secondary_goals = ${body.secondary_goals ?? ''},
        step_message = ${body.step_message ?? ''},
        template_name = ${body.template_name ?? ''},
        send_timing = ${body.send_timing ?? ''},
        primary_kpi = ${body.primary_kpi ?? ''},
        secondary_kpis = ${body.secondary_kpis ?? ''},
        guardrails = ${body.guardrails ?? ''},
        test_direction = ${body.test_direction ?? ''},
        test_hypothesis = ${body.test_hypothesis ?? ''},
        hypothesis_reasons = ${body.hypothesis_reasons ?? ''},
        hypothesis_exclusion = ${body.hypothesis_exclusion ?? ''},
        seg_1 = ${body.seg_1 ?? ''},
        seg_2 = ${body.seg_2 ?? ''},
        seg_3 = ${body.seg_3 ?? ''},
        expected_learning_1 = ${body.expected_learning_1 ?? ''},
        expected_learning_2 = ${body.expected_learning_2 ?? ''},
        expected_learning_3 = ${body.expected_learning_3 ?? ''},
        next_test_1 = ${body.next_test_1 ?? ''},
        next_test_2 = ${body.next_test_2 ?? ''},
        next_test_3 = ${body.next_test_3 ?? ''},
        strategic_angle = ${body.strategic_angle ?? ''},
        claims = ${body.claims ?? ''},
        proof_assets = ${body.proof_assets ?? ''},
        message_structure = ${body.message_structure ?? ''},
        updated_at = NOW()
      WHERE slug = ${slug}
      RETURNING *
    `
    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(proposal)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 })
  }
}

// DELETE /api/proposals/[slug]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  try {
    await sql`DELETE FROM proposals WHERE slug = ${slug}`
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete proposal' }, { status: 500 })
  }
}

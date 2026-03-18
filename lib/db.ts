import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export { sql }

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS proposals (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      test_name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by TEXT,

      -- 1. Flow Details
      flow_name TEXT DEFAULT '',
      canvas_link TEXT DEFAULT '',
      entry_trigger TEXT DEFAULT '',
      entry_rules TEXT DEFAULT '',
      exit_rules TEXT DEFAULT '',
      primary_goal TEXT DEFAULT '',
      secondary_goals TEXT DEFAULT '',

      -- 2. Message Spec
      step_message TEXT DEFAULT '',
      template_name TEXT DEFAULT '',
      send_timing TEXT DEFAULT '',
      primary_kpi TEXT DEFAULT '',
      secondary_kpis TEXT DEFAULT '',
      guardrails TEXT DEFAULT '',

      -- 3. Testing Goals
      test_direction TEXT DEFAULT '',
      test_hypothesis TEXT DEFAULT '',
      hypothesis_reasons TEXT DEFAULT '',
      hypothesis_exclusion TEXT DEFAULT '',

      -- 4. Personalization Strategy
      seg_1 TEXT DEFAULT '',
      seg_2 TEXT DEFAULT '',
      seg_3 TEXT DEFAULT '',

      -- 5. Results & Learning Capture
      expected_learning_1 TEXT DEFAULT '',
      expected_learning_2 TEXT DEFAULT '',
      expected_learning_3 TEXT DEFAULT '',
      next_test_1 TEXT DEFAULT '',
      next_test_2 TEXT DEFAULT '',
      next_test_3 TEXT DEFAULT '',

      -- 6. Creative Strategy
      strategic_angle TEXT DEFAULT '',
      claims TEXT DEFAULT '',
      proof_assets TEXT DEFAULT '',
      message_structure TEXT DEFAULT ''
    )
  `
}

import pool from './pool';

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS pipelines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        definition JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'queued',
        started_at TIMESTAMP,
        finished_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS step_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
        step_id TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'queued',
        started_at TIMESTAMP,
        finished_at TIMESTAMP,
        exit_code INTEGER
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id BIGSERIAL PRIMARY KEY,
        step_run_id UUID REFERENCES step_runs(id) ON DELETE CASCADE,
        line TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Migration complete — all tables created');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed, rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
};

migrate();
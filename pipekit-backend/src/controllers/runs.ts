import { Request, Response, NextFunction } from 'express';
import pool from '../db/pool';
import redis from '../redis/client';
import { Run, StepRun, Pipeline } from '../types';

// POST /api/pipelines/:id/runs
export const triggerRun = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect();

  try {
    const { id: pipeline_id } = req.params;

    // 1. Fetch the pipeline
    const pipelineResult = await client.query<Pipeline>(
      'SELECT * FROM pipelines WHERE id = $1',
      [pipeline_id]
    );

    if (pipelineResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Pipeline not found' });
      return;
    }

    const pipeline = pipelineResult.rows[0];

    await client.query('BEGIN');

    // 2. Create the run row
    const runResult = await client.query<Run>(
      `INSERT INTO runs (pipeline_id, status)
       VALUES ($1, 'queued')
       RETURNING *`,
      [pipeline_id]
    );

    const run = runResult.rows[0];

    // 3. Create a step_run row for each step node
    const stepNodes = pipeline.definition.nodes.filter(
      (node) => node.type === 'step'
    );

    const stepRuns: StepRun[] = [];

    for (const node of stepNodes) {
      const stepRunResult = await client.query<StepRun>(
        `INSERT INTO step_runs (run_id, step_id, name, status)
         VALUES ($1, $2, $3, 'queued')
         RETURNING *`,
        [run.id, node.id, node.data.name]
      );
      stepRuns.push(stepRunResult.rows[0]);
    }

    await client.query('COMMIT');

    // 4. Push job to Redis queue for the Go worker
    const job = {
      run_id: run.id,
      pipeline_id: pipeline.id,
      definition: pipeline.definition,
    };

    await redis.lpush('pipeline_runs', JSON.stringify(job));

    res.status(201).json({
      success: true,
      data: { run, stepRuns },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// GET /api/runs/:id
export const getRun = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const runResult = await pool.query<Run>(
      'SELECT * FROM runs WHERE id = $1',
      [id]
    );

    if (runResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Run not found' });
      return;
    }

    const stepRunsResult = await pool.query<StepRun>(
      'SELECT * FROM step_runs WHERE run_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.json({
      success: true,
      data: {
        run: runResult.rows[0],
        stepRuns: stepRunsResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/runs/:id/logs/:stepId
export const getStepLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: run_id, stepId: step_id } = req.params;

    // Find the step_run first
    const stepRunResult = await pool.query<StepRun>(
      'SELECT * FROM step_runs WHERE run_id = $1 AND step_id = $2',
      [run_id, step_id]
    );

    if (stepRunResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Step run not found' });
      return;
    }

    const stepRun = stepRunResult.rows[0];

    // Fetch logs for that step_run
    const logsResult = await pool.query(
      'SELECT line, created_at FROM logs WHERE step_run_id = $1 ORDER BY id ASC',
      [stepRun.id]
    );

    res.json({
      success: true,
      data: logsResult.rows,
    });
  } catch (err) {
    next(err);
  }
};
import { Request, Response, NextFunction } from 'express';
import pool from '../db/pool';
import { Pipeline } from '../types';

// GET /api/pipelines
export const getPipelines = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await pool.query<Pipeline>(
      'SELECT * FROM pipelines ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/pipelines/:id
export const getPipelineById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await pool.query<Pipeline>(
      'SELECT * FROM pipelines WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Pipeline not found' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/pipelines
export const createPipeline = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, definition } = req.body;

    if (!name || !definition) {
      res.status(400).json({ success: false, error: 'name and definition are required' });
      return;
    }

    const result = await pool.query<Pipeline>(
      `INSERT INTO pipelines (name, definition)
       VALUES ($1, $2)
       RETURNING *`,
      [name, JSON.stringify(definition)]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/pipelines/:id
export const updatePipeline = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, definition } = req.body;

    const result = await pool.query<Pipeline>(
      `UPDATE pipelines
       SET name = $1, definition = $2, updated_at = now()
       WHERE id = $3
       RETURNING *`,
      [name, JSON.stringify(definition), id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Pipeline not found' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/pipelines/:id
export const deletePipeline = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM pipelines WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Pipeline not found' });
      return;
    }

    res.json({ success: true, message: 'Pipeline deleted' });
  } catch (err) {
    next(err);
  }
};
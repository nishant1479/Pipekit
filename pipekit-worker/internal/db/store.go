package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

type Store struct {
	db *sql.DB
}

func NewStore(databaseURL string) (*Store, error) {
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open db: %w", err)
	}
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	return &Store{db: db}, nil
}

func (s *Store) Ping(ctx context.Context) error {
	return s.db.PingContext(ctx)
}

func (s *Store) Close() error {
	return s.db.Close()
}

// MarkRunRunning sets a run's status to "running" and records the start time
func (s *Store) MarkRunRunning(ctx context.Context, runID string) error {
	_, err := s.db.ExecContext(ctx, `
		UPDATE runs
		SET status = 'running', started_at = $1
		WHERE id = $2
	`, time.Now(), runID)
	return err
}

// MarkRunDone sets a run's final status (passed/failed) and records the finish time
func (s *Store) MarkRunDone(ctx context.Context, runID, status string) error {
	_, err := s.db.ExecContext(ctx, `
		UPDATE runs
		SET status = $1, finished_at = $2
		WHERE id = $3
	`, status, time.Now(), runID)
	return err
}

// MarkStepRunning sets a step_run's status to "running" and records the start time
func (s *Store) MarkStepRunning(ctx context.Context, stepRunID string) error {
	_, err := s.db.ExecContext(ctx, `
		UPDATE step_runs
		SET status = 'running', started_at = $1
		WHERE id = $2
	`, time.Now(), stepRunID)
	return err
}

// MarkStepDone sets a step_run's final status and records exit code + finish time
func (s *Store) MarkStepDone(ctx context.Context, stepRunID, status string, exitCode int) error {
	_, err := s.db.ExecContext(ctx, `
		UPDATE step_runs
		SET status = $1, exit_code = $2, finished_at = $3
		WHERE id = $4
	`, status, exitCode, time.Now(), stepRunID)
	return err
}

// GetStepRunID looks up the step_run row for a given run + step node ID
// (step_id in step_runs matches the node id from the pipeline JSON)
func (s *Store) GetStepRunID(ctx context.Context, runID, stepID string) (string, error) {
	var id string
	err := s.db.QueryRowContext(ctx, `
		SELECT id FROM step_runs
		WHERE run_id = $1 AND step_id = $2
	`, runID, stepID).Scan(&id)
	if err != nil {
		return "", fmt.Errorf("step_run not found for run=%s step=%s: %w", runID, stepID, err)
	}
	return id, nil
}
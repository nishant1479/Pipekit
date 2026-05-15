package queue

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

// The exact shape Node.js pushes onto the pipeline_runs list
type PipelineJob struct {
	RunID      string     `json:"run_id"`
	PipelineID string     `json:"pipeline_id"`
	Definition Definition `json:"definition"`
}

// The pipeline DAG definition (matches your Phase 1 JSON structure)
type Definition struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Nodes []Node `json:"nodes"`
	Edges []Edge `json:"edges"`
}

type Node struct {
	ID   string   `json:"id"`
	Type string   `json:"type"`
	Data NodeData `json:"data"`
}

type NodeData struct {
	Name    string `json:"name"`
	Image   string `json:"image"`
	Command string `json:"command"`
}

type Edge struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

// Consumer wraps the Redis client and listens for jobs
type Consumer struct {
	client *redis.Client
}

func NewConsumer(redisURL string) (*Consumer, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, err
	}
	client := redis.NewClient(opts)
	return &Consumer{client: client}, nil
}

// Ping verifies the Redis connection is alive
func (c *Consumer) Ping(ctx context.Context) error {
	return c.client.Ping(ctx).Err()
}

// Listen blocks forever, reading one job at a time from the pipeline_runs list.
// Each job is sent on the returned channel. Cancel ctx to stop.
func (c *Consumer) Listen(ctx context.Context) <-chan PipelineJob {
	jobs := make(chan PipelineJob)

	go func() {
		defer close(jobs)
		log.Println("[queue] Listening on pipeline_runs...")

		for {
			// BLPOP blocks up to 5s, then loops — lets us check ctx cancellation
			result, err := c.client.BLPop(ctx, 5*time.Second, "pipeline_runs").Result()
			if err != nil {
    if err == redis.Nil {
        // Normal: BLPOP timed out with no jobs — just loop again
        continue
    }
    if ctx.Err() != nil {
        log.Println("[queue] Shutting down consumer.")
        return
    }
    log.Printf("[queue] BLPOP error: %v — retrying in 2s", err)
    time.Sleep(2 * time.Second)
    continue
}

			// result[0] = key name ("pipeline_runs"), result[1] = the JSON value
			raw := result[1]
			var job PipelineJob
			if err := json.Unmarshal([]byte(raw), &job); err != nil {
				log.Printf("[queue] Failed to parse job JSON: %v — skipping", err)
				continue
			}

			log.Printf("[queue] Received job: run_id=%s pipeline_id=%s", job.RunID, job.PipelineID)
			jobs <- job
		}
	}()

	return jobs
}

// Close shuts down the Redis client
func (c *Consumer) Close() error {
	return c.client.Close()
}
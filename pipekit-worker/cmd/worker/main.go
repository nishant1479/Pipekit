package main

import (
	"context"
	"log"
	"os"

	"github.com/pipekit/worker/internal/db"
	"github.com/pipekit/worker/internal/queue"
)

func main() {
	log.Println("🚀 Pipekit worker starting...")

	redisURL := getEnv("REDIS_URL", "redis://localhost:6379")
	databaseURL := getEnv("DATABASE_URL", "postgres://postgres:secret@localhost/pipekit?sslmode=disable")

	log.Printf("Redis:    %s", redisURL)
	log.Printf("Database: %s", databaseURL)

	ctx := context.Background()

	// --- Redis consumer ---
	consumer, err := queue.NewConsumer(redisURL)
	if err != nil {
		log.Fatalf("Failed to create Redis consumer: %v", err)
	}
	defer consumer.Close()

	if err := consumer.Ping(ctx); err != nil {
		log.Fatalf("Redis ping failed: %v", err)
	}
	log.Println("✅ Redis connected.")

	// --- PostgreSQL store ---
	store, err := db.NewStore(databaseURL)
	if err != nil {
		log.Fatalf("Failed to create DB store: %v", err)
	}
	defer store.Close()

	if err := store.Ping(ctx); err != nil {
		log.Fatalf("Database ping failed: %v", err)
	}
	log.Println("✅ Database connected.")

	// Start listening
	jobs := consumer.Listen(ctx)

	log.Println("✅ Worker ready. Waiting for jobs...")

	for job := range jobs {
		log.Printf("📦 Processing job: run_id=%s  steps=%d", job.RunID, len(job.Definition.Nodes))
		// TODO: execute the pipeline (steps 4-6)
		_ = store
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jeremy/ai-autonomous-webshop/backend/internal/api"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/api/middleware"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/config"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/db"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/services"
)

func main() {
	log.Println("Starting NEXUS AI Shop Backend (Go)...")

	cfg := config.LoadConfig()

	if cfg.DatabaseURL != "" {
		db.Connect(cfg.DatabaseURL)

		log.Println("Running database migrations...")
		db.DB.AutoMigrate(
			&models.User{},
			&models.Product{},
			&models.Order{},
			&models.OrderItem{},
			&models.CartItem{},
		)
	} else {
		log.Println("Warning: DATABASE_URL not set, running without database connection")
	}

	db.ConnectRedis(cfg.RedisURL)

	services.InitNotifier()

	middleware.SetRateLimitConfig(middleware.RateLimitConfig{
		PublicRequestsPerMinute: cfg.RateLimitPublicPerMinute,
		AuthRequestsPerMinute:   cfg.RateLimitAuthPerMinute,
		WriteRequestsPerMinute:  cfg.RateLimitWritePerMinute,
		EnableRateLimiting:      cfg.RateLimitEnabled,
	})

	pricingService := &services.PricingService{}
	pricingService.StartPricingJob()

	inventoryService := &services.InventoryService{}
	inventoryService.StartInventoryJob()

	r := api.SetupRouter()

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("Server listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	srv.SetKeepAlivesEnabled(false)

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	log.Println("Closing database connections...")
	db.Close()

	log.Println("Server exited properly")
}

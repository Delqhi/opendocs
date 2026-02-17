package services

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/jeremy/ai-autonomous-webshop/backend/internal/db"
)

type HealthService struct{}

func NewHealthService() *HealthService {
	return &HealthService{}
}

type ComponentHealth struct {
	Status  string `json:"status"`
	Latency string `json:"latency,omitempty"`
	Error   string `json:"error,omitempty"`
}

type HealthResponse struct {
	Status     string                     `json:"status"`
	Timestamp  string                     `json:"timestamp"`
	Components map[string]ComponentHealth `json:"components"`
}

func (h *HealthService) CheckHealth() HealthResponse {
	response := HealthResponse{
		Status:     "healthy",
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
		Components: make(map[string]ComponentHealth),
	}

	dbHealth := h.checkDatabase()
	redisHealth := h.checkRedis()

	response.Components["database"] = dbHealth
	response.Components["redis"] = redisHealth

	if dbHealth.Status != "healthy" || redisHealth.Status != "healthy" {
		response.Status = "unhealthy"
	}

	return response
}

func (h *HealthService) checkDatabase() ComponentHealth {
	start := time.Now()
	err := db.PingDB()
	latency := time.Since(start)

	health := ComponentHealth{
		Status:  "healthy",
		Latency: latency.String(),
	}

	if err != nil {
		health.Status = "unhealthy"
		health.Error = err.Error()
	}

	return health
}

func (h *HealthService) checkRedis() ComponentHealth {
	start := time.Now()
	err := db.PingRedis()
	latency := time.Since(start)

	health := ComponentHealth{
		Status:  "healthy",
		Latency: latency.String(),
	}

	if err != nil {
		health.Status = "unhealthy"
		health.Error = err.Error()
	}

	return health
}

func (h *HealthService) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	health := h.CheckHealth()

	statusCode := http.StatusOK
	if health.Status != "healthy" {
		statusCode = http.StatusServiceUnavailable
	}

	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(health)
}

func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	service := NewHealthService()
	ctx := r.Context()

	done := make(chan HealthResponse, 1)

	go func() {
		done <- service.CheckHealth()
	}()

	select {
	case <-ctx.Done():
		http.Error(w, "Request cancelled", http.StatusRequestTimeout)
		return
	case health := <-done:
		w.Header().Set("Content-Type", "application/json")
		statusCode := http.StatusOK
		if health.Status != "healthy" {
			statusCode = http.StatusServiceUnavailable
		}
		w.WriteHeader(statusCode)
		json.NewEncoder(w).Encode(health)
	}
}

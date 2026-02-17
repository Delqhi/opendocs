package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/services"
)

type AIHandler struct {
	service *services.AIService
}

func NewAIHandler() *AIHandler {
	return &AIHandler{
		service: services.NewAIService(),
	}
}

type GenerateDescriptionRequest struct {
	Name     string   `json:"name" binding:"required"`
	Category string   `json:"category" binding:"required"`
	Features []string `json:"features"`
	Tone     string   `json:"tone"`
	Stream   bool     `json:"stream"`
}

func (h *AIHandler) GenerateDescription(c *gin.Context) {
	var req GenerateDescriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Tone == "" {
		req.Tone = "premium"
	}

	if req.Stream {
		h.generateDescriptionStream(c, req)
		return
	}

	description, err := h.service.GenerateProductDescription(req.Name, req.Category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("AI generation failed: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"description": description,
		"provider":    h.service.GetProvider(),
	})
}

func (h *AIHandler) generateDescriptionStream(c *gin.Context, req GenerateDescriptionRequest) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Streaming not supported"})
		return
	}

	sendEvent := func(data string) {
		fmt.Fprintf(c.Writer, "data: %s\n\n", data)
		flusher.Flush()
	}

	err := h.service.GenerateProductDescriptionStream(req.Name, req.Category, func(chunk string, done bool) error {
		if done {
			sendEvent("[DONE]")
			return nil
		}
		if chunk != "" {
			escaped := escapeJSON(chunk)
			sendEvent(escaped)
		}
		return nil
	})

	if err != nil {
		sendEvent(fmt.Sprintf(`{"error": "%v"}`, err))
		return
	}
}

func escapeJSON(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "\"", "\\\"")
	s = strings.ReplaceAll(s, "\n", "\\n")
	s = strings.ReplaceAll(s, "\r", "\\r")
	s = strings.ReplaceAll(s, "\t", "\\t")
	return fmt.Sprintf(`"%s"`, s)
}

func (h *AIHandler) AnalyzeSustainability(c *gin.Context) {
	var req struct {
		ProductName string `json:"product_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	score := h.service.AnalyzeSustainability(req.ProductName)

	c.JSON(http.StatusOK, gin.H{
		"product_name":         req.ProductName,
		"sustainability_score": score,
		"provider":             h.service.GetProvider(),
	})
}

func (h *AIHandler) HealthCheck(c *gin.Context) {
	err := h.service.HealthCheck(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "unhealthy",
			"error":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":   "healthy",
		"provider": h.service.GetProvider(),
	})
}

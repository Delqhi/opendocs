package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/services"
)

type RecommendationHandler struct {
	service *services.RecommendationService
}

func NewRecommendationHandler() *RecommendationHandler {
	return &RecommendationHandler{
		service: &services.RecommendationService{},
	}
}

func (h *RecommendationHandler) GetRecommendations(c *gin.Context) {
	// In a real app, get userID from JWT context
	userID := uint(1) 

	products, err := h.service.GetRecommendations(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recommendations"})
		return
	}

	c.JSON(http.StatusOK, products)
}

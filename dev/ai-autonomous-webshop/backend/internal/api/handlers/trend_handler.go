package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/services"
)

type TrendHandler struct {
	service *services.TrendService
}

func NewTrendHandler() *TrendHandler {
	return &TrendHandler{
		service: &services.TrendService{},
	}
}

func (h *TrendHandler) GetTrends(c *gin.Context) {
	trends := h.service.GetTrendingSuggestions()
	c.JSON(http.StatusOK, trends)
}

package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/services"
)

type AdminHandler struct {
	marginService *services.MarginService
}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{
		marginService: services.NewMarginService(),
	}
}

func (h *AdminHandler) GetStats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"total_revenue":   12450.50,
		"active_orders":   48,
		"total_products":  156,
		"total_customers": 1204,
		"margin_analysis": gin.H{
			"current_margin":   0.32,
			"projected_margin": 0.38,
			"suggestions": []gin.H{
				{
					"product_id":      1,
					"reason":          "High demand, low stock",
					"suggested_price": 129.99,
				},
				{
					"product_id":      5,
					"reason":          "Trending on TikTok",
					"suggested_price": 45.00,
				},
			},
		},
	})
}

func (h *AdminHandler) GetMarginAnalysis(c *gin.Context) {
	limit := 20
	useOllama := c.Query("ollama") == "true"

	if l := c.Query("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil {
			limit = n
		}
	}

	analyses, summary, err := h.marginService.AnalyzeAllProducts(limit, useOllama)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"analyses": analyses,
		"summary":  summary,
	})
}

func (h *AdminHandler) ApplyPriceChange(c *gin.Context) {
	var req models.ApplyPriceChangeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	result, err := h.marginService.ApplyPriceChange(req.AnalysisID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

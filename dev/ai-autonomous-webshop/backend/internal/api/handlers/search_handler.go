package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/services"
)

type SearchHandler struct {
	service *services.SearchService
}

func NewSearchHandler() *SearchHandler {
	return &SearchHandler{
		service: &services.SearchService{},
	}
}

func (h *SearchHandler) Search(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
		return
	}

	products, err := h.service.SearchProducts(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed"})
		return
	}

	c.JSON(http.StatusOK, products)
}

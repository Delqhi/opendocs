package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/services"
)

type OrderHandler struct {
	service *services.OrderService
}

func NewOrderHandler() *OrderHandler {
	return &OrderHandler{
		service: &services.OrderService{},
	}
}

func (h *OrderHandler) Create(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req struct {
		Items      []models.OrderItem `json:"items" binding:"required"`
		CardNumber string             `json:"card_number" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.service.Create(userID, req.Items, req.CardNumber)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

func (h *OrderHandler) GetMyOrders(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	orders, err := h.service.GetByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

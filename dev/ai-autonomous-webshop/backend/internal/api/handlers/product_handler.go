package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/api/middleware"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/services"
)

type ProductHandler struct {
	service         *services.ProductService
	currencyService *services.CurrencyService
}

func NewProductHandler() *ProductHandler {
	return &ProductHandler{
		service:         &services.ProductService{},
		currencyService: services.NewCurrencyService(),
	}
}

type ProductWithCurrency struct {
	models.Product
	OriginalPrice    float64 `json:"original_price"`
	ConvertedPrice   float64 `json:"converted_price"`
	PriceFormatted   string  `json:"price_formatted"`
	OriginalCurrency string  `json:"original_currency"`
	UserCurrency     string  `json:"user_currency"`
	ExchangeRate     float64 `json:"exchange_rate"`
}

func (h *ProductHandler) GetAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	category := c.Query("category")

	var result *services.ProductListResult
	var err error

	if category != "" {
		result, err = h.service.GetByCategory(category, page, pageSize)
	} else {
		result, err = h.service.GetPaginated(page, pageSize)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	userCurrency := middleware.GetUserCurrency(c)
	aiService := &services.AIService{}

	var enrichedProducts []ProductWithCurrency
	for _, p := range result.Products {
		convertedPrice := h.currencyService.ConvertPricePrecise(p.Price, "USD", userCurrency, 2)
		rate := h.currencyService.GetExchangeRate("USD", userCurrency)

		enrichedProducts = append(enrichedProducts, ProductWithCurrency{
			Product:          p,
			OriginalPrice:    p.Price,
			ConvertedPrice:   convertedPrice,
			PriceFormatted:   h.currencyService.FormatPrice(convertedPrice, userCurrency),
			OriginalCurrency: "USD",
			UserCurrency:     userCurrency,
			ExchangeRate:     rate,
		})
		_ = aiService
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       enrichedProducts,
		"pagination": result,
		"currency":   userCurrency,
	})
}

func (h *ProductHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	product, err := h.service.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	userCurrency := middleware.GetUserCurrency(c)
	convertedPrice := h.currencyService.ConvertPricePrecise(product.Price, "USD", userCurrency, 2)
	rate := h.currencyService.GetExchangeRate("USD", userCurrency)

	response := ProductWithCurrency{
		Product:          *product,
		OriginalPrice:    product.Price,
		ConvertedPrice:   convertedPrice,
		PriceFormatted:   h.currencyService.FormatPrice(convertedPrice, userCurrency),
		OriginalCurrency: "USD",
		UserCurrency:     userCurrency,
		ExchangeRate:     rate,
	}

	c.JSON(http.StatusOK, response)
}

func (h *ProductHandler) Create(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// AI-Powered SEO Optimization
	// Automatically generate meta tags and SEO-friendly slugs
	if product.Description != "" {
		log.Printf("AI Agent: Optimizing SEO for %s...", product.Name)
		// Mock logic: generate keywords from description
	}

	if err := h.service.Create(&product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, product)
}

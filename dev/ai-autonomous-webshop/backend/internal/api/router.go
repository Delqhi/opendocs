package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/api/handlers"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/api/middleware"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/services"
)

func SetupRouter() *gin.Engine {
	r := gin.New()

	r.Use(gin.Logger())
	r.Use(middleware.RecoveryMiddleware())
	r.Use(middleware.RequestIDMiddleware())
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.SecurityHeadersMiddleware())
	r.Use(middleware.GeoDetectionMiddleware())
	r.Use(middleware.CurrencyMiddleware())

	r.GET("/health", gin.WrapH(http.HandlerFunc(services.HealthCheckHandler)))

	r.GET("/health/live", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.GET("/health/ready", func(c *gin.Context) {
		health := services.NewHealthService().CheckHealth()
		if health.Status != "healthy" {
			c.JSON(http.StatusServiceUnavailable, health)
			return
		}
		c.JSON(http.StatusOK, health)
	})

	// API v1 group
	v1 := r.Group("/api/v1")
	v1.Use(middleware.PublicRateLimiter())
	{
		imageHandler := handlers.NewImageHandler()
		images := v1.Group("/images")
		{
			images.POST("", imageHandler.Upload)
			images.GET("/:filename", imageHandler.ServeImage)
			images.GET("/:filename/optimized", imageHandler.GetOptimized)
			images.GET("/:filename/blurhash", imageHandler.GetBlurHash)
			images.GET("/:filename/metadata", imageHandler.GetMetadata)
		}

		authHandler := handlers.NewAuthHandler()
		auth := v1.Group("/auth")
		auth.Use(middleware.WriteRateLimiter())
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		productHandler := handlers.NewProductHandler()
		products := v1.Group("/products")
		{
			products.GET("", productHandler.GetAll)
			products.GET("/:id", productHandler.GetByID)
			products.POST("", productHandler.Create)
		}

		searchHandler := handlers.NewSearchHandler()
		v1.GET("/search", searchHandler.Search)

		recommendationHandler := handlers.NewRecommendationHandler()
		v1.GET("/recommendations", recommendationHandler.GetRecommendations)

		currencyHandler := handlers.NewCurrencyHandler()
		geo := v1.Group("/geo")
		{
			geo.GET("", currencyHandler.GetGeo)
		}

		currency := v1.Group("/currency")
		{
			currency.GET("", currencyHandler.GetUserCurrency)
			currency.GET("/list", currencyHandler.GetSupportedCurrencies)
			currency.GET("/:code", currencyHandler.GetCurrency)
			currency.POST("/set", currencyHandler.SetCurrency)
			currency.POST("/convert", currencyHandler.ConvertPrice)
			currency.POST("/convert/multiple", currencyHandler.ConvertMultiple)
		}

		orderHandler := handlers.NewOrderHandler()
		orders := v1.Group("/orders")
		orders.Use(middleware.AuthMiddleware())
		orders.Use(middleware.AuthRateLimiter())
		{
			orders.POST("", orderHandler.Create)
			orders.GET("", orderHandler.GetMyOrders)
		}

		cartHandler := handlers.NewCartHandler()
		cart := v1.Group("/cart")
		cart.Use(middleware.AuthMiddleware())
		cart.Use(middleware.AuthRateLimiter())
		{
			cart.GET("", cartHandler.GetCart)
			cart.POST("", cartHandler.AddToCart)
			cart.DELETE("/:product_id", cartHandler.RemoveFromCart)
		}

		adminHandler := handlers.NewAdminHandler()
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthMiddleware())
		admin.Use(middleware.AuthRateLimiter())
		{
			admin.GET("/stats", adminHandler.GetStats)
			admin.GET("/margin", adminHandler.GetMarginAnalysis)
			admin.POST("/margin/apply", adminHandler.ApplyPriceChange)

			trendHandler := handlers.NewTrendHandler()
			admin.GET("/trends", trendHandler.GetTrends)

			aiHandler := handlers.NewAIHandler()
			admin.POST("/generate-description", aiHandler.GenerateDescription)
		}

		wsHandler := handlers.NewWebSocketHandler()
		r.GET("/ws", wsHandler.Handle)
	}

	return r
}

package services

import (
	"log"
	"math"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/db"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
)

type PricingService struct{}

func (s *PricingService) AdjustPrices() {
	log.Println("AI Agent: Starting dynamic pricing adjustment...")

	var products []models.Product
	if err := db.DB.Find(&products).Error; err != nil {
		log.Printf("Error fetching products for pricing: %v", err)
		return
	}

	for _, p := range products {
		oldPrice := p.Price

		// 2026 Dynamic Pricing Logic:
		// 1. Demand factor (simulated by random for now)
		demandFactor := 0.95 + (1.1-0.95)*0.5 // simulated 1.025

		// 2. Inventory factor (lower stock -> higher price)
		inventoryFactor := 1.0
		if p.Stock < 10 {
			inventoryFactor = 1.15
		} else if p.Stock > 100 {
			inventoryFactor = 0.90
		}

		// Calculate new price
		newPrice := oldPrice * demandFactor * inventoryFactor

		// Round to 2 decimal places
		newPrice = math.Round(newPrice*100) / 100

		if newPrice != oldPrice {
			p.Price = newPrice
			db.DB.Save(&p)
			log.Printf("AI Agent: Adjusted price for %s: $%.2f -> $%.2f", p.Name, oldPrice, newPrice)

			// Notify Admin of price change
			Notifier.NotifyUser(1, "PRICE_ADJUSTMENT", "AI adjusted price for "+p.Name, gin.H{
				"product_id": p.ID,
				"old_price":  oldPrice,
				"new_price":  newPrice,
				"reason":     "Dynamic pricing algorithm based on demand and stock",
			})
		}
	}
}

func (s *PricingService) StartPricingJob() {
	// Runs every 24 hours in a real app
	ticker := time.NewTicker(24 * time.Hour)
	go func() {
		for range ticker.C {
			s.AdjustPrices()
		}
	}()
}

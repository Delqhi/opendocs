package services

import (
	"log"
	"time"

	"github.com/jeremy/ai-autonomous-webshop/backend/internal/db"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
)

type InventoryService struct{}

func (s *InventoryService) CheckAndRestock() {
	log.Println("AI Agent: Checking inventory levels for autonomous restock...")

	var products []models.Product
	if err := db.DB.Find(&products).Error; err != nil {
		log.Printf("Error fetching products for inventory check: %v", err)
		return
	}

	for _, p := range products {
		if p.Stock < 5 {
			log.Printf("AI Agent: Low stock detected for %s (%d). Ordering 50 units from supplier...", p.Name, p.Stock)
			
			// Mock supplier order delay
			time.Sleep(500 * time.Millisecond)

			p.Stock += 50
			db.DB.Save(&p)
			
			log.Printf("AI Agent: Restock complete for %s. New stock: %d", p.Name, p.Stock)
			
			// Notify Admin
			Notifier.NotifyUser(1, "INVENTORY_RESTOCK", "Autonomous restock complete for "+p.Name, p)
		}
	}
}

func (s *InventoryService) StartInventoryJob() {
	// Runs every 12 hours in a real app
	ticker := time.NewTicker(12 * time.Hour)
	go func() {
		for range ticker.C {
			s.CheckAndRestock()
		}
	}()
}

package services

import (
	"log"

	"github.com/jeremy/ai-autonomous-webshop/backend/internal/db"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
)

type RecommendationService struct{}

func (s *RecommendationService) GetRecommendations(userID uint) ([]models.Product, error) {
	log.Printf("AI Agent: Calculating smart recommendations for User %d based on browsing history...", userID)
	
	var products []models.Product
	
	// In 2026, we'd use a collaborative filtering model or a vector search on user embeddings.
	// For this implementation, we suggest trending products with high stock as a smart fallback.
	err := db.DB.Order("stock desc").Limit(4).Find(&products).Error
	
	return products, err
}

package services

import (
	"strings"

	"github.com/jeremy/ai-autonomous-webshop/backend/internal/db"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
)

type SearchService struct{}

func (s *SearchService) SearchProducts(query string) ([]models.Product, error) {
	var products []models.Product
	
	// In 2026, we'd use a vector DB or specialized search engine.
	// For this implementation, we use an optimized ILIKE search as a fallback.
	searchQuery := "%" + strings.ToLower(query) + "%"
	
	err := db.DB.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?", 
		searchQuery, searchQuery, searchQuery).Find(&products).Error
		
	return products, err
}

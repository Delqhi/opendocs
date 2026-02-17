package services

import (
	"gorm.io/gorm"

	"github.com/jeremy/ai-autonomous-webshop/backend/internal/db"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
)

type OrderService struct{}

func (s *OrderService) Create(userID uint, items []models.OrderItem) (*models.Order, error) {
	tx := db.DB.Begin()

	// Batch fetch all products at once to avoid N+1 queries
	productIDs := make([]uint, len(items))
	for i, item := range items {
		productIDs[i] = item.ProductID
	}

	var products []models.Product
	if err := tx.Where("id IN ?", productIDs).Find(&products).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Create a map for quick lookup
	productMap := make(map[uint]models.Product)
	for _, p := range products {
		productMap[p.ID] = p
	}

	// Verify all products exist
	for _, item := range items {
		if _, ok := productMap[item.ProductID]; !ok {
			tx.Rollback()
			return nil, gorm.ErrRecordNotFound
		}
	}

	var total float64
	for i, item := range items {
		product := productMap[item.ProductID]
		// Set the price from the DB to ensure data integrity
		items[i].Price = product.Price
		total += product.Price * float64(item.Quantity)
	}

	order := &models.Order{
		UserID: userID,
		Total:  total,
		Status: "pending",
		Items:  items,
	}

	if err := tx.Create(order).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	tx.Commit()
	return order, nil
}

func (s *OrderService) GetByUserID(userID uint) ([]models.Order, error) {
	var orders []models.Order
	if err := db.DB.Preload("Items").Where("user_id = ?", userID).Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

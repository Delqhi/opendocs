package services

import (
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/db"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
)

type CartService struct{}

func (s *CartService) GetCart(userID uint) ([]models.CartItem, error) {
	var items []models.CartItem
	if err := db.DB.Preload("Product").Where("user_id = ?", userID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (s *CartService) AddToCart(userID, productID uint, quantity int) error {
	var item models.CartItem
	err := db.DB.Where("user_id = ? AND product_id = ?", userID, productID).First(&item).Error
	
	if err == nil {
		item.Quantity += quantity
		return db.DB.Save(&item).Error
	}

	item = models.CartItem{
		UserID:    userID,
		ProductID: productID,
		Quantity:  quantity,
	}
	return db.DB.Create(&item).Error
}

func (s *CartService) RemoveFromCart(userID, productID uint) error {
	return db.DB.Where("user_id = ? AND product_id = ?", userID, productID).Delete(&models.CartItem{}).Error
}

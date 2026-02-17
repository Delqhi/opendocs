package models

import (
	"time"

	"gorm.io/gorm"
)

type CartItem struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null;index:idx_user_id" json:"user_id"`
	ProductID uint           `gorm:"not null;index:idx_product_id" json:"product_id"`
	Quantity  int            `gorm:"not null" json:"quantity"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Product   Product        `gorm:"foreignKey:ProductID" json:"product"`
}

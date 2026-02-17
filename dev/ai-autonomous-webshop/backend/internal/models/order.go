package models

import (
	"time"

	"gorm.io/gorm"
)

type Order struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null;index:idx_user_id" json:"user_id"`
	Total     float64        `gorm:"not null" json:"total"`
	Status    string         `gorm:"default:'pending';index:idx_status" json:"status"`
	Items     []OrderItem    `gorm:"foreignKey:OrderID" json:"items"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type OrderItem struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	OrderID   uint    `gorm:"not null;index:idx_order_id" json:"order_id"`
	ProductID uint    `gorm:"not null;index:idx_product_id" json:"product_id"`
	Quantity  int     `gorm:"not null" json:"quantity"`
	Price     float64 `gorm:"not null" json:"price"`
}

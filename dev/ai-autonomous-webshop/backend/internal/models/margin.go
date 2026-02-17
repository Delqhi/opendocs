package models

import (
	"time"
)

type MarginAnalysis struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	ProductID       uint       `gorm:"not null;index:idx_product_id" json:"product_id"`
	ProductName     string     `gorm:"not null" json:"product_name"`
	CurrentPrice    float64    `gorm:"not null" json:"current_price"`
	CostPrice       float64    `gorm:"not null" json:"cost_price"`
	CurrentMargin   float64    `gorm:"not null" json:"current_margin"`
	ProjectedMargin float64    `gorm:"not null" json:"projected_margin"`
	SuggestedPrice  float64    `gorm:"not null" json:"suggested_price"`
	PriceChange     float64    `gorm:"not null" json:"price_change"`
	Reason          string     `gorm:"type:text" json:"reason"`
	Confidence      float64    `gorm:"not null" json:"confidence"`
	TrendScore      float64    `gorm:"not null" json:"trend_score"`
	SalesVelocity   float64    `gorm:"not null" json:"sales_velocity"`
	StockLevel      int        `gorm:"not null" json:"stock_level"`
	DemandLevel     string     `gorm:"not null" json:"demand_level"`
	AnalysisSource  string     `gorm:"not null" json:"analysis_source"`
	IsApplied       bool       `gorm:"default:false" json:"is_applied"`
	AppliedAt       *time.Time `json:"applied_at,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type MarginSummary struct {
	TotalProducts      int     `json:"total_products"`
	AvgCurrentMargin   float64 `json:"avg_current_margin"`
	AvgProjectedMargin float64 `json:"avg_projected_margin"`
	TotalRevenue       float64 `json:"total_revenue"`
	ProjectedRevenue   float64 `json:"projected_revenue"`
	PotentialGain      float64 `json:"potential_gain"`
	HighOpportunity    int     `json:"high_opportunity"`
	MediumOpportunity  int     `json:"medium_opportunity"`
	LowOpportunity     int     `json:"low_opportunity"`
}

type MarginAnalysisRequest struct {
	ProductID     uint    `json:"product_id,omitempty"`
	Limit         int     `json:"limit,omitempty"`
	MinConfidence float64 `json:"min_confidence,omitempty"`
	UseOllama     bool    `json:"use_ollama,omitempty"`
}

type ApplyPriceChangeRequest struct {
	AnalysisID uint `json:"analysis_id" binding:"required"`
}

type ApplyPriceChangeResponse struct {
	Success      bool    `json:"success"`
	ProductID    uint    `json:"product_id"`
	OldPrice     float64 `json:"old_price"`
	NewPrice     float64 `json:"new_price"`
	MarginBefore float64 `json:"margin_before"`
	MarginAfter  float64 `json:"margin_after"`
	Message      string  `json:"message"`
}

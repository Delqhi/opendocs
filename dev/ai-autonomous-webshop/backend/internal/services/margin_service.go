package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"time"

	"github.com/jeremy/ai-autonomous-webshop/backend/internal/db"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
)

type MarginService struct {
	aiService *AIService
}

func NewMarginService() *MarginService {
	return &MarginService{
		aiService: NewAIService(),
	}
}

type ProductWithCost struct {
	ProductID   uint
	ProductName string
	Price       float64
	CostPrice   float64
	Stock       int
	Category    string
	SalesCount  int
}

func (s *MarginService) AnalyzeAllProducts(limit int, useOllama bool) ([]models.MarginAnalysis, *models.MarginSummary, error) {
	var products []models.Product
	if err := db.DB.Find(&products).Error; err != nil {
		return nil, nil, fmt.Errorf("failed to fetch products: %w", err)
	}

	if limit > 0 && len(products) > limit {
		products = products[:limit]
	}

	var analyses []models.MarginAnalysis
	var totalRevenue, projectedRevenue float64
	highOpps, mediumOpps, lowOpps := 0, 0, 0

	rand.Seed(time.Now().UnixNano())

	for _, p := range products {
		analysis := s.analyzeProduct(p, useOllama)
		analyses = append(analyses, analysis)

		salesCount := s.getSalesCount(p.ID)
		unitSales := float64(maxInt(salesCount, 1))

		totalRevenue += p.Price * unitSales
		projectedRevenue += analysis.SuggestedPrice * unitSales

		if analysis.PriceChange > 15 {
			highOpps++
		} else if analysis.PriceChange > 5 {
			mediumOpps++
		} else {
			lowOpps++
		}
	}

	avgCurrent := 0.0
	avgProjected := 0.0
	if len(analyses) > 0 {
		for _, a := range analyses {
			avgCurrent += a.CurrentMargin
			avgProjected += a.ProjectedMargin
		}
		avgCurrent /= float64(len(analyses))
		avgProjected /= float64(len(analyses))
	}

	summary := &models.MarginSummary{
		TotalProducts:      len(analyses),
		AvgCurrentMargin:   avgCurrent,
		AvgProjectedMargin: avgProjected,
		TotalRevenue:       totalRevenue,
		ProjectedRevenue:   projectedRevenue,
		PotentialGain:      projectedRevenue - totalRevenue,
		HighOpportunity:    highOpps,
		MediumOpportunity:  mediumOpps,
		LowOpportunity:     lowOpps,
	}

	return analyses, summary, nil
}

func (s *MarginService) analyzeProduct(p models.Product, useOllama bool) models.MarginAnalysis {
	costPrice := s.estimateCostPrice(p.Price)
	currentMargin := (p.Price - costPrice) / p.Price * 100

	salesVelocity := s.calculateSalesVelocity(s.getSalesCount(p.ID), p.Category)
	trendScore := s.calculateTrendScore(p.Category)
	demandLevel := s.determineDemandLevel(p.Stock, salesVelocity, trendScore)

	var suggestedPrice float64
	var reason string
	var confidence float64
	var analysisSource string

	if useOllama {
		suggestedPrice, reason, confidence = s.analyzeWithOllama(p, costPrice, currentMargin, demandLevel)
		analysisSource = "ollama"
	} else {
		suggestedPrice, reason, confidence = s.analyzeWithHeuristic(p, costPrice, currentMargin, demandLevel, salesVelocity, trendScore)
		analysisSource = "heuristic"
	}

	projectedMargin := (suggestedPrice - costPrice) / suggestedPrice * 100
	priceChange := ((suggestedPrice - p.Price) / p.Price) * 100

	return models.MarginAnalysis{
		ProductID:       p.ID,
		ProductName:     p.Name,
		CurrentPrice:    p.Price,
		CostPrice:       costPrice,
		CurrentMargin:   currentMargin,
		ProjectedMargin: projectedMargin,
		SuggestedPrice:  suggestedPrice,
		PriceChange:     priceChange,
		Reason:          reason,
		Confidence:      confidence,
		TrendScore:      trendScore,
		SalesVelocity:   salesVelocity,
		StockLevel:      p.Stock,
		DemandLevel:     demandLevel,
		AnalysisSource:  analysisSource,
	}
}

func (s *MarginService) getSalesCount(productID uint) int {
	var count int64
	db.DB.Model(&models.OrderItem{}).Where("product_id = ?", productID).Count(&count)
	return int(count)
}

func (s *MarginService) estimateCostPrice(sellingPrice float64) float64 {
	marginRatio := 0.4 + rand.Float64()*0.2
	return sellingPrice * (1 - marginRatio)
}

func (s *MarginService) calculateSalesVelocity(salesCount int, category string) float64 {
	baseVelocity := float64(maxInt(salesCount, 1))

	categoryMultipliers := map[string]float64{
		"Electronics": 1.5,
		"Clothing":    1.2,
		"Home":        1.0,
		"Books":       0.8,
		"Toys":        1.3,
		"Sports":      1.1,
		"Food":        0.9,
	}

	multiplier := categoryMultipliers[category]
	if multiplier == 0 {
		multiplier = 1.0
	}

	return baseVelocity * multiplier * (0.8 + rand.Float64()*0.4)
}

func (s *MarginService) calculateTrendScore(category string) float64 {
	trendingCategories := map[string]float64{
		"Electronics": 0.85,
		"Toys":        0.78,
		"Sports":      0.72,
		"Clothing":    0.65,
		"Home":        0.58,
		"Books":       0.45,
		"Food":        0.40,
	}

	trendScore := trendingCategories[category]
	if trendScore == 0 {
		trendScore = 0.5
	}

	return trendScore + (rand.Float64()*0.2 - 0.1)
}

func (s *MarginService) determineDemandLevel(stock int, salesVelocity float64, trendScore float64) string {
	demandScore := (salesVelocity / 100) * 0.4
	demandScore += trendScore * 0.4

	if stock < 10 {
		demandScore += 0.3
	} else if stock > 100 {
		demandScore -= 0.2
	}

	if demandScore > 0.7 {
		return "high"
	} else if demandScore > 0.4 {
		return "medium"
	}
	return "low"
}

func (s *MarginService) analyzeWithHeuristic(p models.Product, costPrice, currentMargin float64, demandLevel string, salesVelocity, trendScore float64) (float64, string, float64) {
	var suggestedPrice float64
	var reason string
	var confidence float64

	switch demandLevel {
	case "high":
		if p.Stock < 20 {
			suggestedPrice = p.Price * 1.20
			reason = fmt.Sprintf("High demand (%s) with low stock - opportunity for 20%% price increase", demandLevel)
			confidence = 0.92
		} else {
			suggestedPrice = p.Price * 1.12
			reason = fmt.Sprintf("Strong demand (%s) trending on social media", demandLevel)
			confidence = 0.85
		}
	case "medium":
		suggestedPrice = p.Price * 1.06
		reason = "Moderate demand with stable inventory - conservative 6% increase"
		confidence = 0.72
	default:
		if p.Stock > 100 {
			suggestedPrice = p.Price * 0.92
			reason = "High stock with low demand - reduce price to clear inventory"
			confidence = 0.78
		} else {
			suggestedPrice = p.Price
			reason = "Current price optimal for low demand scenario"
			confidence = 0.65
		}
	}

	if trendScore > 0.7 {
		suggestedPrice *= 1.05
		reason += " (+5% trending premium)"
		confidence += 0.05
	}

	if currentMargin < 15 {
		suggestedPrice *= 1.08
		reason += " (margin boost)"
	}

	suggestedPrice = math.Round(suggestedPrice*100) / 100

	return suggestedPrice, reason, math.Min(confidence, 0.98)
}

func (s *MarginService) analyzeWithOllama(p models.Product, costPrice, currentMargin float64, demandLevel string) (float64, string, float64) {
	prompt := fmt.Sprintf(`You are a pricing expert for an e-commerce store. Analyze this product and suggest an optimal price.

Product: %s
Category: %s
Current Price: $%.2f
Cost Price: $%.2f (estimated)
Current Margin: %.1f%%
Stock: %d units
Demand Level: %s

Consider:
1. Sales velocity and trend indicators
2. Inventory levels
3. Competition and market positioning
4. Margin optimization

Respond ONLY with a JSON object in this exact format:
{"suggested_price": 0.00, "reason": "short explanation", "confidence": 0.00}`, p.Name, p.Category, p.Price, costPrice, currentMargin, p.Stock, demandLevel)

	ollamaReq := map[string]interface{}{
		"model":  s.aiService.config.OllamaModel,
		"prompt": prompt,
		"options": map[string]interface{}{
			"temperature": 0.3,
			"num_predict": 256,
		},
	}

	jsonData, err := json.Marshal(ollamaReq)
	if err != nil {
		log.Printf("Failed to marshal Ollama request: %v", err)
		return s.analyzeWithHeuristic(p, costPrice, currentMargin, demandLevel, 0, 0)
	}

	url := fmt.Sprintf("%s/api/generate", s.aiService.config.OllamaBaseURL)
	resp, err := s.aiService.client.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("Ollama request failed: %v", err)
		return s.analyzeWithHeuristic(p, costPrice, currentMargin, demandLevel, 0, 0)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		log.Printf("Ollama returned status %d", resp.StatusCode)
		return s.analyzeWithHeuristic(p, costPrice, currentMargin, demandLevel, 0, 0)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Printf("Failed to decode Ollama response: %v", err)
		return s.analyzeWithHeuristic(p, costPrice, currentMargin, demandLevel, 0, 0)
	}

	response, ok := result["response"].(string)
	if !ok {
		log.Printf("Invalid Ollama response format")
		return s.analyzeWithHeuristic(p, costPrice, currentMargin, demandLevel, 0, 0)
	}

	var parsed struct {
		SuggestedPrice float64 `json:"suggested_price"`
		Reason         string  `json:"reason"`
		Confidence     float64 `json:"confidence"`
	}

	if err := json.Unmarshal([]byte(response), &parsed); err != nil {
		log.Printf("Failed to parse Ollama JSON: %v", err)
		return s.analyzeWithHeuristic(p, costPrice, currentMargin, demandLevel, 0, 0)
	}

	if parsed.SuggestedPrice == 0 {
		return s.analyzeWithHeuristic(p, costPrice, currentMargin, demandLevel, 0, 0)
	}

	parsed.SuggestedPrice = math.Round(parsed.SuggestedPrice*100) / 100

	return parsed.SuggestedPrice, parsed.Reason, math.Min(parsed.Confidence, 0.95)
}

func (s *MarginService) ApplyPriceChange(analysisID uint) (*models.ApplyPriceChangeResponse, error) {
	var analysis models.MarginAnalysis
	if err := db.DB.First(&analysis, analysisID).Error; err != nil {
		return nil, fmt.Errorf("analysis not found: %w", err)
	}

	if analysis.IsApplied {
		return &models.ApplyPriceChangeResponse{
			Success:   false,
			ProductID: analysis.ProductID,
			Message:   "Price change already applied",
		}, nil
	}

	var product models.Product
	if err := db.DB.First(&product, analysis.ProductID).Error; err != nil {
		return nil, fmt.Errorf("product not found: %w", err)
	}

	oldPrice := product.Price
	oldMargin := analysis.CurrentMargin

	product.Price = analysis.SuggestedPrice
	if err := db.DB.Save(&product).Error; err != nil {
		return nil, fmt.Errorf("failed to update price: %w", err)
	}

	now := time.Now()
	analysis.IsApplied = true
	analysis.AppliedAt = &now
	if err := db.DB.Save(&analysis).Error; err != nil {
		log.Printf("Failed to update analysis: %v", err)
	}

	newMargin := (product.Price - analysis.CostPrice) / product.Price * 100

	log.Printf("AI Agent: Applied price change for %s: $%.2f -> $%.2f (margin: %.1f%% -> %.1f%%)",
		product.Name, oldPrice, product.Price, oldMargin, newMargin)

	return &models.ApplyPriceChangeResponse{
		Success:      true,
		ProductID:    product.ID,
		OldPrice:     oldPrice,
		NewPrice:     product.Price,
		MarginBefore: oldMargin,
		MarginAfter:  newMargin,
		Message:      fmt.Sprintf("Price updated successfully for %s", product.Name),
	}, nil
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

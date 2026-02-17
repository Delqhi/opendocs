package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/api/middleware"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/services"
)

type CurrencyHandler struct {
	currencyService *services.CurrencyService
	geoService      *services.GeoService
}

func NewCurrencyHandler() *CurrencyHandler {
	return &CurrencyHandler{
		currencyService: services.NewCurrencyService(),
		geoService:      services.NewGeoService(),
	}
}

type CurrencyResponse struct {
	Code          string  `json:"code"`
	Symbol        string  `json:"symbol"`
	Name          string  `json:"name"`
	Rate          float64 `json:"rate"`
	Locale        string  `json:"locale"`
	DecimalPlaces int     `json:"decimal_places"`
}

type GeoResponse struct {
	Country     string `json:"country"`
	CountryName string `json:"country_name"`
	City        string `json:"city"`
	Currency    string `json:"currency"`
	IP          string `json:"ip"`
}

type ConversionRequest struct {
	Amount float64 `json:"amount" binding:"required"`
	From   string  `json:"from" binding:"required"`
	To     string  `json:"to" binding:"required"`
}

type ConversionResponse struct {
	OriginalAmount  float64 `json:"original_amount"`
	ConvertedAmount float64 `json:"converted_amount"`
	FromCurrency    string  `json:"from_currency"`
	ToCurrency      string  `json:"to_currency"`
	ExchangeRate    float64 `json:"exchange_rate"`
	Formatted       string  `json:"formatted"`
}

func (h *CurrencyHandler) GetGeo(c *gin.Context) {
	var geo *services.GeoLocation

	if g, exists := c.Get("geo"); exists {
		geo = g.(*services.GeoLocation)
	} else {
		ip := c.ClientIP()
		var err error
		geo, err = h.geoService.DetectLocation(ip)
		if err != nil {
			geo = &services.GeoLocation{
				IP:       ip,
				Country:  "US",
				Currency: "USD",
			}
		}
	}

	c.JSON(http.StatusOK, GeoResponse{
		Country:     geo.Country,
		CountryName: geo.CountryName,
		City:        geo.City,
		Currency:    geo.Currency,
		IP:          geo.IP,
	})
}

func (h *CurrencyHandler) GetCurrency(c *gin.Context) {
	code := c.Param("code")

	if code == "" {
		code = middleware.GetUserCurrency(c)
	}

	currency := h.currencyService.GetCurrency(code)

	c.JSON(http.StatusOK, CurrencyResponse{
		Code:          currency.Code,
		Symbol:        currency.Symbol,
		Name:          currency.Name,
		Rate:          currency.Rate,
		Locale:        currency.Locale,
		DecimalPlaces: currency.DecimalPlaces,
	})
}

func (h *CurrencyHandler) GetUserCurrency(c *gin.Context) {
	userCurrency := middleware.GetUserCurrency(c)
	currency := h.currencyService.GetCurrency(userCurrency)

	c.JSON(http.StatusOK, CurrencyResponse{
		Code:          currency.Code,
		Symbol:        currency.Symbol,
		Name:          currency.Name,
		Rate:          currency.Rate,
		Locale:        currency.Locale,
		DecimalPlaces: currency.DecimalPlaces,
	})
}

func (h *CurrencyHandler) GetSupportedCurrencies(c *gin.Context) {
	currencies := h.currencyService.GetSupportedCurrencies()

	response := make([]CurrencyResponse, len(currencies))
	for i, curr := range currencies {
		response[i] = CurrencyResponse{
			Code:          curr.Code,
			Symbol:        curr.Symbol,
			Name:          curr.Name,
			Rate:          curr.Rate,
			Locale:        curr.Locale,
			DecimalPlaces: curr.DecimalPlaces,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"currencies": response,
		"default":    "USD",
	})
}

func (h *CurrencyHandler) SetCurrency(c *gin.Context) {
	code := c.PostForm("currency")

	if code == "" {
		var body map[string]string
		if err := c.ShouldBindJSON(&body); err == nil {
			if curr, ok := body["currency"]; ok {
				code = curr
			}
		}
	}

	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Currency code required"})
		return
	}

	if !h.isValidCurrency(code) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid currency code"})
		return
	}

	c.SetCookie("nexus_currency", code, 86400*30, "/", "", false, true)
	c.Set("user_currency", code)

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"currency": code,
	})
}

func (h *CurrencyHandler) ConvertPrice(c *gin.Context) {
	var req ConversionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !h.isValidCurrency(req.From) || !h.isValidCurrency(req.To) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid currency code"})
		return
	}

	converted := h.currencyService.ConvertPricePrecise(req.Amount, req.From, req.To, 2)
	rate := h.currencyService.GetExchangeRate(req.From, req.To)
	formatted := h.currencyService.FormatPrice(converted, req.To)

	c.JSON(http.StatusOK, ConversionResponse{
		OriginalAmount:  req.Amount,
		ConvertedAmount: converted,
		FromCurrency:    req.From,
		ToCurrency:      req.To,
		ExchangeRate:    rate,
		Formatted:       formatted,
	})
}

func (h *CurrencyHandler) ConvertMultiple(c *gin.Context) {
	var req struct {
		Amounts []float64 `json:"amounts" binding:"required"`
		From    string    `json:"from" binding:"required"`
		To      string    `json:"to" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !h.isValidCurrency(req.From) || !h.isValidCurrency(req.To) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid currency code"})
		return
	}

	rate := h.currencyService.GetExchangeRate(req.From, req.To)
	results := make([]ConversionResponse, len(req.Amounts))

	for i, amount := range req.Amounts {
		converted := h.currencyService.ConvertPricePrecise(amount, req.From, req.To, 2)
		results[i] = ConversionResponse{
			OriginalAmount:  amount,
			ConvertedAmount: converted,
			FromCurrency:    req.From,
			ToCurrency:      req.To,
			ExchangeRate:    rate,
			Formatted:       h.currencyService.FormatPrice(converted, req.To),
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"results": results,
		"rate":    rate,
	})
}

func (h *CurrencyHandler) isValidCurrency(code string) bool {
	_, exists := services.CurrencyMap[code]
	return exists
}

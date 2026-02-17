package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/services"
)

const (
	GeoCountryHeader  = "X-Geo-Country"
	GeoCityHeader     = "X-Geo-City"
	GeoCurrencyHeader = "X-Geo-Currency"
	GeoIPHeader       = "X-Geo-IP"
	CookieCurrency    = "nexus_currency"
)

var geoService = services.NewGeoService()
var currencyService = services.NewCurrencyService()

func GeoDetectionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var clientIP string

		if forwarded := c.GetHeader("X-Forwarded-For"); forwarded != "" {
			ips := strings.Split(forwarded, ",")
			clientIP = strings.TrimSpace(ips[0])
		} else if realIP := c.GetHeader("X-Real-IP"); realIP != "" {
			clientIP = realIP
		} else {
			clientIP = c.ClientIP()
		}

		geo, err := geoService.DetectLocation(clientIP)
		if err != nil {
			geo = &services.GeoLocation{
				IP:       clientIP,
				Country:  "US",
				Currency: "USD",
			}
		}

		c.Set("geo", geo)
		c.Set("country", geo.Country)
		c.Set("currency", geo.Currency)
		c.Set("client_ip", geo.IP)

		c.Header(GeoCountryHeader, geo.Country)
		c.Header(GeoCityHeader, geo.City)
		c.Header(GeoCurrencyHeader, geo.Currency)
		c.Header(GeoIPHeader, geo.IP)

		c.Next()
	}
}

func CurrencyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var currency string

		if cookie, err := c.Cookie(CookieCurrency); err == nil && cookie != "" {
			currency = cookie
		} else {
			if geo, exists := c.Get("geo"); exists {
				if g, ok := geo.(*services.GeoLocation); ok {
					currency = g.Currency
				}
			}
		}

		if currency == "" {
			currency = "USD"
		}

		if !isValidCurrency(currency) {
			currency = "USD"
		}

		c.Set("user_currency", currency)
		c.Set("price_currency", currency)

		if c.Request.Method == "GET" {
			c.SetCookie(CookieCurrency, currency, 86400*30, "/", "", false, true)
		}

		c.Next()
	}
}

func SetCurrencyHandler(c *gin.Context) gin.HandlerFunc {
	return func(c *gin.Context) {
		currency := c.Query("currency")

		if currency == "" {
			currency = c.GetHeader("X-Preferred-Currency")
		}

		if currency != "" && isValidCurrency(currency) {
			c.Set("user_currency", currency)
			c.SetCookie(CookieCurrency, currency, 86400*30, "/", "", false, true)
		} else {
			if existing, err := c.Cookie(CookieCurrency); err == nil && existing != "" {
				c.Set("user_currency", existing)
			} else if geo, exists := c.Get("geo"); exists {
				if g, ok := geo.(*services.GeoLocation); ok {
					c.Set("user_currency", g.Currency)
				}
			}
		}

		c.Next()
	}
}

func GetUserCurrency(c *gin.Context) string {
	if currency, exists := c.Get("user_currency"); exists {
		return currency.(string)
	}
	return "USD"
}

func ConvertPriceMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		targetCurrency := c.Query("convert_to")

		if targetCurrency == "" {
			targetCurrency = GetUserCurrency(c)
		}

		if targetCurrency != "" && isValidCurrency(targetCurrency) {
			c.Set("convert_to_currency", targetCurrency)
		}

		c.Next()
	}
}

func isValidCurrency(code string) bool {
	_, exists := services.CurrencyMap[code]
	return exists
}

func init() {
}

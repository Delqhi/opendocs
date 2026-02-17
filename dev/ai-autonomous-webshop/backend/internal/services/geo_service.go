package services

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"strings"
	"sync"
	"time"
)

type GeoLocation struct {
	IP          string  `json:"ip"`
	Country     string  `json:"country_code"`
	CountryName string  `json:"country_name"`
	City        string  `json:"city"`
	Region      string  `json:"region"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Currency    string  `json:"currency"`
	Timezone    string  `json:"timezone"`
}

type Currency struct {
	Code          string  `json:"code"`
	Symbol        string  `json:"symbol"`
	Name          string  `json:"name"`
	Rate          float64 `json:"rate"`
	Locale        string  `json:"locale"`
	DecimalPlaces int     `json:"decimal_places"`
}

var (
	CurrencyMap = map[string]Currency{
		"USD": {Code: "USD", Symbol: "$", Name: "US Dollar", Rate: 1.0, Locale: "en-US", DecimalPlaces: 2},
		"EUR": {Code: "EUR", Symbol: "€", Name: "Euro", Rate: 0.92, Locale: "de-DE", DecimalPlaces: 2},
		"GBP": {Code: "GBP", Symbol: "£", Name: "British Pound", Rate: 0.79, Locale: "en-GB", DecimalPlaces: 2},
		"JPY": {Code: "JPY", Symbol: "¥", Name: "Japanese Yen", Rate: 149.50, Locale: "ja-JP", DecimalPlaces: 0},
		"CAD": {Code: "CAD", Symbol: "C$", Name: "Canadian Dollar", Rate: 1.36, Locale: "en-CA", DecimalPlaces: 2},
		"AUD": {Code: "AUD", Symbol: "A$", Name: "Australian Dollar", Rate: 1.53, Locale: "en-AU", DecimalPlaces: 2},
		"CHF": {Code: "CHF", Symbol: "Fr", Name: "Swiss Franc", Rate: 0.88, Locale: "de-CH", DecimalPlaces: 2},
		"CNY": {Code: "CNY", Symbol: "¥", Name: "Chinese Yuan", Rate: 7.24, Locale: "zh-CN", DecimalPlaces: 2},
		"INR": {Code: "INR", Symbol: "₹", Name: "Indian Rupee", Rate: 83.12, Locale: "en-IN", DecimalPlaces: 2},
		"BRL": {Code: "BRL", Symbol: "R$", Name: "Brazilian Real", Rate: 4.97, Locale: "pt-BR", DecimalPlaces: 2},
	}

	CountryToCurrency = map[string]string{
		"US": "USD", "GB": "GBP", "DE": "EUR", "FR": "EUR", "ES": "EUR", "IT": "EUR",
		"NL": "EUR", "BE": "EUR", "AT": "EUR", "IE": "EUR", "PT": "EUR", "FI": "EUR",
		"GR": "EUR", "JP": "JPY", "CA": "CAD", "AU": "AUD", "CH": "CHF", "CN": "CNY",
		"IN": "INR", "BR": "BRL", "MX": "USD", "RU": "RUB", "KR": "KRW", "SG": "SGD",
		"HK": "HKD", "SE": "SEK", "NO": "NOK", "DK": "DKK", "NZ": "NZD", "PL": "PLN",
		"CZ": "CZK", "HU": "HUF", "RO": "RON", "TH": "THB", "MY": "MYR", "ID": "IDR",
		"PH": "PHP", "VN": "VND", "TR": "TRY", "ZA": "ZAR", "AE": "AED", "SA": "SAR",
		"IL": "ILS", "EG": "EGP", "NG": "NGN", "KE": "KES", "MA": "MAD", "CO": "COP",
		"CL": "CLP", "AR": "ARS", "PE": "PEN", "UA": "UAH", "CZ": "CZK", "SK": "EUR",
	}

	geoCache      = make(map[string]*GeoLocation)
	geoCacheMutex sync.RWMutex
	cacheExpiry   = time.Hour
)

type GeoService struct {
	httpClient *http.Client
}

func NewGeoService() *GeoService {
	return &GeoService{
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

func (s *GeoService) DetectLocation(ip string) (*GeoLocation, error) {
	if ip == "" || ip == "127.0.0.1" || ip == "localhost" || strings.HasPrefix(ip, "192.168.") || strings.HasPrefix(ip, "10.") || strings.HasPrefix(ip, "172.") {
		return &GeoLocation{
			IP:          ip,
			Country:     "US",
			CountryName: "United States",
			Currency:    "USD",
		}, nil
	}

	geoCacheMutex.RLock()
	if cached, ok := geoCache[ip]; ok {
		geoCacheMutex.RUnlock()
		return cached, nil
	}
	geoCacheMutex.RUnlock()

	geo, err := s.fetchFromIPAPI(ip)
	if err != nil {
		log.Printf("Geo detection failed for IP %s: %v, using fallback", ip, err)
		return &GeoLocation{
			IP:       ip,
			Country:  "US",
			Currency: "USD",
		}, nil
	}

	geoCacheMutex.Lock()
	geoCache[ip] = geo
	geoCacheMutex.Unlock()

	go s.cleanupOldCache()

	return geo, nil
}

func (s *GeoService) fetchFromIPAPI(ip string) (*GeoLocation, error) {
	url := fmt.Sprintf("https://ipapi.co/%s/json/", ip)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "NEXUS-Shop/1.0")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var geo GeoLocation
	if err := json.NewDecoder(resp.Body).Decode(&geo); err != nil {
		return nil, err
	}

	if geo.Currency == "" {
		if currency, ok := CountryToCurrency[geo.Country]; ok {
			geo.Currency = currency
		} else {
			geo.Currency = "USD"
		}
	}

	return &geo, nil
}

func (s *GeoService) cleanupOldCache() {
	geoCacheMutex.Lock()
	defer geoCacheMutex.Unlock()

	now := time.Now()
	for ip, geo := range geoCache {
		if now.Sub(cacheExpiry) > time.Hour {
			delete(geoCache, ip)
		}
		_ = geo
	}
}

type CurrencyService struct{}

func NewCurrencyService() *CurrencyService {
	return &CurrencyService{}
}

func (s *CurrencyService) GetCurrencyForCountry(countryCode string) Currency {
	if currency, ok := CountryToCurrency[countryCode]; ok {
		if curr, ok := CurrencyMap[currency]; ok {
			return curr
		}
	}
	return CurrencyMap["USD"]
}

func (s *CurrencyService) GetCurrency(code string) Currency {
	if curr, ok := CurrencyMap[code]; ok {
		return curr
	}
	return CurrencyMap["USD"]
}

func (s *CurrencyService) GetSupportedCurrencies() []Currency {
	currencies := make([]Currency, 0, len(CurrencyMap))
	for _, c := range CurrencyMap {
		currencies = append(currencies, c)
	}
	return currencies
}

func (s *CurrencyService) ConvertPrice(amount float64, fromCurrency, toCurrency string) float64 {
	if fromCurrency == toCurrency {
		return amount
	}

	fromRate := CurrencyMap[fromCurrency].Rate
	toRate := CurrencyMap[toCurrency].Rate

	if fromRate == 0 {
		fromRate = 1
	}
	if toRate == 0 {
		toRate = 1
	}

	usdAmount := amount / fromRate
	converted := usdAmount * toRate

	return math.Round(converted*100) / 100
}

func (s *CurrencyService) ConvertPricePrecise(amount float64, fromCurrency, toCurrency string, decimalPlaces int) float64 {
	if fromCurrency == toCurrency {
		return amount
	}

	fromRate := CurrencyMap[fromCurrency].Rate
	toRate := CurrencyMap[toCurrency].Rate

	if fromRate == 0 {
		fromRate = 1
	}
	if toRate == 0 {
		toRate = 1
	}

	usdAmount := amount / fromRate
	converted := usdAmount * toRate

	multiplier := math.Pow10(decimalPlaces)
	return math.Round(converted*multiplier) / multiplier
}

func (s *CurrencyService) FormatPrice(amount float64, currencyCode string) string {
	currency := s.GetCurrency(currencyCode)

	decimalPlaces := currency.DecimalPlaces
	if decimalPlaces == 0 {
		return fmt.Sprintf("%s%d", currency.Symbol, int(math.Round(amount)))
	}

	return fmt.Sprintf("%s%.2f", currency.Symbol, amount)
}

func (s *CurrencyService) GetExchangeRate(fromCurrency, toCurrency string) float64 {
	fromRate := CurrencyMap[fromCurrency].Rate
	toRate := CurrencyMap[toCurrency].Rate

	if fromRate == 0 {
		fromRate = 1
	}
	if toRate == 0 {
		toRate = 1
	}

	return toRate / fromRate
}

func (s *CurrencyService) RefreshRates() error {
	return nil
}

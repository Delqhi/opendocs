package services

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type LLMProvider string

const (
	ProviderGemini   LLMProvider = "gemini"
	ProviderOllama   LLMProvider = "ollama"
	ProviderTemplate LLMProvider = "template"
)

type AIServiceConfig struct {
	LLMProvider   LLMProvider
	GeminiAPIKey  string
	OllamaBaseURL string
	OllamaModel   string
	RateLimit     int
}

type AIService struct {
	config *AIServiceConfig
	client *http.Client
	mu     sync.RWMutex
}

type GenerationRequest struct {
	ProductName string
	Category    string
	Features    []string
	Tone        string
	MaxLength   int
}

type StreamCallback func(chunk string, done bool) error

func NewAIService() *AIService {
	return &AIService{
		config: loadAIConfig(),
		client: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

func loadAIConfig() *AIServiceConfig {
	provider := LLMProvider(getEnv("AI_PROVIDER", "gemini"))

	config := &AIServiceConfig{
		LLMProvider:   provider,
		GeminiAPIKey:  getEnv("GEMINI_API_KEY", ""),
		OllamaBaseURL: getEnv("OLLAMA_BASE_URL", "http://localhost:11434"),
		OllamaModel:   getEnv("OLLAMA_MODEL", "llama3.2"),
		RateLimit:     60,
	}

	log.Printf("AI Service initialized with provider: %s", config.LLMProvider)
	return config
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func (s *AIService) GenerateProductDescription(productName, category string) (string, error) {
	return s.GenerateProductDescriptionStream(productName, category, nil)
}

func (s *AIService) GenerateProductDescriptionStream(productName, category string, callback StreamCallback) (string, error) {
	req := GenerationRequest{
		ProductName: productName,
		Category:    category,
		Tone:        "premium",
		MaxLength:   500,
	}

	var err error
	var result string

	switch s.config.LLMProvider {
	case ProviderGemini:
		result, err = s.generateWithGemini(req, callback)
	case ProviderOllama:
		result, err = s.generateWithOllama(req, callback)
	default:
		result, err = s.generateWithTemplate(req, callback)
	}

	if err != nil {
		log.Printf("Primary provider %s failed: %v, trying fallback...", s.config.LLMProvider, err)
		return s.tryFallback(req, callback)
	}

	return result, nil
}

func (s *AIService) tryFallback(req GenerationRequest, callback StreamCallback) (string, error) {
	providers := []LLMProvider{ProviderGemini, ProviderOllama, ProviderTemplate}
	currentIdx := 0

	for i, p := range providers {
		if p == s.config.LLMProvider {
			currentIdx = i
			break
		}
	}

	for _, provider := range providers[currentIdx+1:] {
		log.Printf("Trying fallback provider: %s", provider)

		var err error
		var result string

		switch provider {
		case ProviderGemini:
			if s.config.GeminiAPIKey == "" {
				continue
			}
			s.config.LLMProvider = ProviderGemini
			result, err = s.generateWithGemini(req, callback)
		case ProviderOllama:
			s.config.LLMProvider = ProviderOllama
			result, err = s.generateWithOllama(req, callback)
		case ProviderTemplate:
			s.config.LLMProvider = ProviderTemplate
			result, err = s.generateWithTemplate(req, callback)
		}

		if err == nil {
			log.Printf("Fallback to %s succeeded", provider)
			return result, nil
		}
		log.Printf("Fallback provider %s failed: %v", provider, err)
	}

	return "", fmt.Errorf("all providers failed")
}

func (s *AIService) generateWithGemini(req GenerationRequest, callback StreamCallback) (string, error) {
	if s.config.GeminiAPIKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY not configured")
	}

	prompt := buildEcommercePrompt(req)

	geminiReq := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"temperature":     0.7,
			"maxOutputTokens": 1024,
			"topP":            0.95,
			"topK":            40,
			"stream":          callback != nil,
		},
	}

	jsonData, err := json.Marshal(geminiReq)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=%s", s.config.GeminiAPIKey)

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusTooManyRequests {
		return "", fmt.Errorf("rate limited by Gemini API")
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Gemini API error (%d): %s", resp.StatusCode, string(body))
	}

	if callback != nil {
		return s.handleGeminiStreaming(resp.Body, callback)
	}

	var geminiResp map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	return extractGeminiText(geminiResp), nil
}

func (s *AIService) handleGeminiStreaming(body io.Reader, callback StreamCallback) (string, error) {
	scanner := bufio.NewScanner(body)
	var fullText strings.Builder

	for scanner.Scan() {
		line := scanner.Text()
		if !strings.HasPrefix(line, "data: ") {
			continue
		}

		data := strings.TrimPrefix(line, "data: ")
		if data == "[DONE]" {
			break
		}

		var chunk map[string]interface{}
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}

		text := extractGeminiText(chunk)
		if text != "" {
			fullText.WriteString(text)
			if err := callback(text, false); err != nil {
				return fullText.String(), err
			}
		}
	}

	callback("", true)
	return fullText.String(), nil
}

func extractGeminiText(resp map[string]interface{}) string {
	candidates, ok := resp["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return ""
	}

	content, ok := candidates[0].(map[string]interface{})["content"].(map[string]interface{})
	if !ok {
		return ""
	}

	parts, ok := content["parts"].([]interface{})
	if !ok || len(parts) == 0 {
		return ""
	}

	text, ok := parts[0].(map[string]interface{})["text"].(string)
	return text
}

func (s *AIService) generateWithOllama(req GenerationRequest, callback StreamCallback) (string, error) {
	prompt := buildEcommercePrompt(req)

	ollamaReq := map[string]interface{}{
		"model":  s.config.OllamaModel,
		"prompt": prompt,
		"stream": callback != nil,
		"options": map[string]interface{}{
			"temperature": 0.7,
			"num_predict": 512,
		},
	}

	jsonData, err := json.Marshal(ollamaReq)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	url := fmt.Sprintf("%s/api/generate", s.config.OllamaBaseURL)

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("Ollama request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Ollama API error (%d): %s", resp.StatusCode, string(body))
	}

	if callback != nil {
		return s.handleOllamaStreaming(resp.Body, callback)
	}

	var ollamaResp map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&ollamaResp); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	response, _ := ollamaResp["response"].(string)
	return response, nil
}

func (s *AIService) handleOllamaStreaming(body io.Reader, callback StreamCallback) (string, error) {
	scanner := bufio.NewScanner(body)
	var fullText strings.Builder

	for scanner.Scan() {
		line := scanner.Text()

		var chunk map[string]interface{}
		if err := json.Unmarshal([]byte(line), &chunk); err != nil {
			continue
		}

		response, ok := chunk["response"].(string)
		if !ok {
			continue
		}

		fullText.WriteString(response)
		if err := callback(response, false); err != nil {
			return fullText.String(), err
		}

		done, ok := chunk["done"].(bool)
		if ok && done {
			break
		}
	}

	callback("", true)
	return fullText.String(), nil
}

func (s *AIService) generateWithTemplate(req GenerationRequest, callback StreamCallback) (string, error) {
	description := generateTemplateDescription(req.ProductName, req.Category)

	if callback != nil {
		words := strings.Split(description, " ")
		for i := 0; i < len(words); i += 5 {
			end := i + 5
			if end > len(words) {
				end = len(words)
			}
			chunk := strings.Join(words[i:end], " ")
			if err := callback(chunk+" ", false); err != nil {
				return description, err
			}
			time.Sleep(10 * time.Millisecond)
		}
		callback("", true)
	}

	return description, nil
}

func buildEcommercePrompt(req GenerationRequest) string {
	return fmt.Sprintf(`You are an expert e-commerce copywriter for a premium online store. 
Create a compelling, high-conversion product description for:

Product: %s
Category: %s

Requirements:
- Tone: %s (professional, persuasive, premium)
- Length: %d words maximum
- Focus on benefits, not just features
- Include emotional triggers that drive purchasing decisions
- Use sensory language where appropriate
- Include 1-2 subtle calls-to-action

Output ONLY the description, no introductions or explanations.`,
		req.ProductName,
		req.Category,
		req.Tone,
		req.MaxLength)
}

func generateTemplateDescription(productName, category string) string {
	return fmt.Sprintf(`Elevate your lifestyle with the %s. This premium %s is meticulously crafted for those who refuse to compromise. 

Engineered with precision and designed for distinction. The %s features cutting-edge technology that anticipates your needs, delivering an unparalleled experience that transforms everyday moments into extraordinary ones.

Why choose the %s?
• Premium quality that stands the test of time
• Innovative design that turns heads
• Unmatched performance that exceeds expectations
• Sustainable materials for a better tomorrow

Experience the difference of true craftsmanship. The %s isn't just a purchase—it's an investment in excellence.

Shop now and discover what sets the %s apart from the rest. Your satisfaction is our promise.`,
		productName,
		category,
		productName,
		productName,
		productName,
		productName)
}

func (s *AIService) AnalyzeSustainability(productName string) int {
	prompt := fmt.Sprintf(`Analyze the sustainability of "%s" on a scale of 0-100. 
Consider: materials, manufacturing process, supply chain, packaging, end-of-life.
Respond ONLY with a number.`, productName)

	ollamaReq := map[string]interface{}{
		"model":  s.config.OllamaModel,
		"prompt": prompt,
		"options": map[string]interface{}{
			"temperature": 0.1,
		},
	}

	jsonData, _ := json.Marshal(ollamaReq)
	url := fmt.Sprintf("%s/api/generate", s.config.OllamaBaseURL)

	resp, err := s.client.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return 75
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 75
	}

	response, ok := result["response"].(string)
	if !ok {
		return 75
	}

	var score int
	fmt.Sscanf(response, "%d", &score)

	if score < 0 || score > 100 {
		return 75
	}

	return score
}

func (s *AIService) SetProvider(provider LLMProvider) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.config.LLMProvider = provider
}

func (s *AIService) GetProvider() LLMProvider {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.config.LLMProvider
}

func (s *AIService) HealthCheck(ctx context.Context) error {
	s.mu.RLock()
	defer s.mu.RUnlock()

	switch s.config.LLMProvider {
	case ProviderGemini:
		if s.config.GeminiAPIKey == "" {
			return fmt.Errorf("GEMINI_API_KEY not configured")
		}
		return nil
	case ProviderOllama:
		url := fmt.Sprintf("%s/api/tags", s.config.OllamaBaseURL)
		req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
		if err != nil {
			return err
		}
		resp, err := s.client.Do(req)
		if err != nil {
			return fmt.Errorf("Ollama not reachable: %w", err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			return fmt.Errorf("Ollama health check failed")
		}
		return nil
	default:
		return nil
	}
}

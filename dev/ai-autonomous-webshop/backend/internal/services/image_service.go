package services

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/bradrydzewski/go-blah"
	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
)

type ImageService struct {
	uploadDir  string
	cacheDir   string
	maxSizeMB  int
	quality    int
	blurhashes map[string]string
	mu         sync.RWMutex
}

const (
	CacheMaxAge = 7 * 24 * time.Hour // 7 days
)

type ProcessedImage struct {
	OriginalURL  string      `json:"original_url"`
	OptimizedURL string      `json:"optimized_url"`
	BlurHash     string      `json:"blur_hash"`
	Width        int         `json:"width"`
	Height       int         `json:"height"`
	Formats      []string    `json:"formats"`
	Sizes        []ImageSize `json:"sizes"`
}

type ImageSize struct {
	Width  int    `json:"width"`
	Height int    `json:"height"`
	URL    string `json:"url"`
}

type ImageMetadata struct {
	Width     int    `json:"width"`
	Height    int    `json:"height"`
	Format    string `json:"format"`
	SizeBytes int64  `json:"size_bytes"`
	BlurHash  string `json:"blur_hash"`
}

func NewImageService() *ImageService {
	uploadDir := os.Getenv("IMAGE_UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads/images"
	}
	cacheDir := os.Getenv("IMAGE_CACHE_DIR")
	if cacheDir == "" {
		cacheDir = "./uploads/optimized"
	}

	return &ImageService{
		uploadDir:  uploadDir,
		cacheDir:   cacheDir,
		maxSizeMB:  10,
		quality:    80,
		blurhashes: make(map[string]string),
	}
}

func (s *ImageService) Init() error {
	if err := os.MkdirAll(s.uploadDir, 0755); err != nil {
		return fmt.Errorf("failed to create upload dir: %w", err)
	}
	if err := os.MkdirAll(s.cacheDir, 0755); err != nil {
		return fmt.Errorf("failed to create cache dir: %w", err)
	}
	return nil
}

func (s *ImageService) UploadAndProcess(ctx context.Context, file *multipart.FileHeader) (*ProcessedImage, error) {
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	originalData, err := io.ReadAll(src)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	if len(originalData) > s.maxSizeMB*1024*1024 {
		return nil, fmt.Errorf("file too large: max %dMB", s.maxSizeMB)
	}

	img, format, err := image.Decode(bytes.NewReader(originalData))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	filename := s.generateFilename(file.Filename)
	originalPath := filepath.Join(s.uploadDir, filename)

	if err := os.WriteFile(originalPath, originalData, 0644); err != nil {
		return nil, fmt.Errorf("failed to save original: %w", err)
	}

	blurHash, err := s.generateBlurHash(img)
	if err != nil {
		blurHash = ""
	}

	s.mu.Lock()
	s.blurhashes[filename] = blurHash
	s.mu.Unlock()

	formats := []string{}
	if format == "jpeg" || format == "jpg" {
		formats = []string{"avif", "webp", "jpeg"}
	} else {
		formats = []string{"avif", "webp"}
	}

	sizes := []ImageSize{
		{Width: 400, Height: int(float64(height) * (400.0 / float64(width))), URL: ""},
		{Width: 800, Height: int(float64(height) * (800.0 / float64(width))), URL: ""},
		{Width: 1200, Height: int(float64(height) * (1200.0 / float64(width))), URL: ""},
	}

	for i, size := range sizes {
		sizes[i].URL = s.generateOptimizedURL(filename, size.Width, size.Height, "avif")
	}

	originalURL := fmt.Sprintf("/api/v1/images/%s", filename)
	optimizedURL := s.generateOptimizedURL(filename, 800, 600, "avif")

	return &ProcessedImage{
		OriginalURL:  originalURL,
		OptimizedURL: optimizedURL,
		BlurHash:     blurHash,
		Width:        width,
		Height:       height,
		Formats:      formats,
		Sizes:        sizes,
	}, nil
}

func (s *ImageService) ProcessExistingImage(filename string) (*ProcessedImage, error) {
	originalPath := filepath.Join(s.uploadDir, filename)
	data, err := os.ReadFile(originalPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	img, format, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	blurHash, err := s.generateBlurHash(img)
	if err != nil {
		blurHash = ""
	}

	s.mu.Lock()
	s.blurhashes[filename] = blurHash
	s.mu.Unlock()

	formats := []string{}
	if format == "jpeg" || format == "jpg" {
		formats = []string{"avif", "webp", "jpeg"}
	} else {
		formats = []string{"avif", "webp"}
	}

	originalURL := fmt.Sprintf("/api/v1/images/%s", filename)
	optimizedURL := s.generateOptimizedURL(filename, 800, 600, "avif")

	return &ProcessedImage{
		OriginalURL:  originalURL,
		OptimizedURL: optimizedURL,
		BlurHash:     blurHash,
		Width:        width,
		Height:       height,
		Formats:      formats,
		Sizes:        nil,
	}, nil
}

func (s *ImageService) GetOptimizedImage(c *gin.Context) {
	filename := c.Param("filename")
	width, _ := strconv.Atoi(c.Query("w"))
	height, _ := strconv.Atoi(c.Query("h"))
	format := c.DefaultQuery("fmt", "avif")
	quality, _ := strconv.Atoi(c.DefaultQuery("q", strconv.Itoa(s.quality)))

	if width == 0 {
		width = 800
	}
	if height == 0 {
		height = 600
	}

	cacheKey := fmt.Sprintf("%s_%dx%d_%d.%s", filename, width, height, quality, format)
	cachePath := filepath.Join(s.cacheDir, cacheKey)

	if data, err := os.ReadFile(cachePath); err == nil {
		contentType := s.getContentType(format)
		c.Data(http.StatusOK, contentType, data)
		return
	}

	originalPath := filepath.Join(s.uploadDir, filename)
	data, err := os.ReadFile(originalPath)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	img, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode image"})
		return
	}

	optimized := imaging.Resize(img, width, height, imaging.Lanczos)

	var buf bytes.Buffer
	switch format {
	case "avif":
		if err := imaging.Encode(&buf, optimized, imaging.AVIF); err != nil {
			format = "webp"
			if err := imaging.Encode(&buf, optimized, imaging.WebP); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode image"})
				return
			}
		}
	case "webp":
		if err := imaging.Encode(&buf, optimized, imaging.WebP); err != nil {
			if err := imaging.Encode(&buf, optimized, imaging.JPEG); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode image"})
				return
			}
			format = "jpeg"
		}
	case "jpeg", "jpg":
		if err := imaging.Encode(&buf, optimized, imaging.JPEG); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode image"})
			return
		}
	default:
		if err := imaging.Encode(&buf, optimized, imaging.AVIF); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode image"})
			return
		}
	}

	os.WriteFile(cachePath, buf.Bytes(), 0644)

	contentType := s.getContentType(format)
	c.Data(http.StatusOK, contentType, buf.Bytes())
}

func (s *ImageService) GetBlurHash(filename string) string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.blurhashes[filename]
}

func (s *ImageService) GetBlurHashFromImage(c *gin.Context) {
	filename := c.Param("filename")

	s.mu.RLock()
	blurHash := s.blurhashes[filename]
	s.mu.RUnlock()

	if blurHash == "" {
		originalPath := filepath.Join(s.uploadDir, filename)
		data, err := os.ReadFile(originalPath)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
			return
		}

		img, _, err := image.Decode(bytes.NewReader(data))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode image"})
			return
		}

		blurHash, _ = s.generateBlurHash(img)
		s.mu.Lock()
		s.blurhashes[filename] = blurHash
		s.mu.Unlock()
	}

	c.JSON(http.StatusOK, gin.H{"blur_hash": blurHash})
}

func (s *ImageService) generateFilename(original string) string {
	ext := filepath.Ext(original)
	name := strings.TrimSuffix(original, ext)
	name = strings.ToLower(strings.ReplaceAll(name, " ", "-"))
	return fmt.Sprintf("%s_%d%s", name, os.Getpid(), ext)
}

func (s *ImageService) generateOptimizedURL(filename string, width, height int, format string) string {
	ext := filepath.Ext(filename)
	name := strings.TrimSuffix(filename, ext)
	return fmt.Sprintf("/api/v1/images/%s/optimized?w=%d&h=%d&fmt=%s", name, width, height, format)
}

func (s *ImageService) getContentType(format string) string {
	switch format {
	case "avif":
		return "image/avif"
	case "webp":
		return "image/webp"
	case "jpeg", "jpg":
		return "image/jpeg"
	case "png":
		return "image/png"
	default:
		return "image/jpeg"
	}
}

func (s *ImageService) generateBlurHash(img image.Image) (string, error) {
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	if width > 100 || height > 100 {
		scale := float64(100) / float64(max(width, height))
		img = imaging.Resize(img, int(float64(width)*scale), int(float64(height)*scale), imaging.Lanczos)
		bounds = img.Bounds()
	}

	componentsX := 4
	componentsY := 4

	if width < 4 {
		componentsX = width
	}
	if height < 4 {
		componentsY = height
	}

	var encodeFunc func([]float64, []float64, int, int) string
	encodeFunc = encodeBlurHash

	return encodeFunc(extractImageData(img), componentsX, componentsY), nil
}

func extractImageData(img image.Image) []float64 {
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	pixels := make([]float64, width*height*3)

	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			r, g, b, _ := img.At(x, y).RGBA()
			idx := (y*width + x) * 3
			pixels[idx] = float64(r) / 65535.0
			pixels[idx+1] = float64(g) / 65535.0
			pixels[idx+2] = float64(b) / 65535.0
		}
	}

	return pixels
}

func encodeBlurHash(pixels []float64, componentsX, componentsY int) string {
	width := 32
	height := 32
	if len(pixels)/(3*width) >= 32 {
		height = 32
	} else {
		height = len(pixels) / (3 * width)
		if height == 0 {
			height = 1
		}
	}

	dc := make([]float64, 3)
	dc[0] = averageChannel(pixels, 0, width, height)
	dc[1] = averageChannel(pixels, 1, width, height)
	dc[2] = averageChannel(pixels, 2, width, height)

	colors := make([]color.RGBA, componentsX*componentsY)

	encodeColors := make([]string, 0, componentsX*componentsY+1)

	dcR := int(dc[0] * 255)
	dcG := int(dc[1] * 255)
	dcB := int(dc[2] * 255)
	encodeColors = append(encodeColors, encodeBase83(dcR<<10|dcG<<5|dcB, 4))

	simpleChars := "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~"

	result := ""
	for _, c := range encodeColors {
		result += c
	}

	return "L" + result
}

func averageChannel(pixels []float64, channel int, width, height int) float64 {
	sum := 0.0
	count := 0
	for i := channel; i < len(pixels); i += 3 {
		sum += pixels[i]
		count++
	}
	if count == 0 {
		return 0
	}
	return sum / float64(count)
}

func encodeBase83(value int, length int) string {
	chars := "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~"
	result := ""
	for i := length - 1; i >= 0; i-- {
		idx := (value / pow83(i)) % 83
		result += string(chars[idx])
	}
	return result
}

func pow83(n int) int {
	result := 1
	for i := 0; i < n; i++ {
		result *= 83
	}
	return result
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func (s *ImageService) GetMetadata(filename string) (*ImageMetadata, error) {
	originalPath := filepath.Join(s.uploadDir, filename)
	data, err := os.ReadFile(originalPath)
	if err != nil {
		return nil, err
	}

	img, format, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, err
	}

	bounds := img.Bounds()

	s.mu.RLock()
	blurHash := s.blurhashes[filename]
	s.mu.RUnlock()

	return &ImageMetadata{
		Width:     bounds.Dx(),
		Height:    bounds.Dy(),
		Format:    format,
		SizeBytes: int64(len(data)),
		BlurHash:  blurHash,
	}, nil
}

func (s *ImageService) ServeStaticImage(c *gin.Context) {
	filename := c.Param("filename")
	filepath := filepath.Join(s.uploadDir, filename)

	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	c.File(filepath)
}

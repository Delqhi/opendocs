package handlers

import (
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/services"
)

type ImageHandler struct {
	service *services.ImageService
}

func NewImageHandler() *ImageHandler {
	imgService := services.NewImageService()
	if err := imgService.Init(); err != nil {
		panic("Failed to initialize image service: " + err.Error())
	}
	return &ImageHandler{
		service: imgService,
	}
}

func (h *ImageHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
		return
	}

	allowedExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedExtensions[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image format. Allowed: jpg, jpeg, png, gif, webp"})
		return
	}

	processed, err := h.service.UploadAndProcess(c.Request.Context(), file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, processed)
}

func (h *ImageHandler) GetOptimized(c *gin.Context) {
	h.service.GetOptimizedImage(c)
}

func (h *ImageHandler) GetBlurHash(c *gin.Context) {
	h.service.GetBlurHashFromImage(c)
}

func (h *ImageHandler) GetMetadata(c *gin.Context) {
	filename := c.Param("filename")

	metadata, err := h.service.GetMetadata(filename)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	c.JSON(http.StatusOK, metadata)
}

func (h *ImageHandler) ServeImage(c *gin.Context) {
	h.service.ServeStaticImage(c)
}

func (h *ImageHandler) RegisterRoutes(r *gin.RouterGroup) {
	images := r.Group("/images")
	{
		images.POST("", h.Upload)
		images.GET("/:filename", h.ServeImage)
		images.GET("/:filename/optimized", h.GetOptimized)
		images.GET("/:filename/blurhash", h.GetBlurHash)
		images.GET("/:filename/metadata", h.GetMetadata)
	}
}

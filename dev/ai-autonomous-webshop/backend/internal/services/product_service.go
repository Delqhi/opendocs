package services

import (
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/db"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
	"gorm.io/gorm"
)

type ProductService struct{}

type ProductListResult struct {
	Products   []models.Product `json:"products"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	PageSize   int              `json:"page_size"`
	TotalPages int              `json:"total_pages"`
}

func (s *ProductService) GetAll() ([]models.Product, error) {
	var products []models.Product
	if err := db.DB.Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (s *ProductService) GetPaginated(page, pageSize int) (*ProductListResult, error) {
	var products []models.Product
	var total int64

	db.DB.Model(&models.Product{}).Count(&total)

	if err := db.DB.Scopes(db.Paginate(page, pageSize)).Find(&products).Error; err != nil {
		return nil, err
	}

	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &ProductListResult{
		Products:   products,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *ProductService) GetByCategory(category string, page, pageSize int) (*ProductListResult, error) {
	var products []models.Product
	var total int64

	query := db.DB.Model(&models.Product{}).Where("category = ?", category)
	query.Count(&total)

	if err := query.Scopes(db.Paginate(page, pageSize)).Find(&products).Error; err != nil {
		return nil, err
	}

	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &ProductListResult{
		Products:   products,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *ProductService) GetByID(id uint) (*models.Product, error) {
	var product models.Product
	if err := db.DB.First(&product, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &product, nil
}

func (s *ProductService) Create(product *models.Product) error {
	return db.DB.Create(product).Error
}

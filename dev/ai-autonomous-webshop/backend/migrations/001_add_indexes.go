package migrations

import (
	"log"

	"github.com/jeremy/ai-autonomous-webshop/backend/internal/db"
	"github.com/jeremy/ai-autonomous-webshop/backend/internal/models"
)

func RunMigrations() error {
	log.Println("Running database migrations...")

	if err := db.DB.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.Order{},
		&models.OrderItem{},
		&models.CartItem{},
	); err != nil {
		return err
	}

	log.Println("Migrations completed successfully")
	return nil
}

func CreateIndexes() error {
	log.Println("Creating additional indexes...")

	db := db.DB

	indexes := []struct {
		name    string
		table   string
		columns string
	}{
		{"idx_products_category", "products", "category"},
		{"idx_orders_user_id", "orders", "user_id"},
		{"idx_orders_status", "orders", "status"},
		{"idx_order_items_order_id", "order_items", "order_id"},
		{"idx_order_items_product_id", "order_items", "product_id"},
		{"idx_cart_items_user_id", "cart_items", "user_id"},
		{"idx_cart_items_product_id", "cart_items", "product_id"},
		{"idx_cart_items_user_product", "cart_items", "user_id,product_id"},
	}

	for _, idx := range indexes {
		query := "CREATE INDEX IF NOT EXISTS " + idx.name + " ON " + idx.table + " (" + idx.columns + ")"
		if err := db.Exec(query).Error; err != nil {
			log.Printf("Warning: Failed to create index %s: %v", idx.name, err)
		} else {
			log.Printf("Created index: %s", idx.name)
		}
	}

	log.Println("Index creation completed")
	return nil
}

func Migrate() error {
	if err := RunMigrations(); err != nil {
		return err
	}

	if err := CreateIndexes(); err != nil {
		return err
	}

	return nil
}

func RollbackMigration(migrationName string) error {
	return db.DB.Migrator().DropTable(migrationName)
}

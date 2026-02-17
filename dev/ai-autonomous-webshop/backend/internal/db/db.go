package db

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB
var Redis *redis.Client

func Connect(databaseURL string) {
	var err error

	sqlDB, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	DB = sqlDB

	// Get underlying sql.DB for connection pool settings
	sqlDBInstance, err := sqlDB.DB()
	if err != nil {
		log.Fatalf("Failed to get underlying sql.DB: %v", err)
	}

	// Set connection pool settings
	sqlDBInstance.SetMaxIdleConns(10)
	sqlDBInstance.SetMaxOpenConns(100)
	sqlDBInstance.SetConnMaxLifetime(time.Hour)

	log.Println("Successfully connected to database")
}

func ConnectRedis(redisURL string) {
	Redis = redis.NewClient(&redis.Options{
		Addr:         redisURL,
		Password:     "",
		DB:           0,
		PoolSize:     10,
		MinIdleConns: 5,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := Redis.Ping(ctx).Err(); err != nil {
		log.Printf("Warning: Failed to connect to Redis: %v", err)
		Redis = nil
		return
	}

	log.Println("Successfully connected to Redis")
}

func PingDB() error {
	if DB == nil {
		return ErrNoDatabase
	}
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

func PingRedis() error {
	if Redis == nil {
		return ErrNoRedis
	}
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	return Redis.Ping(ctx).Err()
}

func Close() {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err == nil {
			sqlDB.Close()
			log.Println("Database connections closed")
		}
	}
	if Redis != nil {
		Redis.Close()
		log.Println("Redis connections closed")
	}
}

var (
	ErrNoDatabase = &DBError{Message: "database not connected"}
	ErrNoRedis    = &DBError{Message: "redis not connected"}
)

type DBError struct {
	Message string
}

func (e *DBError) Error() string {
	return e.Message
}

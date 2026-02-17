package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                     string
	DatabaseURL              string
	JWTSecret                string
	RedisURL                 string
	RateLimitPublicPerMinute int
	RateLimitAuthPerMinute   int
	RateLimitWritePerMinute  int
	RateLimitEnabled         bool
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	return &Config{
		Port:                     getEnv("PORT", "8080"),
		DatabaseURL:              getEnv("DATABASE_URL", ""),
		JWTSecret:                getEnv("JWT_SECRET", "change-me-in-prod"),
		RedisURL:                 getEnv("REDIS_URL", "localhost:6379"),
		RateLimitPublicPerMinute: getEnvInt("RATE_LIMIT_PUBLIC", 100),
		RateLimitAuthPerMinute:   getEnvInt("RATE_LIMIT_AUTH", 500),
		RateLimitWritePerMinute:  getEnvInt("RATE_LIMIT_WRITE", 50),
		RateLimitEnabled:         getEnvBool("RATE_LIMIT_ENABLED", true),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if value, exists := os.LookupEnv(key); exists {
		return value == "true" || value == "1" || value == "yes"
	}
	return fallback
}

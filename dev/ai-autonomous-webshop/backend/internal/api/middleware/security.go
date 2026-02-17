package middleware

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"log/slog"
)

type rateLimiter struct {
	requests map[string]*clientWindow
	mu       sync.RWMutex
	window   time.Duration
	limit    int
}

type clientWindow struct {
	count     int
	expiresAt time.Time
}

func newRateLimiter(window time.Duration, limit int) *rateLimiter {
	rl := &rateLimiter{
		requests: make(map[string]*clientWindow),
		window:   window,
		limit:    limit,
	}
	go rl.cleanup()
	return rl
}

func (rl *rateLimiter) cleanup() {
	ticker := time.NewTicker(rl.window)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, cw := range rl.requests {
			if cw.expiresAt.Before(now) {
				delete(rl.requests, key)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *rateLimiter) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	cw, exists := rl.requests[key]

	if !exists || cw.expiresAt.Before(now) {
		rl.requests[key] = &clientWindow{
			count:     1,
			expiresAt: now.Add(rl.window),
		}
		return true
	}

	if cw.count >= rl.limit {
		return false
	}

	cw.count++
	return true
}

func (rl *rateLimiter) getRemaining(key string) int {
	rl.mu.RLock()
	defer rl.mu.RUnlock()

	cw, exists := rl.requests[key]
	if !exists {
		return rl.limit
	}

	if cw.expiresAt.Before(time.Now()) {
		return rl.limit
	}

	return rl.limit - cw.count
}

var (
	publicLimiter *rateLimiter
	authLimiter   *rateLimiter
	writeLimiter  *rateLimiter
)

func init() {
	publicLimiter = newRateLimiter(time.Minute, 100)
	authLimiter = newRateLimiter(time.Minute, 500)
	writeLimiter = newRateLimiter(time.Minute, 50)
}

type RateLimitConfig struct {
	PublicRequestsPerMinute int
	AuthRequestsPerMinute   int
	WriteRequestsPerMinute  int
	EnableRateLimiting      bool
}

var rateLimitConfig = RateLimitConfig{
	PublicRequestsPerMinute: 100,
	AuthRequestsPerMinute:   500,
	WriteRequestsPerMinute:  50,
	EnableRateLimiting:      true,
}

func SetRateLimitConfig(cfg RateLimitConfig) {
	rateLimitConfig = cfg
	publicLimiter = newRateLimiter(time.Minute, cfg.PublicRequestsPerMinute)
	authLimiter = newRateLimiter(time.Minute, cfg.AuthRequestsPerMinute)
	writeLimiter = newRateLimiter(time.Minute, cfg.WriteRequestsPerMinute)
}

func PublicRateLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !rateLimitConfig.EnableRateLimiting {
			c.Next()
			return
		}

		key := getRateLimitKey(c)
		remaining := publicLimiter.getRemaining(key)

		if !publicLimiter.allow(key) {
			logRateLimitBlock(c, "public", key)
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":      "Rate limit exceeded",
				"message":    "Too many requests. Please try again later.",
				"retryAfter": "60s",
				"limit":      rateLimitConfig.PublicRequestsPerMinute,
				"window":     "60s",
			})
			return
		}

		c.Header("X-RateLimit-Limit", strconv.Itoa(rateLimitConfig.PublicRequestsPerMinute))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))
		c.Header("X-RateLimit-Reset", "60")

		c.Next()
	}
}

func AuthRateLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !rateLimitConfig.EnableRateLimiting {
			c.Next()
			return
		}

		key := getRateLimitKey(c)
		remaining := authLimiter.getRemaining(key)

		if !authLimiter.allow(key) {
			logRateLimitBlock(c, "auth", key)
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":      "Rate limit exceeded",
				"message":    "Too many requests. Please try again later.",
				"retryAfter": "60s",
				"limit":      rateLimitConfig.AuthRequestsPerMinute,
				"window":     "60s",
			})
			return
		}

		c.Header("X-RateLimit-Limit", strconv.Itoa(rateLimitConfig.AuthRequestsPerMinute))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))
		c.Header("X-RateLimit-Reset", "60")

		c.Next()
	}
}

func WriteRateLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !rateLimitConfig.EnableRateLimiting {
			c.Next()
			return
		}

		key := getRateLimitKey(c)
		remaining := writeLimiter.getRemaining(key)

		if !writeLimiter.allow(key) {
			logRateLimitBlock(c, "write", key)
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":      "Rate limit exceeded",
				"message":    "Too many write operations. Please try again later.",
				"retryAfter": "60s",
				"limit":      rateLimitConfig.WriteRequestsPerMinute,
				"window":     "60s",
			})
			return
		}

		c.Header("X-RateLimit-Limit", strconv.Itoa(rateLimitConfig.WriteRequestsPerMinute))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))
		c.Header("X-RateLimit-Reset", "60")

		c.Next()
	}
}

func getRateLimitKey(c *gin.Context) string {
	if userID, exists := c.Get("userID"); exists {
		return "user:" + strconv.FormatUint(uint64(userID.(uint)), 10)
	}
	return "ip:" + c.ClientIP()
}

func logRateLimitBlock(c *gin.Context, limiterType, key string) {
	logger.Warn("rate_limit_blocked",
		slog.String("requestID", GetRequestID(c)),
		slog.String("type", limiterType),
		slog.String("key", key),
		slog.String("method", c.Request.Method),
		slog.String("path", c.Request.URL.Path),
		slog.String("clientIP", c.ClientIP()),
		slog.String("userAgent", c.Request.UserAgent()),
		slog.Time("timestamp", time.Now()),
	)
}

func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

		c.Header("Content-Security-Policy",
			"default-src 'self'; "+
				"script-src 'self' 'unsafe-inline' 'unsafe-eval'; "+
				"style-src 'self' 'unsafe-inline'; "+
				"img-src 'self' data: https:; "+
				"font-src 'self' data:; "+
				"connect-src 'self' https:; "+
				"frame-ancestors 'none'; "+
				"form-action 'self'; "+
				"base-uri 'self';")

		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Header("X-Permitted-Cross-Domain-Policies", "none")

		c.Next()
	}
}

func SecurityHeadersMiddlewareWithCSP(csp string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

		if csp != "" {
			c.Header("Content-Security-Policy", csp)
		} else {
			c.Header("Content-Security-Policy",
				"default-src 'self'; "+
					"script-src 'self' 'unsafe-inline' 'unsafe-eval'; "+
					"style-src 'self' 'unsafe-inline'; "+
					"img-src 'self' data: https:; "+
					"font-src 'self' data:; "+
					"connect-src 'self' https:; "+
					"frame-ancestors 'none'; "+
					"form-action 'self'; "+
					"base-uri 'self';")
		}

		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Header("X-Permitted-Cross-Domain-Policies", "none")

		c.Next()
	}
}

func GetRateLimitConfig() RateLimitConfig {
	return rateLimitConfig
}

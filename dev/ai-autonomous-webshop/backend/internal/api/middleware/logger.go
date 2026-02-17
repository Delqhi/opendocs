package middleware

import (
	"context"
	"io"
	"log/slog"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	logger *slog.Logger
)

func init() {
	logger = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
}

func SetLogger(l *slog.Logger) {
	logger = l
}

func SetLoggerOutput(w io.Writer) {
	logger = slog.New(slog.NewJSONHandler(w, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
}

func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		requestID := GetRequestID(c)

		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		if query != "" {
			path = path + "?" + query
		}

		logger.Info("request started",
			slog.String("requestID", requestID),
			slog.String("method", c.Request.Method),
			slog.String("path", path),
			slog.String("clientIP", c.ClientIP()),
			slog.String("userAgent", c.Request.UserAgent()),
		)

		c.Next()

		latency := time.Since(startTime)
		statusCode := c.Writer.Status()

		logger.Info("request completed",
			slog.String("requestID", requestID),
			slog.Int("statusCode", statusCode),
			slog.String("method", c.Request.Method),
			slog.String("path", path),
			slog.Duration("latency", latency),
			slog.String("clientIP", c.ClientIP()),
		)
	}
}

func LoggerWithContext(ctx context.Context) *slog.Logger {
	if requestID := GetRequestIDFromContext(ctx); requestID != "" {
		return logger.With(slog.String("requestID", requestID))
	}
	return logger
}

func GetLogger() *slog.Logger {
	return logger
}

func LogError(ctx context.Context, msg string, err error) {
	requestID := GetRequestIDFromContext(ctx)
	logger.Error(msg,
		slog.String("requestID", requestID),
		slog.String("error", err.Error()),
	)
}

func LogInfo(ctx context.Context, msg string, attrs ...slog.Attr) {
	requestID := GetRequestIDFromContext(ctx)
	args := []any{slog.String("requestID", requestID)}
	for _, attr := range attrs {
		args = append(args, attr)
	}
	logger.Info(msg, args...)
}

func LogDebug(ctx context.Context, msg string, attrs ...slog.Attr) {
	requestID := GetRequestIDFromContext(ctx)
	args := []any{slog.String("requestID", requestID)}
	for _, attr := range attrs {
		args = append(args, attr)
	}
	logger.Debug(msg, args...)
}

func LogWarn(ctx context.Context, msg string, attrs ...slog.Attr) {
	requestID := GetRequestIDFromContext(ctx)
	args := []any{slog.String("requestID", requestID)}
	for _, attr := range attrs {
		args = append(args, attr)
	}
	logger.Warn(msg, args...)
}

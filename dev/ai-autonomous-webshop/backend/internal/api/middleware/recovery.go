package middleware

import (
	"fmt"
	"log/slog"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				requestID := GetRequestID(c)

				logger.Error("panic recovered",
					slog.String("requestID", requestID),
					slog.String("panic", fmt.Sprintf("%v", err)),
					slog.String("stack", string(debug.Stack())),
				)

				c.Header("X-Request-ID", requestID)
				c.JSON(http.StatusInternalServerError, ErrorResponse{
					Error:   "internal_error",
					Message: "An unexpected error occurred",
					Detail:  "The server encountered an unexpected condition",
					Code:    http.StatusInternalServerError,
					Meta: map[string]string{
						"requestID": requestID,
					},
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}

package middleware

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AppError struct {
	Code       int    `json:"code"`
	Message    string `json:"message"`
	Detail     string `json:"detail,omitempty"`
	Err        error  `json:"-"`
	IsInternal bool   `json:"-"`
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return e.Message + ": " + e.Err.Error()
	}
	return e.Message
}

func (e *AppError) Unwrap() error {
	return e.Err
}

func NewAppError(code int, message string, detail string, err error) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		Detail:     detail,
		Err:        err,
		IsInternal: code >= 500,
	}
}

func BadRequest(message string, detail string) *AppError {
	return NewAppError(http.StatusBadRequest, message, detail, nil)
}

func Unauthorized(message string, detail string) *AppError {
	return NewAppError(http.StatusUnauthorized, message, detail, nil)
}

func Forbidden(message string, detail string) *AppError {
	return NewAppError(http.StatusForbidden, message, detail, nil)
}

func NotFound(message string, detail string) *AppError {
	return NewAppError(http.StatusNotFound, message, detail, nil)
}

func Conflict(message string, detail string) *AppError {
	return NewAppError(http.StatusConflict, message, detail, nil)
}

func InternalServerError(message string, detail string) *AppError {
	return NewAppError(http.StatusInternalServerError, message, detail, nil)
}

func ServiceUnavailable(message string, detail string) *AppError {
	return NewAppError(http.StatusServiceUnavailable, message, detail, nil)
}

func WrapError(err error, message string) *AppError {
	if appErr, ok := err.(*AppError); ok {
		return appErr
	}
	return NewAppError(http.StatusInternalServerError, message, "", err)
}

func IsAppError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr)
}

func GetStatusCode(err error) int {
	if appErr, ok := err.(*AppError); ok {
		return appErr.Code
	}
	return http.StatusInternalServerError
}

type ErrorResponse struct {
	Error   string            `json:"error"`
	Message string            `json:"message,omitempty"`
	Detail  string            `json:"detail,omitempty"`
	Code    int               `json:"code"`
	Meta    map[string]string `json:"meta,omitempty"`
}

func SendError(c *gin.Context, err error) {
	requestID := GetRequestID(c)

	if appErr, ok := err.(*AppError); ok {
		if appErr.IsInternal {
			logger.Error("internal error",
				slog.String("requestID", requestID),
				slog.String("message", appErr.Message),
				slog.String("detail", appErr.Detail),
				slog.String("error", appErr.Err.Error()),
			)
		}

		c.JSON(appErr.Code, ErrorResponse{
			Error:   getErrorType(appErr.Code),
			Message: appErr.Message,
			Detail:  appErr.Detail,
			Code:    appErr.Code,
		})
		return
	}

	logger.Error("unknown error",
		slog.String("requestID", requestID),
		slog.String("error", err.Error()),
	)

	c.JSON(http.StatusInternalServerError, ErrorResponse{
		Error:   "internal_error",
		Message: "An unexpected error occurred",
		Code:    http.StatusInternalServerError,
	})
}

func getErrorType(statusCode int) string {
	switch statusCode {
	case http.StatusBadRequest:
		return "bad_request"
	case http.StatusUnauthorized:
		return "unauthorized"
	case http.StatusForbidden:
		return "forbidden"
	case http.StatusNotFound:
		return "not_found"
	case http.StatusConflict:
		return "conflict"
	case http.StatusServiceUnavailable:
		return "service_unavailable"
	default:
		return "internal_error"
	}
}

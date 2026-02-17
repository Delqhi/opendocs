# =============================================================================
# STAGE 1: Builder - Compile Go binary
# =============================================================================
FROM golang:1.23-alpine AS builder

# Install build dependencies
RUN apk add --no-cache upx

WORKDIR /app

# Copy dependency files FIRST for better layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build with optimizations: static binary, stripped debug info, UPX compression
# CGO_ENABLED=0 = static binary, no cgo dependencies
# -s = strip symbols, -w = remove debug info
# upx = compress binary further (typically 40-50% reduction)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w -extldflags=-static" -o server cmd/server/main.go && \
    upx -9 server

# =============================================================================
# STAGE 2: Runtime - Minimal production image
# =============================================================================
FROM alpine:3.19 AS runtime

WORKDIR /app

# Install only what's needed: certificates for TLS
RUN apk add --no-cache ca-certificates upx

# Copy binary from builder (already UPX compressed)
COPY --from=builder /app/server .

# Copy environment file
COPY --from=builder /app/.env .

# Non-root user for security
RUN adduser -D -g '' appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./server"]

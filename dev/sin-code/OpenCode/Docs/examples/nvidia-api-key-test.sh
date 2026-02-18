#!/bin/bash

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  NVIDIA API Key Test                                      ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

print_header

if [ -z "$NVIDIA_API_KEY" ]; then
    read -p "Enter NVIDIA API Key: " api_key
    export NVIDIA_API_KEY="$api_key"
fi

echo "Testing NVIDIA API connection..."
echo ""

response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $NVIDIA_API_KEY" \
    "https://integrate.api.nvidia.com/v1/models")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    print_success "API connection successful!"
    echo ""
    echo "Available models:"
    echo "$body" | grep -o '"id":"[^"]*"' | head -10 | sed 's/"id":"/  - /g' | sed 's/"//g'
    echo ""
    print_success "NVIDIA API key is valid and working"
elif [ "$http_code" = "401" ]; then
    print_error "Authentication failed (HTTP 401)"
    echo "Your API key is invalid or expired"
    echo "Get a new key at: https://build.nvidia.com"
    exit 1
elif [ "$http_code" = "429" ]; then
    print_error "Rate limit exceeded (HTTP 429)"
    echo "Wait 60 seconds and try again"
    exit 1
else
    print_error "Unexpected response: HTTP $http_code"
    echo "$body"
    exit 1
fi

echo ""
echo "Testing model inference..."

test_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $NVIDIA_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "moonshotai/kimi-k2.5",
      "messages": [{"role": "user", "content": "Say hello"}],
      "max_tokens": 10
    }' \
    "https://integrate.api.nvidia.com/v1/chat/completions")

test_code=$(echo "$test_response" | tail -n1)

if [ "$test_code" = "200" ]; then
    print_success "Model inference test passed!"
else
    print_warning "Model inference returned HTTP $test_code (may be normal for testing)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "NVIDIA API key verification complete"
echo ""
echo "To set permanently, add to ~/.zshrc:"
echo "  export NVIDIA_API_KEY=\"$NVIDIA_API_KEY\""

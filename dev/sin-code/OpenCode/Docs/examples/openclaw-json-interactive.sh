#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

CONFIG_DIR="$HOME/.openclaw"
OUTPUT_FILE="$CONFIG_DIR/openclaw.json"

print_header() {
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  OpenClaw Configuration Generator                         ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() { echo -e "${GREEN}► $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }

echo "OpenClaw Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Enter NVIDIA API Key: " api_key
read -p "Enter primary model (default: nvidia/moonshotai/kimi-k2.5): " primary_model
primary_model=${primary_model:-nvidia/moonshotai/kimi-k2.5}

echo ""
echo "Fallback models:"
echo "  [1] nvidia/meta/llama-3.3-70b-instruct"
echo "  [2] nvidia/mistralai/mistral-large-3-675b-instruct-2512"
echo "  [3] Both"
echo ""
read -p "Select fallback (1-3, default: 3): " fallback_choice

case $fallback_choice in
    1) FALLBACK1="nvidia/meta/llama-3.3-70b-instruct" ;;
    2) FALLBACK1="nvidia/mistralai/mistral-large-3-675b-instruct-2512" ;;
    *) FALLBACK1="nvidia/meta/llama-3.3-70b-instruct"
       FALLBACK2="nvidia/mistralai/mistral-large-3-675b-instruct-2512" ;;
esac

mkdir -p "$CONFIG_DIR"

if [ -n "$FALLBACK2" ]; then
    cat > "$OUTPUT_FILE" << EOF
{
  "env": {
    "NVIDIA_API_KEY": "$api_key"
  },
  "models": {
    "providers": {
      "nvidia": {
        "baseUrl": "https://integrate.api.nvidia.com/v1",
        "api": "openai-completions",
        "models": []
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "$primary_model",
        "fallbacks": [
          "$FALLBACK1",
          "$FALLBACK2"
        ]
      }
    }
  }
}
EOF
else
    cat > "$OUTPUT_FILE" << EOF
{
  "env": {
    "NVIDIA_API_KEY": "$api_key"
  },
  "models": {
    "providers": {
      "nvidia": {
        "baseUrl": "https://integrate.api.nvidia.com/v1",
        "api": "openai-completions",
        "models": []
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "$primary_model",
        "fallbacks": [
          "$FALLBACK1"
        ]
      }
    }
  }
}
EOF
fi

print_success "Configuration saved: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "  1. Review: cat $OUTPUT_FILE"
echo "  2. Restart: openclaw gateway restart"
echo "  3. Test: openclaw models status"

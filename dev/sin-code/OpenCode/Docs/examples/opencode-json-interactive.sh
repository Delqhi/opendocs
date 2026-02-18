#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CONFIG_DIR="$HOME/.config/opencode"
OUTPUT_FILE="$CONFIG_DIR/opencode.json"

print_header() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║  OpenCode Interactive Configuration Generator             ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}► $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

select_providers() {
    echo ""
    print_step "Step 1: Select AI Providers"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Available providers:"
    echo "  [1] OpenCode ZEN (FREE - Recommended for beginners)"
    echo "  [2] NVIDIA NIM (Premium - High performance)"
    echo "  [3] Google Antigravity (Premium - Multimodal)"
    echo "  [4] Streamlake (Enterprise)"
    echo "  [5] All of the above"
    echo ""
    
    read -p "Select providers (comma-separated, e.g., 1,2): " provider_choices
    
    PROVIDERS=()
    if [[ "$provider_choices" == *"1"* ]]; then
        PROVIDERS+=("opencode-zen")
        print_success "Added: OpenCode ZEN"
    fi
    if [[ "$provider_choices" == *"2"* ]]; then
        PROVIDERS+=("nvidia")
        print_success "Added: NVIDIA NIM"
    fi
    if [[ "$provider_choices" == *"3"* ]]; then
        PROVIDERS+=("google")
        print_success "Added: Google Antigravity"
    fi
    if [[ "$provider_choices" == *"4"* ]]; then
        PROVIDERS+=("streamlake")
        print_success "Added: Streamlake"
    fi
    if [[ "$provider_choices" == *"5"* ]]; then
        PROVIDERS=("opencode-zen" "nvidia" "google" "streamlake")
        print_success "Added: All providers"
    fi
    
    if [ ${#PROVIDERS[@]} -eq 0 ]; then
        print_warning "No providers selected. Defaulting to OpenCode ZEN (FREE)"
        PROVIDERS=("opencode-zen")
    fi
}

collect_api_keys() {
    echo ""
    print_step "Step 2: API Keys (if using premium providers)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # NVIDIA API Key
    if [[ " ${PROVIDERS[@]} " =~ " nvidia " ]]; then
        read -p "Enter NVIDIA API Key (or press Enter to skip): " NVIDIA_KEY
        if [ -n "$NVIDIA_KEY" ]; then
            echo "export NVIDIA_API_KEY=\"$NVIDIA_KEY\"" >> "$HOME/.zshrc"
            print_success "NVIDIA API key saved to ~/.zshrc"
            print_warning "Run 'source ~/.zshrc' to activate"
        else
            print_warning "NVIDIA provider added but no API key provided"
        fi
    fi
    
    # Google Antigravity
    if [[ " ${PROVIDERS[@]} " =~ " google " ]]; then
        print_warning "Google Antigravity requires OAuth authentication"
        read -p "Run OAuth setup now? (y/n): " run_oauth
        if [ "$run_oauth" == "y" ]; then
            print_step "Running: opencode auth login"
            opencode auth login || print_error "OAuth setup failed"
        fi
    fi
}

# Model Selection

select_models() {
    echo ""
    print_step "Step 3: Select Default Models"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # OpenCode ZEN models
    if [[ " ${PROVIDERS[@]} " =~ " opencode-zen " ]]; then
        echo "OpenCode ZEN Models:"
        echo "  [1] zen/big-pickle (Uncensored, 200K context)"
        echo "  [2] zen/uncensored (Uncensored, 200K context)"
        echo "  [3] zen/code (Code specialist, 200K context)"
        echo ""
        read -p "Select default ZEN model (1-3, default: 1): " zen_choice
        case $zen_choice in
            2) ZEN_MODEL="zen/uncensored" ;;
            3) ZEN_MODEL="zen/code" ;;
            *) ZEN_MODEL="zen/big-pickle" ;;
        esac
        print_success "Selected: $ZEN_MODEL"
    fi
    
    # NVIDIA models
    if [[ " ${PROVIDERS[@]} " =~ " nvidia " ]]; then
        echo ""
        echo "NVIDIA NIM Models:"
        echo "  [1] moonshotai/kimi-k2.5 (1M context, fast)"
        echo "  [2] qwen/qwen3.5-397b-a17b (Best code, 262K context)"
        echo "  [3] Both"
        echo ""
        read -p "Select NVIDIA model(s) (1-3, default: 3): " nvidia_choice
        case $nvidia_choice in
            1) NVIDIA_MODELS=("moonshotai/kimi-k2.5") ;;
            2) NVIDIA_MODELS=("qwen/qwen3.5-397b-a17b") ;;
            *) NVIDIA_MODELS=("moonshotai/kimi-k2.5" "qwen/qwen3.5-397b-a17b") ;;
        esac
        print_success "Selected: ${NVIDIA_MODELS[*]}"
    fi
}

# Generate Configuration

generate_config() {
    echo ""
    print_step "Step 4: Generating Configuration"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Create config directory if it doesn't exist
    mkdir -p "$CONFIG_DIR"
    
    # Start JSON
    cat > "$OUTPUT_FILE" << 'EOF'
{
  "$schema": "https://opencode.ai/schemas/config.json",
  "provider": {
EOF
    
    # Add OpenCode ZEN
    if [[ " ${PROVIDERS[@]} " =~ " opencode-zen " ]]; then
        cat >> "$OUTPUT_FILE" << EOF
    "opencode-zen": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "OpenCode ZEN (FREE)",
      "options": {
        "baseURL": "https://api.opencode.ai/v1"
      },
      "models": {
        "$ZEN_MODEL": {
          "name": "${ZEN_MODEL//\// }",
          "limit": {
            "context": 200000,
            "output": 128000
          }
        }
      }
    },
EOF
        print_success "Added OpenCode ZEN provider"
    fi
    
    # Add NVIDIA NIM
    if [[ " ${PROVIDERS[@]} " =~ " nvidia " ]]; then
        cat >> "$OUTPUT_FILE" << 'EOF'
    "nvidia": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "NVIDIA NIM",
      "options": {
        "baseURL": "https://integrate.api.nvidia.com/v1",
        "timeout": 120000
      },
      "models": {
EOF
        
        if [[ " ${NVIDIA_MODELS[@]} " =~ "moonshotai/kimi-k2.5" ]]; then
            cat >> "$OUTPUT_FILE" << 'EOF'
        "moonshotai/kimi-k2.5": {
          "name": "Kimi K2.5 (1M Context)",
          "limit": {
            "context": 1048576,
            "output": 65536
          }
        },
EOF
        fi
        
        if [[ " ${NVIDIA_MODELS[@]} " =~ "qwen/qwen3.5-397b-a17b" ]]; then
            cat >> "$OUTPUT_FILE" << 'EOF'
        "qwen/qwen3.5-397b-a17b": {
          "name": "Qwen 3.5 397B (Best Code)",
          "limit": {
            "context": 262144,
            "output": 32768
          }
        }
EOF
        fi
        
        # Remove trailing comma if needed
        if [[ " ${NVIDIA_MODELS[@]} " =~ "qwen/qwen3.5-397b-a17b" ]]; then
            cat >> "$OUTPUT_FILE" << 'EOF'
      }
    },
EOF
        else
            # Remove last comma
            sed -i '' '$ s/,$//' "$OUTPUT_FILE"
            cat >> "$OUTPUT_FILE" << 'EOF'
      }
    },
EOF
        fi
        
        print_success "Added NVIDIA NIM provider"
    fi
    
    # Add Google Antigravity
    if [[ " ${PROVIDERS[@]} " =~ " google " ]]; then
        cat >> "$OUTPUT_FILE" << 'EOF'
    "google": {
      "npm": "@ai-sdk/google",
      "models": {
        "antigravity-gemini-3-flash": {
          "id": "gemini-3-flash-preview",
          "name": "Gemini 3 Flash",
          "limit": {
            "context": 1048576,
            "output": 65536
          }
        },
        "antigravity-gemini-3-pro": {
          "id": "gemini-3-pro-preview",
          "name": "Gemini 3 Pro",
          "limit": {
            "context": 2097152,
            "output": 65536
          }
        }
      }
    },
EOF
        print_success "Added Google Antigravity provider"
    fi
    
    # Add Streamlake
    if [[ " ${PROVIDERS[@]} " =~ " streamlake " ]]; then
        cat >> "$OUTPUT_FILE" << 'EOF'
    "streamlake": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Streamlake",
      "options": {
        "baseURL": "https://vanchin.streamlake.ai/api/gateway/v1/endpoints/kat-coder-pro-v1/claude-code-proxy"
      },
      "models": {
        "kat-coder-pro-v1": {
          "name": "KAT Coder Pro v1",
          "limit": {
            "context": 2000000,
            "output": 128000
          }
        }
      }
    }
EOF
        print_success "Added Streamlake provider"
    fi
    
    # Close JSON
    cat >> "$OUTPUT_FILE" << 'EOF'
  }
}
EOF
    
    print_success "Configuration generated: $OUTPUT_FILE"
}

# Verification

verify_config() {
    echo ""
    print_step "Step 5: Verification"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Check if jq is available
    if command -v jq &> /dev/null; then
        if jq . "$OUTPUT_FILE" > /dev/null 2>&1; then
            print_success "JSON syntax is valid"
        else
            print_error "JSON syntax is invalid!"
            exit 1
        fi
    else
        print_warning "jq not installed, skipping syntax check"
    fi
    
    # Show configuration summary
    echo ""
    echo "Configuration Summary:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "File: $OUTPUT_FILE"
    echo "Providers: ${PROVIDERS[*]}"
    echo ""
    
    # List available models
    print_step "Testing configuration..."
    if command -v opencode &> /dev/null; then
        echo ""
        echo "Available models:"
        opencode models 2>/dev/null | head -20 || print_warning "Could not list models"
    else
        print_warning "OpenCode not installed. Run: npm install -g opencode"
    fi
}

# Main Execution

main() {
    print_header
    
    echo "This script will interactively generate your opencode.json"
    echo "Configuration file will be saved to: $OUTPUT_FILE"
    echo ""
    
    read -p "Continue? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Aborted."
        exit 0
    fi
    
    select_providers
    collect_api_keys
    select_models
    generate_config
    verify_config
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_success "Configuration complete!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Next steps:"
    echo "  1. Review: cat $OUTPUT_FILE"
    echo "  2. Test: opencode models"
    echo "  3. Start: opencode --agent explore"
    echo ""
    echo "Documentation:"
    echo "  - Video Tutorial: docs/tutorials/scripts/01-complete-setup.md"
    echo "  - Interactive Quiz: docs/quizzes/setup-quiz.md"
    echo ""
}

# Run main function
main "$@"

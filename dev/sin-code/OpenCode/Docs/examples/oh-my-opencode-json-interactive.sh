#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CONFIG_DIR="$HOME/.config/opencode"
OUTPUT_FILE="$CONFIG_DIR/oh-my-opencode.json"

print_header() {
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Agent Configuration Generator                            ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() { echo -e "${GREEN}► $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }

select_agents() {
    print_step "Select agents to configure:"
    echo "  [1] sisyphus (Main worker)"
    echo "  [2] prometheus (Planner)"
    echo "  [3] librarian (Researcher)"
    echo "  [4] explore (Explorer)"
    echo "  [5] oracle (Reviewer)"
    echo "  [6] All agents"
    echo ""
    read -p "Select agents (comma-separated, e.g., 1,2,3): " agent_choices
    
    AGENTS=()
    [[ "$agent_choices" == *"1"* ]] && AGENTS+=("sisyphus") && print_success "Added: sisyphus"
    [[ "$agent_choices" == *"2"* ]] && AGENTS+=("prometheus") && print_success "Added: prometheus"
    [[ "$agent_choices" == *"3"* ]] && AGENTS+=("librarian") && print_success "Added: librarian"
    [[ "$agent_choices" == *"4"* ]] && AGENTS+=("explore") && print_success "Added: explore"
    [[ "$agent_choices" == *"5"* ]] && AGENTS+=("oracle") && print_success "Added: oracle"
    [[ "$agent_choices" == *"6"* ]] && AGENTS=("sisyphus" "prometheus" "librarian" "explore" "oracle") && print_success "Added: All agents"
    
    [ ${#AGENTS[@]} -eq 0 ] && print_warning "No agents selected. Defaulting to all" && AGENTS=("sisyphus" "prometheus" "librarian" "explore" "oracle")
}

select_model() {
    echo ""
    print_step "Select default model for all agents:"
    echo "  [1] zen/big-pickle (FREE, uncensored)"
    echo "  [2] nvidia/kimi-k2.5 (Premium, 1M context)"
    echo "  [3] nvidia/qwen3.5-397b (Premium, best code)"
    echo "  [4] google/gemini-3-flash (Premium, multimodal)"
    echo ""
    read -p "Select model (1-4, default: 1): " model_choice
    
    case $model_choice in
        2) DEFAULT_MODEL="nvidia/moonshotai/kimi-k2.5" ;;
        3) DEFAULT_MODEL="nvidia/qwen/qwen3.5-397b-a17b" ;;
        4) DEFAULT_MODEL="google/antigravity-gemini-3-flash" ;;
        *) DEFAULT_MODEL="opencode-zen/zen/big-pickle" ;;
    esac
    
    print_success "Selected: $DEFAULT_MODEL"
}

generate_config() {
    echo ""
    print_step "Generating agent configuration..."
    
    mkdir -p "$CONFIG_DIR"
    
    cat > "$OUTPUT_FILE" << EOF
{
  "agent": {
EOF
    
    local count=0
    local total=${#AGENTS[@]}
    
    for agent in "${AGENTS[@]}"; do
        count=$((count + 1))
        local comma=","
        [ $count -eq $total ] && comma=""
        
        cat >> "$OUTPUT_FILE" << EOF
    "$agent": {
      "model": "$DEFAULT_MODEL",
      "description": "$agent agent"
    }$comma
EOF
    done
    
    cat >> "$OUTPUT_FILE" << EOF
  }
}
EOF
    
    print_success "Configuration saved: $OUTPUT_FILE"
}

verify_config() {
    echo ""
    print_step "Verifying configuration..."
    
    if command -v jq &> /dev/null; then
        if jq . "$OUTPUT_FILE" > /dev/null 2>&1; then
            print_success "JSON syntax valid"
        else
            print_error "Invalid JSON!"
            exit 1
        fi
    fi
    
    echo ""
    echo "Configuration Summary:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Agents: ${AGENTS[*]}"
    echo "Model: $DEFAULT_MODEL"
    echo "File: $OUTPUT_FILE"
}

main() {
    print_header
    echo "This script generates oh-my-opencode.json"
    echo "Output: $OUTPUT_FILE"
    echo ""
    
    read -p "Continue? (y/n): " confirm
    [ "$confirm" != "y" ] && echo "Aborted." && exit 0
    
    select_agents
    select_model
    generate_config
    verify_config
    
    echo ""
    print_success "Agent configuration complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Review: cat $OUTPUT_FILE"
    echo "  2. Test: opencode --agent ${AGENTS[0]} \"Hello\""
    echo ""
}

main "$@"

#!/bin/bash

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  OpenCode Agent Interactive Tester                        ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() { echo -e "${GREEN}► $1${NC}"; }

print_header

echo "Available agents:"
echo "  [1] sisyphus (Main worker)"
echo "  [2] prometheus (Planner)"
echo "  [3] librarian (Researcher)"
echo "  [4] explore (Explorer)"
echo "  [5] oracle (Reviewer)"
echo "  [6] atlas (Heavy lifting)"
echo ""
read -p "Select agent (1-6, default: 4): " agent_choice

case $agent_choice in
    1) AGENT="sisyphus" ;;
    2) AGENT="prometheus" ;;
    3) AGENT="librarian" ;;
    4) AGENT="explore" ;;
    5) AGENT="oracle" ;;
    6) AGENT="atlas" ;;
    *) AGENT="explore" ;;
esac

print_step "Selected agent: $AGENT"
echo ""

echo "Test prompts:"
echo "  [1] Simple greeting"
echo "  [2] Code generation"
echo "  [3] Research task"
echo "  [4] Code review"
echo "  [5] Custom prompt"
echo ""
read -p "Select test (1-5, default: 1): " test_choice

case $test_choice in
    1) PROMPT="Hello! Introduce yourself and your capabilities." ;;
    2) PROMPT="Create a TypeScript function that validates email addresses." ;;
    3) PROMPT="Research best practices for error handling in Node.js 2026." ;;
    4) PROMPT="Review this code for issues: function test() { return null; }" ;;
    5) read -p "Enter your prompt: " custom_prompt
       PROMPT="$custom_prompt" ;;
    *) PROMPT="Hello!" ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Agent: $AGENT"
echo "Prompt: $PROMPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Response:"
echo ""

if command -v opencode &> /dev/null; then
    echo "$PROMPT" | opencode --agent "$AGENT"
else
    echo "OpenCode not installed. Install with: npm install -g opencode"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test complete!"

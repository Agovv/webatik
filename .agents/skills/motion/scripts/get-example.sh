#!/bin/bash
# Motion Example Fetcher
# Usage: ./get-example.sh <example-id> [platform]
# 
# Fetches example source code from motion.dev
#
# Examples:
#   ./get-example.sh accordion          # Auto-detect platform
#   ./get-example.sh accordion js       # JavaScript version
#   ./get-example.sh tabs react         # React version
#   ./get-example.sh carousel vue       # Vue version

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLES_JSON="$SCRIPT_DIR/../reference/examples.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 <example-id> [platform]"
    echo ""
    echo "Arguments:"
    echo "  example-id    ID of the example (e.g., accordion, tabs, carousel)"
    echo "  platform      Optional: js, react, or vue (auto-detects if omitted)"
    echo ""
    echo "Examples:"
    echo "  $0 accordion"
    echo "  $0 tabs react"
    echo "  $0 carousel vue"
    exit 1
}

if [ -z "$1" ]; then
    usage
fi

EXAMPLE_ID="$1"
PLATFORM="${2:-}"

# Check if examples.json exists
if [ ! -f "$EXAMPLES_JSON" ]; then
    echo -e "${RED}Error: examples.json not found at $EXAMPLES_JSON${NC}"
    exit 1
fi

# Find the example in the JSON
find_example() {
    local id="$1"
    local plat="$2"
    
    if [ -n "$plat" ]; then
        # Search specific platform
        jq -r --arg id "$id" --arg plat "$plat" '.[$plat][] | select(.id == $id) | "\($id)|\($plat)"' "$EXAMPLES_JSON" 2>/dev/null
    else
        # Search all platforms, return first match
        for p in js react vue; do
            local result=$(jq -r --arg id "$id" --arg plat "$p" '.[$plat][] | select(.id == $id) | "\($id)|\($plat)"' "$EXAMPLES_JSON" 2>/dev/null)
            if [ -n "$result" ]; then
                echo "$result"
                return
            fi
        done
    fi
}

RESULT=$(find_example "$EXAMPLE_ID" "$PLATFORM")

if [ -z "$RESULT" ]; then
    echo -e "${RED}Error: Example '$EXAMPLE_ID' not found${NC}"
    if [ -n "$PLATFORM" ]; then
        echo -e "${YELLOW}Tip: Try without platform to auto-detect${NC}"
    fi
    echo ""
    echo "Search similar examples:"
    jq -r '.js[], .react[], .vue[] | .id' "$EXAMPLES_JSON" 2>/dev/null | grep -i "$EXAMPLE_ID" | head -5 || echo "No similar examples found"
    exit 1
fi

FOUND_ID=$(echo "$RESULT" | cut -d'|' -f1)
FOUND_PLATFORM=$(echo "$RESULT" | cut -d'|' -f2)

# Get example metadata
TITLE=$(jq -r --arg id "$FOUND_ID" --arg plat "$FOUND_PLATFORM" '.[$plat][] | select(.id == $id) | .title' "$EXAMPLES_JSON")
DESCRIPTION=$(jq -r --arg id "$FOUND_ID" --arg plat "$FOUND_PLATFORM" '.[$plat][] | select(.id == $id) | .description' "$EXAMPLES_JSON")
APIS=$(jq -r --arg id "$FOUND_ID" --arg plat "$FOUND_PLATFORM" '.[$plat][] | select(.id == $id) | .apis | join(", ")' "$EXAMPLES_JSON")
CATEGORY=$(jq -r --arg id "$FOUND_ID" --arg plat "$FOUND_PLATFORM" '.[$plat][] | select(.id == $id) | .category' "$EXAMPLES_JSON")

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}$TITLE${NC} (${FOUND_PLATFORM})"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Category:${NC} $CATEGORY"
echo -e "${YELLOW}APIs:${NC} $APIS"
echo -e "${YELLOW}Description:${NC}"
echo "$DESCRIPTION" | fold -s -w 70
echo ""

# Construct URL based on platform
case "$FOUND_PLATFORM" in
    js)
        URL="https://motion.dev/docs/examples/${FOUND_ID}"
        ;;
    react)
        URL="https://motion.dev/docs/react-examples/${FOUND_ID}"
        ;;
    vue)
        URL="https://motion.dev/docs/vue-examples/${FOUND_ID}"
        ;;
esac

echo -e "${YELLOW}Source:${NC} $URL"
echo ""

# Fetch the page
echo -e "${BLUE}Fetching example code...${NC}"
echo ""

# Use curl to fetch the page and extract code
RESPONSE=$(curl -s "$URL" 2>/dev/null)

if [ -z "$RESPONSE" ]; then
    echo -e "${RED}Error: Failed to fetch page${NC}"
    echo -e "${YELLOW}Please visit: $URL${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Example found at: $URL${NC}"
echo ""
echo -e "${YELLOW}To view the full source code:${NC}"
echo "  1. Visit $URL"
echo "  2. Click 'View code' or scroll to see the example"
echo ""
echo -e "${YELLOW}Quick copy:${NC}"
echo "  open \"$URL\""

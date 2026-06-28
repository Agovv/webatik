#!/bin/bash

# Motion Examples Search Script
# Usage: ./search-examples.sh <keyword>

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLES_FILE="$SCRIPT_DIR/../references/mcp-examples.mjs"

if [ -z "$1" ]; then
    echo "Usage: $0 <keyword>"
    echo "Example: $0 drag"
    echo "         $0 scroll"
    echo "         $0 modal"
    exit 1
fi

KEYWORD="$1"

if [ ! -f "$EXAMPLES_FILE" ]; then
    echo "Examples file not found. Searching in reference/examples.md instead..."
    EXAMPLES_MD="$SCRIPT_DIR/../reference/examples.md"
    if [ -f "$EXAMPLES_MD" ]; then
        grep -i "$KEYWORD" "$EXAMPLES_MD"
    else
        echo "No examples file found."
    fi
    exit 0
fi

echo "Searching for examples matching: $KEYWORD"
echo "============================================"

# Search for examples containing the keyword in title, description, or APIs
grep -B2 -A5 -i "\"$KEYWORD" "$EXAMPLES_FILE" | \
    grep -E "(\"id\"|\"title\"|\"description\"|\"apis\")" | \
    head -50

echo ""
echo "============================================"
echo "For full code, visit: https://motion.dev/examples?search=$KEYWORD"

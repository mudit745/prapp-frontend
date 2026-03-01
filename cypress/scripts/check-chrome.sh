#!/bin/bash
# Script to check if Chrome is available and provide installation instructions

echo "Checking for Chrome browser..."

# Check for Chrome/Chromium
if command -v google-chrome &> /dev/null; then
    echo "✓ Google Chrome found: $(which google-chrome)"
    exit 0
elif command -v chromium-browser &> /dev/null; then
    echo "✓ Chromium found: $(which chromium-browser)"
    exit 0
elif command -v chromium &> /dev/null; then
    echo "✓ Chromium found: $(which chromium)"
    exit 0
else
    echo "✗ Chrome/Chromium not found"
    echo ""
    echo "To install Chrome for Cypress testing:"
    echo ""
    echo "Ubuntu/Debian (WSL):"
    echo "  wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb"
    echo "  sudo apt install ./google-chrome-stable_current_amd64.deb"
    echo ""
    echo "Or install Chromium:"
    echo "  sudo apt update && sudo apt install chromium-browser"
    echo ""
    echo "After installation, verify with:"
    echo "  npx cypress info"
    echo ""
    exit 1
fi


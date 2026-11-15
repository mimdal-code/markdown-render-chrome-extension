#!/usr/bin/env bash
set -e

# Base URLs
# We use jsDelivr for the SVGs since raw.githubusercontent.com is often blocked
PIECES_BASE="https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece"
CHESS_JS_URL="https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/cjs/chess.js"
CHESS_JS_LICENSE="https://cdn.jsdelivr.net/npm/chess.js@1.4.0/LICENSE"

PIECES="wK wQ wR wB wN wP bK bQ bR bB bN bP"

echo "📦 Creating vendor directories..."
mkdir -p vendor/chess.js/1.4.0
mkdir -p vendor/cburnett/1.0.0/pieces
mkdir -p vendor/merida/1.0.0/pieces
mkdir -p vendor/maestro/1.0.0/pieces

echo "♟️  Downloading chess.js..."
curl -sSL "$CHESS_JS_URL" -o vendor/chess.js/1.4.0/chess.js
curl -sSL "$CHESS_JS_LICENSE" -o vendor/chess.js/1.4.0/LICENSE

echo "♜  Downloading Cburnett pieces..."
for p in $PIECES; do
  curl -sSL "$PIECES_BASE/cburnett/$p.svg" -o "vendor/cburnett/1.0.0/pieces/$p.svg"
done
# Fetching the Cburnett license via jsDelivr
curl -sSL "https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece/cburnett/LICENSE" -o vendor/cburnett/1.0.0/LICENSE

echo "♞  Downloading Merida pieces..."
for p in $PIECES; do
  curl -sSL "$PIECES_BASE/merida/$p.svg" -o "vendor/merida/1.0.0/pieces/$p.svg"
done

echo "♝  Downloading Maestro pieces..."
for p in $PIECES; do
  curl -sSL "$PIECES_BASE/maestro/$p.svg" -o "vendor/maestro/1.0.0/pieces/$p.svg"
done

echo "✅ All vendors downloaded successfully!"
echo "Verify with: ls -R vendor/"
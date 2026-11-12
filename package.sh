#!/usr/bin/env bash
# Build release archives for the extension.
# Produces md-rtl-reader-<version>.zip  (required for Chrome Web Store)
#      and md-rtl-reader-<version>.rar  (optional, for local sharing)
set -euo pipefail

NAME="md-rtl-reader"
VER="$(grep -o '"version"[^,]*' manifest.json | head -1 | sed 's/.*: *"//;s/"//')"
ZIP_OUT="${NAME}-${VER}.zip"
RAR_OUT="${NAME}-${VER}.rar"

# Files that go into the archive. Exactly what Chrome loads.
FILES=(
  manifest.json
  src
  assets
)

# Exclude junk if any sneaks in
EXCLUDES=(
  "*.DS_Store"
  "*/.git/*"
  "*/node_modules/*"
)

echo "▶ Building release archives for ${NAME} ${VER}"

# ---------- ZIP (required) ----------
if command -v zip >/dev/null 2>&1; then
  rm -f "$ZIP_OUT"
  zip -r "$ZIP_OUT" "${FILES[@]}" \
    -x "${EXCLUDES[@]}" >/dev/null
  echo "✓ $ZIP_OUT  ($(du -h "$ZIP_OUT" | cut -f1))"
else
  echo "✗ 'zip' not found — install it (apt install zip / brew install zip)"
fi

# ---------- RAR (optional) ----------
# Try several common locations for Rar.exe / rar
RAR_BIN=""
for candidate in \
  "rar" \
  "Rar" \
  "Rar.exe" \
  "/c/Program Files/WinRAR/Rar.exe" \
  "/c/Program Files (x86)/WinRAR/Rar.exe" \
  "/mnt/c/Program Files/WinRAR/Rar.exe" \
  "/mnt/c/Program Files (x86)/WinRAR/Rar.exe"
do
  if command -v "$candidate" >/dev/null 2>&1; then
    RAR_BIN="$candidate"
    break
  fi
  if [ -x "$candidate" ]; then
    RAR_BIN="$candidate"
    break
  fi
done

if [ -n "$RAR_BIN" ]; then
  rm -f "$RAR_OUT"
  # -r recurse, -ep1 exclude base path, -x exclude patterns
  "$RAR_BIN" a -r -ep1 -idq \
    -x'*.DS_Store' -x'.git' -x'node_modules' \
    "$RAR_OUT" "${FILES[@]}" >/dev/null
  echo "✓ $RAR_OUT  ($(du -h "$RAR_OUT" | cut -f1))"
else
  echo "· Skipped .rar (Rar.exe not found — that's fine, .zip is what the Store needs)"
fi

echo "▶ Done."
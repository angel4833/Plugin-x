#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "Bundling QuickJS plugin files for Hedon Haven..."
: > bundle.js

# Concatenate files in exact order required by Hedon Haven contract
for file in src/bridge_functions.js src/universal_formats.js src/session.js src/main.js src/wrapper.js; do
  if [ -f "$file" ]; then
    printf '// ==== START: %s ====\n' "$file" >> bundle.js
    cat "$file" >> bundle.js
    printf '\n// ==== END: %s ====\n\n' "$file" >> bundle.js
  fi
done

rm -f plugin.zip

# Normalize timestamps for deterministic build
touch -t 202601010000 plugin.yaml bundle.js update.yaml
find src -type f -exec touch -t 202601010000 {} +

# Package into zip with plugin.yaml and bundle.js at root level
if command -v zip >/dev/null 2>&1; then
  zip -X -q -r plugin.zip plugin.yaml bundle.js update.yaml src/
else
  python3 -m zipfile -c plugin.zip plugin.yaml bundle.js update.yaml src/
fi

echo "Build complete: plugin.zip created successfully!"
sha256sum plugin.zip

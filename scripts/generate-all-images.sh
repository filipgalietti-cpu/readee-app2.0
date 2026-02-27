#!/bin/bash
# Loops generate-images.js until all images are done.
# Each run generates up to 95 images, then pauses 60s before next run.
# Safe to Ctrl+C — progress is saved in image-progress.json.

cd "$(dirname "$0")/.."

TOTAL=715
RUN=1

while true; do
  echo ""
  echo "=========================================="
  echo "  Run #$RUN — $(date)"
  echo "=========================================="

  node scripts/generate-images.js --csv=missing-images-manifest.csv

  # Count how many images exist
  DONE=$(find public/images -name "*.png" -path "*/RL.*/*" -o -name "*.png" -path "*/RI.*/*" -o -name "*.png" -path "*/RF.*/*" -o -name "*.png" -path "*/L.*/*" -o -name "*.png" -path "*/4-L*/*" | wc -l | tr -d ' ')

  echo ""
  echo "Progress: ~$DONE new images generated so far"

  # Check if all done by seeing if the script generated 0 this run
  if grep -q "Done: 0 images generated this run" <<< "$(tail -2 /dev/stdin 2>/dev/null)"; then
    echo "All images generated!"
    break
  fi

  # Simple check: if all folders have images, we're done
  REMAINING=$(node -e "
    const fs = require('fs');
    const path = require('path');
    const csv = fs.readFileSync('scripts/missing-images-manifest.csv','utf-8');
    const lines = csv.split('\n').slice(1).filter(l=>l.trim());
    let missing = 0;
    for (const line of lines) {
      const m = line.match(/^([^,]+),([^,]+)/);
      if (m && !fs.existsSync(path.join('public/images', m[1], m[2]))) missing++;
    }
    console.log(missing);
  ")

  echo "Remaining: $REMAINING / $TOTAL"

  if [ "$REMAINING" -eq 0 ]; then
    echo ""
    echo "All $TOTAL images generated! Starting Supabase upload..."
    node scripts/upload-images-to-supabase.js
    echo "Done!"
    break
  fi

  RUN=$((RUN + 1))
  echo "Pausing 60s before next run..."
  sleep 60
done

#!/bin/sh
# Script to copy built frontend files to volume
echo "Waiting for build to complete..."
sleep 2
echo "Copying frontend build files from /app/dist to /dist..."
mkdir -p /dist
cp -r /app/dist/* /dist/ 2>/dev/null || cp -r /app/dist/. /dist/ 2>/dev/null || true
echo "Frontend files copied successfully. Listing /dist:"
ls -la /dist/ | head -20
echo "Container ready. Files available in volume."
# Keep container running
tail -f /dev/null


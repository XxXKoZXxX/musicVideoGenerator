#!/usr/bin/env bash
# scripts/deploy-vercel.sh — Build and deploy Astraea AI Video Studio to Vercel

set -e

echo "▲ Astraea AI Video Studio — Vercel Deploy Script"

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI not found globally. Using npx vercel..."
  VERCEL_CMD="npx -y vercel"
else
  VERCEL_CMD="vercel"
fi

echo "Building production web assets..."
npm run react-build

echo "Deploying to Vercel Production..."
$VERCEL_CMD --prod

echo "✅ Vercel deployment completed successfully!"

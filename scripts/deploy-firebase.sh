#!/usr/bin/env bash
# scripts/deploy-firebase.sh — Deploy Firestore security rules & optional hosting

set -e

echo "🔥 Astraea AI Video Studio — Firebase Deploy Script"

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
  echo "Firebase CLI not found globally. Using npx firebase-tools..."
  FIREBASE_CMD="npx -y firebase-tools"
else
  FIREBASE_CMD="firebase"
fi

echo "Deploying Firestore security rules..."
$FIREBASE_CMD deploy --only firestore:rules

echo "✅ Firebase deployment completed successfully!"

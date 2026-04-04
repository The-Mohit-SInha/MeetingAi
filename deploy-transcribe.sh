#!/bin/bash

# Supabase Edge Function Deployment Script
# Run this script from your local machine (not in the sandbox)

set -e  # Exit on error

echo "🚀 Deploying Supabase Edge Function for Groq Transcription"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI is installed"
echo ""

# Check if logged in
echo "🔐 Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "📝 Please login to Supabase (browser will open)..."
    supabase login
else
    echo "✅ Already logged in to Supabase"
fi
echo ""

# Link to project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref qjrmxudyrwcqwpkmrggn --yes
echo "✅ Linked to project"
echo ""

# Set the secret
echo "🔑 Setting GROQ_API_KEY secret..."
supabase secrets set GROQ_API_KEY=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 --yes
echo "✅ Secret set"
echo ""

# Deploy the function
echo "🚀 Deploying transcribe function..."
supabase functions deploy transcribe --no-verify-jwt
echo "✅ Function deployed"
echo ""

# Test the deployment
echo "🧪 Testing deployment..."
HEALTH_RESPONSE=$(curl -s https://qjrmxudyrwcqwpkmrggn.supabase.co/functions/v1/transcribe/health)
echo "Health check response: $HEALTH_RESPONSE"
echo ""

if echo "$HEALTH_RESPONSE" | grep -q '"configured":true'; then
    echo "✅ SUCCESS! Groq transcription is configured and ready!"
    echo ""
    echo "🎉 Your app can now use high-quality Groq Whisper transcription!"
    echo ""
    echo "Next steps:"
    echo "1. Refresh your app in the browser"
    echo "2. Click the test button in the bottom-right"
    echo "3. Try recording audio from a browser tab"
else
    echo "⚠️ WARNING: Health check shows Groq is not configured"
    echo "Please check:"
    echo "1. The GROQ_API_KEY secret was set correctly"
    echo "2. The function was deployed successfully"
    echo "3. Check Supabase Dashboard → Edge Functions → Logs"
fi

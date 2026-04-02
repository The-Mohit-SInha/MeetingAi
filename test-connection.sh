#!/bin/bash
# Test Supabase Connection

source .env.local 2>/dev/null || { echo "❌ .env.local not found"; exit 1; }

echo "🔍 Testing Supabase Connection..."
echo ""
echo "URL: $VITE_SUPABASE_URL"
echo "Key: ${VITE_SUPABASE_ANON_KEY:0:20}..."
echo ""

# Test connection
response=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  "$VITE_SUPABASE_URL/rest/v1/")

if [ "$response" = "200" ]; then
    echo "✅ Connection successful! Supabase is reachable."
    echo ""
    echo "Your backend is ready. Now run:"
    echo "  pnpm vite"
    echo ""
elif [ "$response" = "401" ]; then
    echo "⚠️  Connection reached server but authentication failed."
    echo "Check your VITE_SUPABASE_ANON_KEY in .env.local"
elif [ "$response" = "404" ]; then
    echo "❌ Server not found. Check your VITE_SUPABASE_URL in .env.local"
else
    echo "❌ Connection failed (HTTP $response)"
    echo "Please check:"
    echo "  1. Your internet connection"
    echo "  2. Supabase project is running"
    echo "  3. Credentials in .env.local are correct"
fi

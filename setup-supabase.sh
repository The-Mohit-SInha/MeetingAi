#!/bin/bash
# Supabase Setup Script for AI Meeting-to-Action System

set -e

echo "🚀 Starting Supabase Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists and has real credentials
if [ -f .env.local ]; then
    source .env.local
    if [[ "$VITE_SUPABASE_URL" == *"your-project"* ]] || [[ "$VITE_SUPABASE_ANON_KEY" == *"your-anon-key"* ]]; then
        echo -e "${YELLOW}⚠️  Warning: .env.local contains placeholder values${NC}"
        echo ""
        echo "Please update .env.local with your actual Supabase credentials:"
        echo "  1. Go to https://supabase.com"
        echo "  2. Create a new project (takes ~2 minutes)"
        echo "  3. Go to Settings → API"
        echo "  4. Copy your Project URL and anon key"
        echo "  5. Update .env.local with those values"
        echo ""
        echo -e "${BLUE}After updating .env.local, run this script again.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Found .env.local with credentials${NC}"
else
    echo -e "${RED}❌ .env.local not found${NC}"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null && ! [ -f /tmp/supabase ]; then
    echo -e "${YELLOW}⚙️  Installing Supabase CLI...${NC}"
    curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o /tmp/supabase.tar.gz
    tar -xzf /tmp/supabase.tar.gz -C /tmp
    chmod +x /tmp/supabase
    SUPABASE_CMD="/tmp/supabase"
    echo -e "${GREEN}✅ Supabase CLI installed${NC}"
else
    if [ -f /tmp/supabase ]; then
        SUPABASE_CMD="/tmp/supabase"
    else
        SUPABASE_CMD="supabase"
    fi
    echo -e "${GREEN}✅ Supabase CLI found${NC}"
fi

# Initialize Supabase if not already done
if [ ! -f supabase/config.toml ]; then
    echo -e "${BLUE}⚙️  Initializing Supabase...${NC}"
    $SUPABASE_CMD init
    echo -e "${GREEN}✅ Supabase initialized${NC}"
else
    echo -e "${GREEN}✅ Supabase already initialized${NC}"
fi

# Create migrations directory if it doesn't exist
mkdir -p supabase/migrations

# Copy schema to migrations if not already there
if [ ! -f supabase/migrations/20260402000000_initial_schema.sql ]; then
    echo -e "${BLUE}⚙️  Creating migration from schema...${NC}"
    cp database/schema.sql supabase/migrations/20260402000000_initial_schema.sql
    echo -e "${GREEN}✅ Migration created${NC}"
else
    echo -e "${GREEN}✅ Migration already exists${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Supabase setup is READY!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo ""
echo "1️⃣  Deploy the database schema to your Supabase project:"
echo ""
echo "   ${BLUE}Option A: Manual (Copy-Paste)${NC}"
echo "   - Open https://supabase.com/dashboard"
echo "   - Go to SQL Editor → New query"
echo "   - Copy contents of: database/schema.sql"
echo "   - Paste and click 'Run'"
echo ""
echo "   ${BLUE}Option B: Automated (Requires Supabase access token)${NC}"
echo "   - Get token: https://supabase.com/dashboard/account/tokens"
echo "   - Run: $SUPABASE_CMD link --project-ref YOUR_PROJECT_ID"
echo "   - Run: $SUPABASE_CMD db push"
echo ""
echo "2️⃣  Configure Auth Settings (IMPORTANT):"
echo "   - Go to Authentication → Providers → Email"
echo "   - Turn OFF 'Confirm email' (for development)"
echo "   - Click Save"
echo ""
echo "3️⃣  Start the dev server:"
echo "   ${BLUE}pnpm vite${NC}"
echo ""
echo "4️⃣  Open http://localhost:5173 and sign up!"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📚 For detailed guide, see: SUPABASE_QUICKSTART.md"
echo ""

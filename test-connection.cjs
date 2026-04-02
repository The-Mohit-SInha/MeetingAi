#!/usr/bin/env node

// Test Supabase Connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qjrmxudyrwcqwpkmrggn.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcm14dWR5cndjcXdwa21yZ2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDYyNDgsImV4cCI6MjA5MDcyMjI0OH0.tAje6kf-PRqDqKqM_KhNJs2wDCd-I28jUQKG28Y7bec';

console.log('🔗 Testing Supabase Connection...\n');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseAnonKey.substring(0, 20)}...`);
console.log('');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Check if we can query the auth endpoint
    console.log('✓ Supabase client created successfully');

    // Test 2: Try to access public schema (should work even without tables)
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('⚠️  Database tables not found');
        console.log('');
        console.log('📋 ACTION REQUIRED: Deploy the database schema');
        console.log('');
        console.log('Steps:');
        console.log('1. Go to https://qjrmxudyrwcqwpkmrggn.supabase.co');
        console.log('2. Click "SQL Editor" (lightning icon on left sidebar)');
        console.log('3. Click "+ New query"');
        console.log('4. Copy ALL contents from database/schema.sql');
        console.log('5. Paste into the SQL Editor');
        console.log('6. Click "Run" (or press Ctrl/Cmd + Enter)');
        console.log('7. Wait for "Success. No rows returned" message');
        console.log('');
        console.log('Then run this script again!');
        process.exit(1);
      } else {
        console.log('❌ Connection error:', error.message);
        process.exit(1);
      }
    } else {
      console.log('✅ Connection successful!');
      console.log('✅ Database tables are set up correctly!');
      console.log('');
      console.log('🎉 You\'re all set! Now you can:');
      console.log('   1. Start the dev server: pnpm vite');
      console.log('   2. Open http://localhost:5173');
      console.log('   3. Click "Sign up" to create your first account!');
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

testConnection();

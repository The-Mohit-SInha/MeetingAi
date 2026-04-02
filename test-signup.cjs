#!/usr/bin/env node

// Test Sign Up Functionality
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qjrmxudyrwcqwpkmrggn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcm14dWR5cndjcXdwa21yZ2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDYyNDgsImV4cCI6MjA5MDcyMjI0OH0.tAje6kf-PRqDqKqM_KhNJs2wDCd-I28jUQKG28Y7bec';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignUp() {
  console.log('🧪 Testing Sign Up Process...\n');

  const testEmail = `test${Date.now()}@test.com`;
  const testPassword = 'TestPassword123!';

  console.log(`Testing with: ${testEmail}`);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User',
        }
      }
    });

    if (error) {
      console.log('❌ Sign up failed:', error.message);

      if (error.message.includes('Email confirmations are required')) {
        console.log('\n⚠️  Email confirmations are still enabled!');
        console.log('\n📋 ACTION REQUIRED: Disable email confirmations');
        console.log('\nSteps:');
        console.log('1. Go to https://qjrmxudyrwcqwpkmrggn.supabase.co');
        console.log('2. Click "Authentication" in left sidebar');
        console.log('3. Click "Providers" tab');
        console.log('4. Click on "Email" provider');
        console.log('5. Toggle OFF "Confirm email"');
        console.log('6. Click "Save"');
        console.log('\nThen try signing up again!');
      }

      process.exit(1);
    }

    if (data.user) {
      console.log('✅ Sign up successful!');
      console.log(`✅ User ID: ${data.user.id}`);
      console.log(`✅ Email: ${data.user.email}`);

      if (data.session) {
        console.log('✅ Session created automatically (email confirmation disabled)');
        console.log('\n🎉 Perfect! Sign up is working correctly!');
      } else {
        console.log('⚠️  No session created - email confirmation may be required');
        console.log('\nPlease check your Auth settings in Supabase dashboard');
      }

      console.log('\n✨ You can now sign up in the app!');
      console.log('   1. Open http://localhost:5173');
      console.log('   2. Click "Sign up"');
      console.log('   3. Enter your email and password');
      console.log('   4. Start using the app!');
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

testSignUp();

#!/usr/bin/env node

/**
 * Supabase Connection Validator
 * 
 * This script validates that Supabase is properly configured and accessible.
 * Run this script before starting development to catch configuration issues early.
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function validateSupabaseConnection() {
  log('\n==========================================', colors.bright);
  log('  Supabase Connection Validator', colors.bright);
  log('==========================================\n', colors.bright);

  let hasErrors = false;

  // Check 1: .env.local exists
  info('Checking .env.local file...');
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    error('.env.local file not found');
    warning('Create .env.local file by running: npm run setup:supabase');
    hasErrors = true;
  } else {
    success('.env.local file exists');

    // Check 2: Read and parse .env.local
    info('Validating environment variables...');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: null,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: null,
      SUPABASE_SERVICE_ROLE_KEY: null,
    };

    // Parse environment variables
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key && envVars.hasOwnProperty(key.trim())) {
          envVars[key.trim()] = value;
        }
      }
    });

    // Validate each required variable
    Object.entries(envVars).forEach(([key, value]) => {
      if (!value || value.includes('your-') || value.includes('-here')) {
        error(`${key} is not configured`);
        hasErrors = true;
      } else {
        success(`${key} is configured`);
      }
    });

    // Check URL format
    if (envVars.NEXT_PUBLIC_SUPABASE_URL) {
      const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        error('NEXT_PUBLIC_SUPABASE_URL must start with http:// or https://');
        hasErrors = true;
      } else if (url.startsWith('http://127.0.0.1:54321')) {
        info('Using local Supabase instance');
      } else if (url.includes('supabase.co')) {
        info('Using remote Supabase instance');
      }
    }

    // Check key formats
    if (envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY && !envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ')) {
      warning('NEXT_PUBLIC_SUPABASE_ANON_KEY does not look like a valid JWT token');
    }
    if (envVars.SUPABASE_SERVICE_ROLE_KEY && !envVars.SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')) {
      warning('SUPABASE_SERVICE_ROLE_KEY does not look like a valid JWT token');
    }
  }

  // Check 3: Test connection (requires .env.local to be loaded)
  info('Testing connection to Supabase...');
  
  // We can't actually test the connection without loading the env vars and the Supabase client
  // This would require more setup. For now, just inform the user to test via the app.
  info('To test the actual connection, start the app and visit:');
  info('  http://localhost:3000/test-connection');

  // Summary
  log('\n==========================================', colors.bright);
  if (hasErrors) {
    error('Validation failed - please fix the errors above');
    log('\n📚 Documentation:', colors.bright);
    log('  - SUPABASE_CONNECTION_GUIDE.md - Setup instructions');
    log('  - Run: npm run setup:supabase - Automated setup\n');
    process.exit(1);
  } else {
    success('All checks passed!');
    log('\n📍 Next steps:', colors.bright);
    log('  1. Start the dev server: npm run dev');
    log('  2. Visit: http://localhost:3000/test-connection');
    log('  3. Create an account: http://localhost:3000/signup\n');
  }
}

// Run validation
validateSupabaseConnection().catch(err => {
  error(`Validation error: ${err.message}`);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Cross-platform Supabase Setup Script
 * 
 * This script automatically detects the OS and runs the appropriate setup script.
 */

const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const platform = os.platform();
let scriptName;

if (platform === 'win32') {
  scriptName = 'setup-supabase.bat';
} else {
  scriptName = 'setup-supabase.sh';
}

const scriptPath = path.join(__dirname, scriptName);

// Check if script exists
if (!fs.existsSync(scriptPath)) {
  console.error(`Error: Setup script not found: ${scriptPath}`);
  process.exit(1);
}

console.log(`Detected platform: ${platform}`);
console.log(`Running: ${scriptName}\n`);

try {
  if (platform === 'win32') {
    execSync(`"${scriptPath}"`, { stdio: 'inherit', shell: true });
  } else {
    execSync(`bash "${scriptPath}"`, { stdio: 'inherit' });
  }
} catch (error) {
  console.error('\nSetup script failed.');
  process.exit(1);
}

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run commands
function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    process.exit(1);
  }
}

// Function to check if .env file exists
function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found!');
    console.log('Please create a .env file with your YouTube API key.');
    process.exit(1);
  }
}

// Main setup function
async function setup() {
  console.log('🚀 Setting up Mentora...');

  // Check for .env file
  checkEnvFile();

  // Install dependencies
  console.log('📦 Installing dependencies...');
  runCommand('npm install');

  // Install Expo CLI globally if not already installed
  console.log('🔧 Installing Expo CLI...');
  runCommand('npm install -g expo-cli');

  // Clear Metro bundler cache
  console.log('🧹 Clearing Metro bundler cache...');
  runCommand('expo start --clear');

  console.log('✅ Setup complete!');
  console.log('To start the app, run: npm start');
}

setup(); 
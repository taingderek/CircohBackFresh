/**
 * Environment Setup Script for CircohBack
 * 
 * This script sets up environment files and validates that all required
 * environment variables are present. It can also be used to switch between environments.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Define environment contents
const ENV_DEVELOPMENT = `# CircohBack Development Environment

# App Environment
APP_ENV=development
VERSION=1.0.0
BUILD_NUMBER=1

# API Configuration
API_URL=http://192.168.0.94:8080
API_TIMEOUT=15000

# Supabase Configuration
SUPABASE_URL=https://zrfjkrinmhxuxhwapqch.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZmprcmlubWh4dXhod2FwcWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzcyNzUsImV4cCI6MjA1OTAxMzI3NX0.SVpH17OfNp9Vq0S75YmKEBqlYto7DY7X4emhJxSQGp0
SUPABASE_JWT_SECRET=your-development-jwt-secret

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here

# Feature Flags
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false
ENABLE_REMOTE_LOGGING=false

# EAS Configuration
EAS_PROJECT_ID=your-eas-project-id

# Deep Linking and OAuth
OAUTH_REDIRECT_URI=circohback://login/callback

# Development Options
DEBUG_MODE=true
MOCK_API=true`;

const ENV_STAGING = `# CircohBack Staging Environment

# App Environment
APP_ENV=staging
VERSION=1.0.0
BUILD_NUMBER=1

# API Configuration
API_URL=https://api-staging.circohback.com
API_TIMEOUT=15000

# Supabase Configuration
SUPABASE_URL=https://staging-instance.supabase.co
SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_JWT_SECRET=your-staging-jwt-secret

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here

# Feature Flags
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
ENABLE_REMOTE_LOGGING=true

# EAS Configuration
EAS_PROJECT_ID=your-eas-project-id

# Deep Linking and OAuth
OAUTH_REDIRECT_URI=circohback://login/callback

# Development Options
DEBUG_MODE=false
MOCK_API=false`;

const ENV_PRODUCTION = `# CircohBack Production Environment

# App Environment
APP_ENV=production
VERSION=1.0.0
BUILD_NUMBER=1

# API Configuration
API_URL=https://api.circohback.com
API_TIMEOUT=15000

# Supabase Configuration
SUPABASE_URL=https://production-instance.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_JWT_SECRET=your-production-jwt-secret

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here

# Feature Flags
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
ENABLE_REMOTE_LOGGING=true

# EAS Configuration
EAS_PROJECT_ID=your-eas-project-id

# Deep Linking and OAuth
OAUTH_REDIRECT_URI=circohback://login/callback

# Development Options
DEBUG_MODE=false
MOCK_API=false`;

const ENV_EXAMPLE = `# CircohBack Environment Example
# Copy this file and rename to .env.development, .env.staging, or .env.production

# App Environment
APP_ENV=development
VERSION=1.0.0
BUILD_NUMBER=1

# API Configuration
API_URL=http://localhost:8080
API_TIMEOUT=15000

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Feature Flags
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false
ENABLE_REMOTE_LOGGING=false

# EAS Configuration
EAS_PROJECT_ID=your-eas-project-id

# Deep Linking and OAuth
OAUTH_REDIRECT_URI=circohback://login/callback

# Development Options
DEBUG_MODE=true
MOCK_API=false`;

// Required variables for each environment
const REQUIRED_VARS = {
  common: [
    'APP_ENV',
    'VERSION',
    'BUILD_NUMBER',
    'API_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'EAS_PROJECT_ID'
  ],
  production: [
    'SUPABASE_JWT_SECRET'
  ],
  staging: [
    'SUPABASE_JWT_SECRET'
  ],
  development: []
};

/**
 * Write environment files
 */
function writeEnvFiles() {
  const rootDir = path.resolve(__dirname, '..');
  
  try {
    fs.writeFileSync(path.join(rootDir, '.env.development'), ENV_DEVELOPMENT);
    console.log('✅ Created .env.development');
    
    fs.writeFileSync(path.join(rootDir, '.env.staging'), ENV_STAGING);
    console.log('✅ Created .env.staging');
    
    fs.writeFileSync(path.join(rootDir, '.env.production'), ENV_PRODUCTION);
    console.log('✅ Created .env.production');
    
    fs.writeFileSync(path.join(rootDir, '.env.example'), ENV_EXAMPLE);
    console.log('✅ Created .env.example');
    
    // Create symlink for current environment (default to development)
    const currentEnvPath = path.join(rootDir, '.env');
    const targetEnvPath = path.join(rootDir, '.env.development');
    
    // Remove existing .env if it exists
    if (fs.existsSync(currentEnvPath)) {
      fs.unlinkSync(currentEnvPath);
    }
    
    // Create symlink
    fs.symlinkSync(targetEnvPath, currentEnvPath);
    console.log('✅ Created symlink .env -> .env.development');
    
    console.log('\n🚀 Environment files created successfully!');
    console.log('\nTo switch environments, run:');
    console.log('  node scripts/setup-env.js --env=development|staging|production');
  } catch (error) {
    console.error(`❌ Error creating environment files: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Set the current environment by creating a symlink
 */
function setEnvironment(env) {
  if (!['development', 'staging', 'production'].includes(env)) {
    console.error(`❌ Invalid environment: ${env}`);
    console.error('Valid environments: development, staging, production');
    process.exit(1);
  }
  
  const rootDir = path.resolve(__dirname, '..');
  const currentEnvPath = path.join(rootDir, '.env');
  const targetEnvPath = path.join(rootDir, `.env.${env}`);
  
  // Check if target exists
  if (!fs.existsSync(targetEnvPath)) {
    console.error(`❌ Target environment file not found: ${targetEnvPath}`);
    console.error('Run the script without arguments to create environment files first.');
    process.exit(1);
  }
  
  try {
    // Remove existing .env if it exists
    if (fs.existsSync(currentEnvPath)) {
      fs.unlinkSync(currentEnvPath);
    }
    
    // Create symlink
    fs.symlinkSync(targetEnvPath, currentEnvPath);
    console.log(`✅ Environment set to ${env}`);
  } catch (error) {
    console.error(`❌ Error setting environment: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Validate environment variables in a file
 */
function validateEnvFile(filePath, env) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Environment file not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const vars = {};
    
    // Parse variables
    content.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          vars[match[1]] = match[2];
        }
      }
    });
    
    // Check required variables
    const requiredVars = [...REQUIRED_VARS.common, ...(REQUIRED_VARS[env] || [])];
    const missing = requiredVars.filter(key => !vars[key]);
    
    if (missing.length > 0) {
      console.error(`❌ Missing required variables in ${filePath}:`);
      missing.forEach(key => console.error(`  - ${key}`));
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error validating ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Validate all environment files
 */
function validateAllEnvFiles() {
  const rootDir = path.resolve(__dirname, '..');
  let allValid = true;
  
  console.log('Validating environment files...');
  
  // Validate development environment
  const devValid = validateEnvFile(
    path.join(rootDir, '.env.development'),
    'development'
  );
  if (devValid) {
    console.log('✅ .env.development is valid');
  } else {
    allValid = false;
  }
  
  // Validate staging environment
  const stagingValid = validateEnvFile(
    path.join(rootDir, '.env.staging'),
    'staging'
  );
  if (stagingValid) {
    console.log('✅ .env.staging is valid');
  } else {
    allValid = false;
  }
  
  // Validate production environment
  const prodValid = validateEnvFile(
    path.join(rootDir, '.env.production'),
    'production'
  );
  if (prodValid) {
    console.log('✅ .env.production is valid');
  } else {
    allValid = false;
  }
  
  return allValid;
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const result = { command: 'setup' };
  
  for (const arg of args) {
    if (arg.startsWith('--env=')) {
      result.command = 'set-env';
      result.env = arg.split('=')[1];
    } else if (arg === '--validate') {
      result.command = 'validate';
    } else if (arg === '--help') {
      result.command = 'help';
    }
  }
  
  return result;
}

// Show help
function showHelp() {
  console.log(`
CircohBack Environment Setup Script

USAGE:
  node scripts/setup-env.js [OPTION]

OPTIONS:
  --env=ENVIRONMENT   Set current environment (development, staging, production)
  --validate          Validate all environment files
  --help              Show this help message

EXAMPLES:
  node scripts/setup-env.js                 # Create environment files
  node scripts/setup-env.js --env=staging   # Switch to staging environment
  node scripts/setup-env.js --validate      # Validate environment files
`);
}

// Main function
function main() {
  const args = parseArgs();
  
  switch (args.command) {
    case 'setup':
      writeEnvFiles();
      validateAllEnvFiles();
      break;
    case 'set-env':
      setEnvironment(args.env);
      break;
    case 'validate':
      if (validateAllEnvFiles()) {
        console.log('\n✅ All environment files are valid!');
      } else {
        console.error('\n❌ Some environment files have issues.');
        process.exit(1);
      }
      break;
    case 'help':
      showHelp();
      break;
  }
}

// Run main function
main(); 
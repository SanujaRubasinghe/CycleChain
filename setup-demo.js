#!/usr/bin/env node

/**
 * CycleChain NFT Demo Setup Script
 * This script helps set up the demo environment
 */

const fs = require('fs');
const path = require('path');

console.log('🚲 CycleChain NFT Demo Setup\n');

// Check if required files exist
const requiredFiles = [
  'public/assets/model.glb',
  'components/nft/DemoNFTViewer.js',
  'app/(bike-purchase)/demo/page.js',
  'app/(bike-purchase)/purchase/page.js',
  'app/(bike-purchase)/nft/page.js'
];

console.log('📋 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n⚠️  Some required files are missing. Please ensure all files are in place.');
  process.exit(1);
}

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  '@react-three/fiber',
  '@react-three/drei', 
  'three',
  'ethers',
  'next'
];

const missingDeps = requiredDeps.filter(dep => 
  !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
);

if (missingDeps.length > 0) {
  console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
  console.log('Run: npm install');
  process.exit(1);
} else {
  console.log('✅ All required dependencies found');
}

// Create .env.local if it doesn't exist
console.log('\n🔧 Setting up environment...');
if (!fs.existsSync('.env.local')) {
  const envContent = `# CycleChain NFT Demo Environment
# For demo purposes - no real contract needed
NEXT_PUBLIC_DEMO_MODE=true

# Uncomment and set when deploying to blockchain
# NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
# NEXT_PUBLIC_CHAIN_ID=11155111
`;
  
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local already exists');
}

// Display demo URLs
console.log('\n🎮 Demo URLs:');
console.log('├── Quick Demo:     http://localhost:3000/demo');
console.log('├── Full Purchase:  http://localhost:3000/purchase');
console.log('├── NFT Viewer:     http://localhost:3000/nft');
console.log('└── Legacy Store:   http://localhost:3000/bike-store');

console.log('\n🚀 Ready to start!');
console.log('Run: npm run dev');
console.log('Then visit: http://localhost:3000/demo');

console.log('\n📚 Documentation:');
console.log('├── Demo Guide:       NFT_DEMO_README.md');
console.log('└── Deployment:       DEPLOYMENT_GUIDE.md');

console.log('\n✨ Setup complete! Happy testing! 🎉');

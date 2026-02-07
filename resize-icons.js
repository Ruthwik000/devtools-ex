const fs = require('fs');
const path = require('path');

// Simple PNG resizing using canvas (Node.js built-in)
async function resizeIcons() {
  console.log('🔧 Resizing icons for Chrome extension...\n');

  const sharp = require('sharp');
  const sizes = [16, 48, 128];
  const sourceIcon = path.join(__dirname, 'icons', 'icon128.png');
  
  // Check if source exists
  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Source icon not found: icons/icon128.png');
    console.log('Please ensure you have an icon128.png file in the icons folder.');
    return;
  }

  console.log('📁 Source icon:', sourceIcon);
  console.log('');

  for (const size of sizes) {
    const outputPath = path.join(__dirname, 'icons', `icon${size}.png`);
    
    try {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Created icon${size}.png (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to create icon${size}.png:`, error.message);
    }
  }

  console.log('\n✨ Icon resizing complete!');
  console.log('📦 Run "npm run build" to rebuild the extension.');
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  resizeIcons();
} catch (e) {
  console.log('📦 Installing sharp package for image processing...\n');
  const { execSync } = require('child_process');
  
  try {
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    console.log('\n✅ Sharp installed successfully!');
    console.log('🔄 Run this script again: node resize-icons.js\n');
  } catch (error) {
    console.error('❌ Failed to install sharp. Please install manually:');
    console.log('   npm install sharp --save-dev');
  }
}

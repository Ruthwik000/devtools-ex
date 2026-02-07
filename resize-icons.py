#!/usr/bin/env python3
"""
Resize icons for Chrome extension
Requires: Pillow (pip install Pillow)
"""

import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ Pillow not installed. Installing...")
    import subprocess
    subprocess.check_call(["pip", "install", "Pillow"])
    from PIL import Image

def resize_icons():
    print("🔧 Resizing icons for Chrome extension...\n")
    
    icons_dir = Path(__file__).parent / "icons"
    source_icon = icons_dir / "icon128.png"
    
    if not source_icon.exists():
        print(f"❌ Source icon not found: {source_icon}")
        print("Please ensure you have an icon128.png file in the icons folder.")
        return
    
    print(f"📁 Source icon: {source_icon}")
    print("")
    
    sizes = [16, 48, 128]
    
    try:
        # Open the source image
        img = Image.open(source_icon)
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        for size in sizes:
            output_path = icons_dir / f"icon{size}.png"
            
            # Resize with high-quality resampling
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            
            # Save as PNG
            resized.save(output_path, 'PNG', optimize=True)
            
            print(f"✅ Created icon{size}.png ({size}x{size})")
        
        print("\n✨ Icon resizing complete!")
        print("📦 Run 'npm run build' to rebuild the extension.")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    resize_icons()

#!/usr/bin/env python3
"""
Generate all individual iOS AppIcon.appiconset sizes from the master icons.

Uses:
- icon.png (rounded) for home screen sizes
- icon-appstore.png (opaque square) for the 1024 App Store marketing icon
"""

import os
from PIL import Image

# iOS icon sizes from Contents.json
IOS_SIZES = [
    # iPhone
    ("Icon-20x20@2x.png", 40),
    ("Icon-20x20@3x.png", 60),
    ("Icon-29x29@2x.png", 58),
    ("Icon-29x29@3x.png", 87),
    ("Icon-40x40@2x.png", 80),
    ("Icon-40x40@3x.png", 120),
    ("Icon-60x60@2x.png", 120),
    ("Icon-60x60@3x.png", 180),
    # iPad
    ("Icon-20x20@1x.png", 20),
    ("Icon-20x20@2x.png", 40),
    ("Icon-29x29@1x.png", 29),
    ("Icon-29x29@2x.png", 58),
    ("Icon-40x40@1x.png", 40),
    ("Icon-40x40@2x.png", 80),
    ("Icon-76x76@1x.png", 76),
    ("Icon-76x76@2x.png", 152),
    ("Icon-83.5x83.5@2x.png", 167),
    # App Store (opaque, no transparency)
    ("Icon-1024x1024@1x.png", 1024),
]

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    source_rounded = os.path.join(base_dir, 'assets', 'icon.png')
    source_appstore = os.path.join(base_dir, 'assets', 'icon-appstore.png')
    output_dir = os.path.join(base_dir, 'ios', 'Colorgenius', 'Images.xcassets', 'AppIcon.appiconset')
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("Loading source icons...")
    rounded = Image.open(source_rounded)
    appstore = Image.open(source_appstore)
    
    print(f"\nGenerating {len(IOS_SIZES)} iOS icon sizes...")
    print("=" * 50)
    
    for filename, size in IOS_SIZES:
        # App Store icon uses opaque square version
        if size == 1024:
            source = appstore
            note = " (opaque - App Store)"
        else:
            source = rounded
            note = ""
        
        resized = source.resize((size, size), Image.LANCZOS)
        output_path = os.path.join(output_dir, filename)
        resized.save(output_path, 'PNG')
        print(f"  {filename:25s} → {size}x{size}px{note}")
    
    print("=" * 50)
    print(f"\nAll icons saved to:")
    print(f"  {output_dir}")
    print("\nApp Store icon (1024x1024) is opaque - compliant with Apple requirements.")

if __name__ == '__main__':
    main()

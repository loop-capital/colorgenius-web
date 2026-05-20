#!/usr/bin/env python3
"""
Generate professional COLORgenius iOS app icons.

Brand colors:
- Primary: #7C3AED (violet/purple)
- Dark: #5B21BD
- Light: #A78BFA
"""

import os
import math
from PIL import Image, ImageDraw

# Brand colors
PRIMARY = (124, 58, 237)       # #7C3AED
DARK = (91, 33, 189)          # #5B21BD
LIGHT_VIOLET = (167, 139, 250) # #A78BFA
DEEP_VIOLET = (76, 29, 149)   # #4C1D95
PINK = (236, 72, 153)         # #EC4899
CYAN = (34, 211, 238)         # #22D3EE
GOLD = (250, 204, 21)         # #FACC15
WHITE = (255, 255, 255)
BG_DARK = (15, 15, 15)        # #0F0F0F

def interpolate_color(c1, c2, t):
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))

def draw_rounded_rect(draw, bbox, radius, fill):
    x1, y1, x2, y2 = bbox
    r = min(radius, (x2-x1)//2, (y2-y1)//2)
    if r <= 0:
        draw.rectangle(bbox, fill=fill)
        return
    draw.rectangle([x1 + r, y1, x2 - r, y2], fill=fill)
    draw.rectangle([x1, y1 + r, x2, y2 - r], fill=fill)
    draw.pieslice([x1, y1, x1 + 2*r, y1 + 2*r], 180, 270, fill=fill)
    draw.pieslice([x2 - 2*r, y1, x2, y1 + 2*r], 270, 360, fill=fill)
    draw.pieslice([x1, y2 - 2*r, x1 + 2*r, y2], 90, 180, fill=fill)
    draw.pieslice([x2 - 2*r, y2 - 2*r, x2, y2], 0, 90, fill=fill)

def draw_smooth_gradient_bg(img, size, c1, c2, center=None):
    w, h = size
    cx, cy = center if center else (w // 2, h // 2)
    max_r = int(math.sqrt((max(cx, w-cx))**2 + (max(cy, h-cy))**2))
    draw = ImageDraw.Draw(img)
    step = max(1, max_r // 120)
    for r in range(max_r, -1, -step):
        t = r / max_r if max_r > 0 else 0
        color = interpolate_color(c1, c2, t)
        bbox = [cx - r, cy - r, cx + r, cy + r]
        draw.ellipse(bbox, fill=color)

def create_glow(draw, cx, cy, radius, color, alpha=40):
    steps = max(15, radius // 10)
    for i in range(steps, 0, -1):
        t = i / steps
        r = int(radius * t)
        if r <= 0:
            continue
        a = int(alpha * (1 - t))
        glow_color = color[:3] + (a,)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=glow_color)

def create_design_layer(size, s, cx, cy, design_draw):
    """Draw the central hair strand + droplets design."""
    
    # Ambient glow behind strand
    create_glow(design_draw, cx + int(10*s), cy + int(60*s), int(300*s), LIGHT_VIOLET, 22)
    
    # Hair strand: smooth flowing S-curve
    strand_base = (248, 248, 252)
    shadow_base = (30, 8, 60)
    
    num_points = 350
    points = []
    
    for i in range(num_points + 1):
        t = i / num_points
        angle = t * math.pi * 1.65
        x = cx + int(170 * s * math.sin(angle))
        y = int((90 + 844 * t) * s)
        
        if t < 0.06:
            tw = int(52 * s * (t / 0.06))
        elif t > 0.94:
            tw = int(52 * s * ((1 - t) / 0.06))
        else:
            pulse = 1.0 + 0.08 * math.sin(t * math.pi * 6)
            tw = int(52 * s * pulse)
        
        points.append((x, y, max(tw, 2)))
    
    # Strand shadow
    for (x, y, sw) in points:
        r = max(sw // 2, 1)
        design_draw.ellipse(
            [x - r + int(3*s), y - r + int(5*s), x + r + int(3*s), y + r + int(5*s)],
            fill=shadow_base + (85,)
        )
    
    # Main strand body
    for (x, y, sw) in points:
        r = max(sw // 2, 1)
        design_draw.ellipse([x - r, y - r, x + r, y + r], fill=strand_base + (240,))
    
    # Strand center highlight
    for (x, y, sw) in points:
        hr = max(sw // 5, 1)
        hx = x - int(2*s)
        hy = y - int(3*s)
        design_draw.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=(255, 255, 255, 100))
    
    # Color droplets
    droplets = [
        (0.20, PRIMARY, 30),
        (0.40, PINK, 26),
        (0.60, CYAN, 28),
        (0.78, GOLD, 24),
    ]
    
    for t_pos, dcolor, base_r in droplets:
        idx = int(t_pos * num_points)
        if idx >= len(points):
            continue
        x, y, _ = points[idx]
        dr = int(base_r * s)
        
        create_glow(design_draw, x, y, int(dr * 3), dcolor, 30)
        
        design_draw.ellipse(
            [x - dr + int(3*s), y - dr + int(5*s), x + dr + int(3*s), y + dr + int(5*s)],
            fill=(0, 0, 0, 65)
        )
        
        design_draw.ellipse(
            [x - dr, y - int(dr*1.15), x + dr, y + int(dr*1.15)],
            fill=dcolor + (250,)
        )
        
        hl_r = max(int(7 * s), 1)
        design_draw.ellipse(
            [x - int(5*s) - hl_r, y - int(9*s) - hl_r, x - int(5*s) + hl_r, y - int(9*s) + hl_r],
            fill=(255, 255, 255, 210)
        )
        
        hl2_r = max(int(3 * s), 1)
        design_draw.ellipse(
            [x + int(5*s) - hl2_r, y + int(3*s) - hl2_r, x + int(5*s) + hl2_r, y + int(3*s) + hl2_r],
            fill=(255, 255, 255, 90)
        )
    
    # Sparkle accents
    sparkles = [
        (cx - int(190*s), cy - int(210*s), 5),
        (cx + int(210*s), cy - int(170*s), 4),
        (cx - int(230*s), cy + int(190*s), 6),
        (cx + int(180*s), cy + int(230*s), 4),
        (cx + int(250*s), cy - int(50*s), 3),
        (cx - int(260*s), cy + int(50*s), 4),
    ]
    
    for sx, sy, sr in sparkles:
        sr = max(int(sr * s), 1)
        sw = max(sr // 2, 1)
        design_draw.line([sx - sr*2, sy, sx + sr*2, sy], fill=(255, 255, 255, 130), width=sw)
        design_draw.line([sx, sy - sr*2, sx, sy + sr*2], fill=(255, 255, 255, 130), width=sw)
        design_draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(255, 255, 255, 190))

def create_icon(size, rounded=True):
    """Create the COLORgenius app icon."""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    w, h = size
    s = w / 1024.0
    
    if rounded:
        # iOS rounded rect mask
        corner_radius = int(230 * s)
        mask = Image.new('L', size, 0)
        mask_draw = ImageDraw.Draw(mask)
        draw_rounded_rect(mask_draw, [0, 0, w, h], corner_radius, 255)
    else:
        # Square for App Store (no rounding, no transparency)
        mask = Image.new('L', size, 255)
    
    # Background gradient
    bg = Image.new('RGBA', size, (0, 0, 0, 0))
    draw_smooth_gradient_bg(bg, size, PRIMARY, DARK, center=(int(w*0.45), int(h*0.35)))
    bg.putalpha(mask)
    
    # Inner depth/highlight (only for rounded icons)
    if rounded:
        depth = Image.new('RGBA', size, (0, 0, 0, 0))
        depth_draw = ImageDraw.Draw(depth)
        
        hl_w = max(int(2 * s), 1)
        for offset in range(hl_w):
            alpha = int(50 * (1 - offset/hl_w))
            depth_draw.arc(
                [offset, offset, w-1-offset, h-1-offset],
                start=200, end=340,
                fill=(255, 255, 255, alpha),
                width=1
            )
        
        shadow_w = max(int(4 * s), 1)
        for offset in range(shadow_w):
            alpha = int(40 * (1 - offset/shadow_w))
            depth_draw.arc(
                [offset, offset, w-1-offset, h-1-offset],
                start=20, end=160,
                fill=(0, 0, 0, alpha),
                width=1
            )
        depth.putalpha(mask)
    else:
        depth = Image.new('RGBA', size, (0, 0, 0, 0))
    
    # Main design
    design = Image.new('RGBA', size, (0, 0, 0, 0))
    design_draw = ImageDraw.Draw(design)
    
    cx, cy = w // 2, h // 2
    create_design_layer(size, s, cx, cy, design_draw)
    
    # Compose
    img = Image.alpha_composite(img, bg)
    img = Image.alpha_composite(img, depth)
    img = Image.alpha_composite(img, design)
    
    return img

def create_icon_opaque(size):
    """Create a fully opaque square icon for App Store requirements."""
    img = Image.new('RGBA', size, PRIMARY + (255,))
    w, h = size
    s = w / 1024.0
    
    # Full-bleed gradient background (no mask)
    draw_smooth_gradient_bg(img, size, PRIMARY, DARK, center=(int(w*0.45), int(h*0.35)))
    
    # Add design
    design = Image.new('RGBA', size, (0, 0, 0, 0))
    design_draw = ImageDraw.Draw(design)
    
    cx, cy = w // 2, h // 2
    create_design_layer(size, s, cx, cy, design_draw)
    
    img = Image.alpha_composite(img, design)
    
    # Convert to RGB to ensure no transparency
    return img.convert('RGB')

def create_splash_icon(size):
    img = Image.new('RGBA', size, BG_DARK + (255,))
    w, h = size
    s = w / 1024.0
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2
    
    create_glow(draw, cx, cy + int(60*s), int(350*s), DEEP_VIOLET, 18)
    create_glow(draw, cx + int(100*s), cy - int(100*s), int(250*s), PRIMARY, 12)
    
    strand_base = (248, 248, 252)
    num_points = 350
    points = []
    
    for i in range(num_points + 1):
        t = i / num_points
        angle = t * math.pi * 1.65
        x = cx + int(170 * s * math.sin(angle))
        y = int((90 + 844 * t) * s)
        
        if t < 0.06:
            tw = int(52 * s * (t / 0.06))
        elif t > 0.94:
            tw = int(52 * s * ((1 - t) / 0.06))
        else:
            tw = int(52 * s)
        points.append((x, y, max(tw, 2)))
    
    for (x, y, sw) in points:
        r = max(sw // 2, 1)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=strand_base + (225,))
    
    droplets = [
        (0.20, PRIMARY, 30),
        (0.40, PINK, 26),
        (0.60, CYAN, 28),
        (0.78, GOLD, 24),
    ]
    
    for t_pos, dcolor, base_r in droplets:
        idx = int(t_pos * num_points)
        x, y, _ = points[idx]
        dr = int(base_r * s)
        
        draw.ellipse([x - dr, y - int(dr*1.15), x + dr, y + int(dr*1.15)], fill=dcolor + (240,))
        hl_r = max(int(7 * s), 1)
        draw.ellipse(
            [x - int(5*s) - hl_r, y - int(9*s) - hl_r, x - int(5*s) + hl_r, y - int(9*s) + hl_r],
            fill=(255, 255, 255, 190)
        )
    
    return img

def create_adaptive_icon(size):
    return create_icon(size, rounded=True)

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    assets_dir = os.path.join(base_dir, 'assets')
    
    os.makedirs(assets_dir, exist_ok=True)
    
    print("Generating COLORgenius app icons...")
    print("=" * 50)
    
    print("\n1. Main icon (1024x1024) - rounded iOS style...")
    icon = create_icon((1024, 1024), rounded=True)
    icon.save(os.path.join(assets_dir, 'icon.png'), 'PNG')
    print("   Saved: assets/icon.png")
    
    print("\n2. App Store icon (1024x1024) - opaque, no rounding...")
    app_store_icon = create_icon_opaque((1024, 1024))
    app_store_icon.save(os.path.join(assets_dir, 'icon-appstore.png'), 'PNG')
    print("   Saved: assets/icon-appstore.png")
    
    print("\n3. Android adaptive icon (1024x1024)...")
    adaptive = create_adaptive_icon((1024, 1024))
    adaptive.save(os.path.join(assets_dir, 'adaptive-icon.png'), 'PNG')
    print("   Saved: assets/adaptive-icon.png")
    
    print("\n4. Splash screen icon (1024x1024)...")
    splash = create_splash_icon((1024, 1024))
    splash.save(os.path.join(assets_dir, 'splash-icon.png'), 'PNG')
    print("   Saved: assets/splash-icon.png")
    
    print("\n5. Favicon (48x48)...")
    favicon = create_icon((48, 48), rounded=True)
    favicon.save(os.path.join(assets_dir, 'favicon.png'), 'PNG')
    print("   Saved: assets/favicon.png")
    
    print("\n" + "=" * 50)
    print("All icons generated successfully!")
    print("\nIMPORTANT NOTES:")
    print("- assets/icon.png: Rounded, for iOS home screen (has transparency at corners)")
    print("- assets/icon-appstore.png: Opaque square, REQUIRED for App Store submission")
    print("  Expo EAS Build should use this for the App Store slot.")

if __name__ == '__main__':
    main()

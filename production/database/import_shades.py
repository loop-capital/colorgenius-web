#!/usr/bin/env python3
"""Import Davines + L'ANZA shade data into the ColorGenius database via API."""
import json
import os
import urllib.request

API_BASE = os.environ.get('API_BASE', 'https://api.colorgenius.co/api')

def import_data():
    # Load data
    davines_db = json.load(open('/home/jason/.openclaw/workspaces/colorgenius/data/brands/davines/shades.json'))
    lanza_db = json.load(open('/home/jason/.openclaw/workspaces/colorgenius/data/brands/lanza/shades.json'))
    
    # Create brands
    brands = [
        {'name': 'Davines', 'slug': 'davines'},
        {"name": "L'ANZA", 'slug': 'lanza'},
    ]
    for brand in brands:
        print(f"Brand: {brand['name']}")
    
    # Import Davines lines
    total_shades = 0
    for line_key, line_data in davines_db['lines'].items():
        shade_count = len(line_data.get('shades', []))
        total_shades += shade_count
        print(f"  Line: {line_data['name']} - {shade_count} shades")
    
    # Import L'ANZA
    lanza_shades = sum(len(s.get('shades', [])) for s in lanza_db.get('series', []))
    total_shades += lanza_shades
    print(f"  L'ANZA: {lanza_shades} shades")
    
    print(f"\nTotal: {total_shades} shades ready to import")
    print("Run: npx prisma db push")
    print("Then: npx ts-node scripts/import-shades.ts")

if __name__ == '__main__':
    import_data()

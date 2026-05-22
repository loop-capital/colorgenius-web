#!/usr/bin/env python3
"""COLORgenius Explainer Video — Veo 3.1 Generator"""
import os, sys, time, base64, json
os.environ['GEMINI_API_KEY'] = 'AIzaSyAlO3itPiNSovL0uZMCRQ3WKMr086IoJHo'

from google import genai
client = genai.Client()

ASSETS = '/home/jason/.openclaw/workspaces/colorgenius/assets'
OUTPUT = os.path.join(ASSETS, 'generated')
os.makedirs(OUTPUT, exist_ok=True)

def load_image(name):
    path = os.path.join(ASSETS, name)
    with open(path, 'rb') as f:
        data = f.read()
    ext = os.path.splitext(name)[1].lower()
    mime = {'png':'image/png','jpg':'image/jpeg','jpeg':'image/jpeg','webp':'image/webp'}.get(ext,'image/png')
    return data, mime

# Load reference images
tiche_bytes, tiche_mime = load_image('tiche-ref-360.png')
salon_bytes, salon_mime = load_image('salon/pleij-styling-area.webp')
interior_bytes, interior_mime = load_image('salon/pleij-salon-interior.webp')

print(f"Loaded refs: Tiche={len(tiche_bytes)}B, Salon={len(salon_bytes)}B, Interior={len(interior_bytes)}B")

# Scene definitions
scenes = [
    {
        "num": 1,
        "name": "opening-meet-tiche",
        "prompt": "A confident female hairstylist with voluminous dark curly hair, gold layered necklaces, and a black collared shirt stands in a modern industrial hair salon with exposed ceiling ductwork, herringbone floors, and pendant lighting. She smiles warmly at the camera. Warm ambient lighting, shallow depth of field, cinematic 16:9.",
        "refs": [tiche_bytes, salon_bytes],
        "ref_mimes": [tiche_mime, salon_mime],
    },
    {
        "num": 2,
        "name": "salon-walkthrough",
        "prompt": "Smooth slow dolly shot through a bright modern hair salon. Sleek black styling chairs line a stone counter with tall mirrors under minimalist pendant lights. Golden hour sunlight streams through floor-to-ceiling windows onto dark tiled floors. A stylist works with a client in the background. Cinematic, warm tones, 16:9.",
        "refs": [salon_bytes, interior_bytes],
        "ref_mimes": [salon_mime, interior_mime],
    },
    {
        "num": 3,
        "name": "app-formula-creation",
        "prompt": "Close-up of a woman's hands holding an iPhone showing a clean modern app interface with warm coral accent color. The app shows a formula creation screen with brand dropdown menus and color swatches. Her thumb scrolls through options. Clean UI, professional lighting, shallow depth of field, 16:9.",
        "refs": [tiche_bytes],
        "ref_mimes": [tiche_mime],
    },
    {
        "num": 4,
        "name": "bowl-weighing",
        "prompt": "A hairstylist with dark curly hair pours color cream from a tube into a round white porcelain bowl on a small digital scale at her salon station. The scale display shows numbers incrementing. She pauses precisely at the target weight. Warm overhead pendant lighting. Marble counter visible. Satisfying, precise, 16:9.",
        "refs": [tiche_bytes, salon_bytes],
        "ref_mimes": [tiche_mime, salon_mime],
    },
    {
        "num": 5,
        "name": "app-client-history",
        "prompt": "The hairstylist sits in a black styling chair, iPhone in hand, showing a client history screen. The screen displays previous formulas with dates and color result photos. She scrolls through with her thumb. Salon mirrors reflect her focused expression. Warm ambient lighting, 16:9.",
        "refs": [tiche_bytes, interior_bytes],
        "ref_mimes": [tiche_mime, interior_mime],
    },
    {
        "num": 6,
        "name": "app-inventory",
        "prompt": "A phone screen showing an inventory dashboard with color-coded stock level bars — green for full, yellow for low, red for reorder needed. A notification pops up about running low on a shade. A woman's thumb taps the reorder button. Clean UI animation, 16:9.",
        "refs": [tiche_bytes],
        "ref_mimes": [tiche_mime],
    },
    {
        "num": 7,
        "name": "stylist-working",
        "prompt": "Over-the-shoulder shot of a female hairstylist with dark curly hair mixing color at her station. She holds a bowl in one hand and a tint brush in the other. The salon mirror reflects her focused expression. An iPhone showing a color app sits propped up nearby. Golden hour light from windows. Intimate, authentic, 16:9.",
        "refs": [tiche_bytes, salon_bytes],
        "ref_mimes": [tiche_mime, salon_mime],
    },
    {
        "num": 8,
        "name": "applying-color",
        "prompt": "Close-up of a hairstylist's hands applying color to a client's hair with a tint brush. Smooth, confident strokes. The color is rich and even. Salon mirrors and styling products visible in soft background. Warm, professional lighting. 16:9.",
        "refs": [tiche_bytes],
        "ref_mimes": [tiche_mime],
    },
    {
        "num": 9,
        "name": "happy-client",
        "prompt": "A client in a black salon cape turns in a styling chair to face a mirror, revealing beautiful perfectly blended hair color. The hairstylist with dark curly hair stands behind her smiling. The client touches her hair delighted. Salon mirrors and pendant lights visible. Bright celebratory lighting, 16:9.",
        "refs": [tiche_bytes, interior_bytes],
        "ref_mimes": [tiche_mime, interior_mime],
    },
    {
        "num": 10,
        "name": "brand-closing",
        "prompt": "Clean minimal product shot. An iPhone displays the App Store page for a hair color app with a coral-colored icon. The 'Get' button is prominent. Background is soft warm gradient. Modern Apple-style product photography. 16:9.",
        "refs": [],
        "ref_mimes": [],
    },
]

# Generate each scene
for scene in scenes:
    num = scene["num"]
    name = scene["name"]
    outfile = os.path.join(OUTPUT, f"scene-{num:02d}-{name}.mp4")
    
    # Skip if already generated
    if os.path.exists(outfile) and os.path.getsize(outfile) > 10000:
        print(f"⏭️  Scene {num:02d} ({name}) — already exists, skipping")
        continue
    
    print(f"\n🎬 Generating Scene {num:02d}: {name}...")
    
    # Build config
    config = {
        "aspect_ratio": "16:9",
        "resolution": "1080p",
        "number_of_videos": 1,
    }
    
    # Add reference images if any
    if scene["refs"]:
        ref_images = []
        for img_bytes, mime in zip(scene["refs"], scene["ref_mimes"]):
            ref_images.append({
                "image": {
                    "image_bytes": base64.b64encode(img_bytes).decode(),
                    "mime_type": mime,
                }
            })
        config["reference_images"] = ref_images
    
    try:
        operation = client.models.generate_videos(
            model="veo-3.1-generate-preview",
            prompt=scene["prompt"],
            config=config,
        )
        
        print(f"   Operation: {operation.name[:60]}...")
        print(f"   Polling...")
        
        # Poll until done
        poll_count = 0
        while not operation.done:
            poll_count += 1
            time.sleep(30)
            operation = client.operations.get(operation)
            print(f"   Poll {poll_count}... done={operation.done}")
            if poll_count > 20:  # 10 min max
                print(f"   ⏰ Timeout after 10 minutes")
                break
        
        if operation.done and operation.response and operation.response.generated_videos:
            video = operation.response.generated_videos[0]
            client.files.download(file=video)
            video.save(outfile)
            size_mb = os.path.getsize(outfile) / (1024*1024)
            print(f"   ✅ Saved: {outfile} ({size_mb:.1f} MB)")
        else:
            print(f"   ❌ No video generated. Response: {operation.response}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:200]}")

print("\n\n📊 Generation Summary:")
for scene in scenes:
    num = scene["num"]
    name = scene["name"]
    outfile = os.path.join(OUTPUT, f"scene-{num:02d}-{name}.mp4")
    if os.path.exists(outfile):
        size_mb = os.path.getsize(outfile) / (1024*1024)
        print(f"  ✅ Scene {num:02d} ({name}): {size_mb:.1f} MB")
    else:
        print(f"  ❌ Scene {num:02d} ({name}): FAILED")

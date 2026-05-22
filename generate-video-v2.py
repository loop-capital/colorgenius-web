#!/usr/bin/env python3
"""COLORgenius Explainer Video — Veo 3.1 Generator v2 (fixed download)"""
import os, sys, time, base64
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

# Load refs
tiche_bytes, tiche_mime = load_image('tiche-ref-360.png')
salon_bytes, salon_mime = load_image('salon/pleij-styling-area.webp')
interior_bytes, interior_mime = load_image('salon/pleij-salon-interior.webp')

scenes = [
    {"num":1, "name":"opening-meet-tiche",
     "prompt":"A confident female hairstylist with voluminous dark curly hair, gold layered necklaces, and a black collared shirt stands in a modern industrial hair salon with herringbone floors and pendant lighting. She smiles warmly at the camera. Warm ambient lighting, shallow depth of field, cinematic 16:9.",
     "refs":[tiche_bytes, salon_bytes], "mimes":[tiche_mime, salon_mime]},
    {"num":2, "name":"salon-walkthrough",
     "prompt":"Smooth slow dolly shot through a bright modern hair salon. Sleek black styling chairs line a stone counter with tall mirrors under minimalist pendant lights. Golden hour sunlight streams through floor-to-ceiling windows. Cinematic warm tones 16:9.",
     "refs":[salon_bytes, interior_bytes], "mimes":[salon_mime, interior_mime]},
    {"num":3, "name":"app-formula",
     "prompt":"Close-up of a woman's hands holding an iPhone showing a clean modern app with warm coral accent color. The app shows formula creation with brand dropdown menus and color swatches. Her thumb scrolls through options. Clean UI, professional lighting, 16:9.",
     "refs":[tiche_bytes], "mimes":[tiche_mime]},
    {"num":4, "name":"bowl-weighing",
     "prompt":"A hairstylist with dark curly hair pours color cream into a round white porcelain bowl on a digital scale at her salon station. The scale display shows numbers incrementing. Warm overhead pendant lighting, marble counter, satisfying precise 16:9.",
     "refs":[tiche_bytes, salon_bytes], "mimes":[tiche_mime, salon_mime]},
    {"num":5, "name":"client-history",
     "prompt":"The hairstylist sits in a black styling chair, iPhone in hand, showing a client history screen with previous formulas and color result photos. She scrolls with her thumb. Salon mirrors visible. Warm ambient lighting 16:9.",
     "refs":[tiche_bytes, interior_bytes], "mimes":[tiche_mime, interior_mime]},
    {"num":6, "name":"stylist-working",
     "prompt":"Over-the-shoulder shot of a female hairstylist with dark curly hair mixing color at her station. She holds a bowl in one hand and a tint brush in the other. An iPhone showing a color app sits nearby. Golden hour light from windows. Intimate authentic 16:9.",
     "refs":[tiche_bytes, salon_bytes], "mimes":[tiche_mime, salon_mime]},
    {"num":7, "name":"applying-color",
     "prompt":"Close-up of a hairstylist hands applying color to a client hair with a tint brush. Smooth confident strokes. The color is rich and even. Salon mirrors in soft background. Warm professional lighting 16:9.",
     "refs":[tiche_bytes], "mimes":[tiche_mime]},
    {"num":8, "name":"happy-client",
     "prompt":"A client in a black salon cape turns in a styling chair to face a mirror revealing beautiful perfectly blended hair color. The hairstylist with dark curly hair stands behind her smiling. The client touches her hair delighted. Bright celebratory lighting 16:9.",
     "refs":[tiche_bytes, interior_bytes], "mimes":[tiche_mime, interior_mime]},
    {"num":9, "name":"brand-closing",
     "prompt":"Clean minimal product shot. An iPhone displays the App Store page for a hair color app with a coral-colored icon. The Get button is prominent. Background is soft warm gradient. Modern Apple-style product photography 16:9.",
     "refs":[], "mimes":[]},
]

completed = []
failed = []

for scene in scenes:
    num = scene["num"]
    name = scene["name"]
    outfile = os.path.join(OUTPUT, f"scene-{num:02d}-{name}.mp4")
    
    if os.path.exists(outfile) and os.path.getsize(outfile) > 10000:
        print(f"⏭️  Scene {num:02d} ({name}) — already exists, skipping")
        completed.append(name)
        continue
    
    sys.stdout.write(f"\n🎬 Scene {num:02d}: {name}... ")
    sys.stdout.flush()
    
    config = {"aspect_ratio":"16:9", "resolution":"1080p", "number_of_videos":1}
    
    if scene["refs"]:
        ref_images = []
        for img_bytes, mime in zip(scene["refs"], scene["mimes"]):
            ref_images.append({"image":{"image_bytes": base64.b64encode(img_bytes).decode(), "mime_type": mime}})
        config["reference_images"] = ref_images
    
    try:
        operation = client.models.generate_videos(
            model="veo-3.1-generate-preview", prompt=scene["prompt"], config=config)
        
        polls = 0
        while not operation.done:
            polls += 1
            time.sleep(30)
            operation = client.operations.get(operation)
            if polls > 20:
                sys.stdout.write("⏰ timeout\n")
                failed.append(name)
                break
        
        if not operation.done:
            continue
            
        if operation.response and operation.response.generated_videos:
            vid = operation.response.generated_videos[0]
            # vid is GeneratedVideo, vid.video is Video with video_bytes
            if vid.video and vid.video.video_bytes:
                with open(outfile, 'wb') as f:
                    f.write(vid.video.video_bytes)
                size_mb = os.path.getsize(outfile) / (1024*1024)
                sys.stdout.write(f"✅ {size_mb:.1f}MB ({polls} polls)\n")
                completed.append(name)
            elif vid.video and vid.video.uri:
                # Download from URI
                import urllib.request
                urllib.request.urlretrieve(vid.video.uri, outfile)
                size_mb = os.path.getsize(outfile) / (1024*1024)
                sys.stdout.write(f"✅ {size_mb:.1f}MB (uri)\n")
                completed.append(name)
            else:
                sys.stdout.write(f"❌ no video data\n")
                failed.append(name)
        else:
            # Check if filtered
            resp = operation.response
            filtered = getattr(resp, 'rai_media_filtered_count', 0)
            if filtered:
                sys.stdout.write(f"⚠️  filtered by safety\n")
            else:
                sys.stdout.write(f"❌ no video\n")
            failed.append(name)
    except Exception as e:
        err = str(e)[:100]
        if '429' in err or 'RESOURCE_EXHAUSTED' in err:
            sys.stdout.write("⏰ quota hit — wait and retry\n")
        else:
            sys.stdout.write(f"❌ {err}\n")
        failed.append(name)

print(f"\n\n📊 Done: {len(completed)}/{len(scenes)} scenes")
print(f"✅ Completed: {', '.join(completed) if completed else 'none'}")
print(f"❌ Failed: {', '.join(failed) if failed else 'none'}")

#!/usr/bin/env python3
"""Generate remaining COLORgenius scenes with Veo 3.1 Fast"""
import os, sys, time, base64, json, urllib.request

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

tiche_bytes, tiche_mime = load_image('tiche-ref-360.png')
salon_bytes, salon_mime = load_image('salon/pleij-styling-area.webp')
interior_bytes, interior_mime = load_image('salon/pleij-salon-interior.webp')

scenes = [
    {"num":3, "name":"app-formula",
     "prompt":"Close-up of hands holding an iPhone showing a modern beauty app. The screen displays color formula options with brand names and shade swatches. A thumb scrolls through selections. Clean bright UI design. Professional lighting, shallow depth of field, cinematic 16:9.",
     "refs":[tiche_bytes], "mimes":[tiche_mime]},
    {"num":6, "name":"stylist-working",
     "prompt":"Over-the-shoulder view of a female hairstylist with dark curly hair mixing hair color at her station. She holds a ceramic bowl and tint brush. An iPhone showing a color app sits nearby. Golden hour light from windows. Intimate authentic moment, cinematic 16:9.",
     "refs":[tiche_bytes, salon_bytes], "mimes":[tiche_mime, salon_mime]},
    {"num":7, "name":"applying-color",
     "prompt":"Close-up of a hairstylist hands carefully applying color to a client hair with a tint brush. Smooth confident strokes. The color is rich and even. Salon mirrors in soft background. Warm professional lighting, cinematic 16:9.",
     "refs":[tiche_bytes], "mimes":[tiche_mime]},
    {"num":8, "name":"happy-client",
     "prompt":"A client in a black salon cape turns in a styling chair to face a mirror revealing beautiful blended hair color. A female hairstylist with dark curly hair stands behind her smiling proudly. The client touches her hair delighted. Bright celebratory lighting, cinematic 16:9.",
     "refs":[tiche_bytes, interior_bytes], "mimes":[tiche_mime, interior_mime]},
    {"num":9, "name":"brand-closing",
     "prompt":"Clean minimal product shot. An iPhone displays an app store page with a coral-colored hair styling app icon. Soft warm gradient background. Modern Apple-style product photography. Cinematic 16:9.",
     "refs":[], "mimes":[]},
]

MODEL = 'veo-3.1-fast-generate-preview'

for scene in scenes:
    num = scene["num"]
    name = scene["name"]
    outfile = os.path.join(OUTPUT, f"scene-{num:02d}-{name}.mp4")

    if os.path.exists(outfile) and os.path.getsize(outfile) > 10000:
        print(f"SKIP Scene {num:02d} ({name}) - already exists")
        continue

    sys.stdout.write(f"Generating Scene {num:02d} ({name})... ")
    sys.stdout.flush()

    config = {"aspect_ratio":"16:9", "resolution":"1080p", "number_of_videos":1}
    if scene["refs"]:
        config["reference_images"] = [
            {"image":{"image_bytes": base64.b64encode(b).decode(), "mime_type": m}}
            for b, m in zip(scene["refs"], scene["mimes"])
        ]

    try:
        op = client.models.generate_videos(model=MODEL, prompt=scene["prompt"], config=config)
        polls = 0
        while not op.done:
            polls += 1
            time.sleep(30)
            op = client.operations.get(op)
            if polls > 20:
                sys.stdout.write("timeout\n")
                break

        if not op.done:
            continue

        resp = op.response
        if resp and resp.generated_videos:
            vid = resp.generated_videos[0]
            if vid.video and vid.video.video_bytes:
                with open(outfile, 'wb') as f:
                    f.write(vid.video.video_bytes)
                print(f"OK {os.path.getsize(outfile)/(1024*1024):.1f}MB ({polls} polls)")
            elif vid.video and vid.video.uri:
                uri = vid.video.uri
                req2 = urllib.request.Request(uri)
                with urllib.request.urlopen(req2) as r2:
                    data = r2.read()
                with open(outfile, 'wb') as f:
                    f.write(data)
                print(f"OK {len(data)/(1024*1024):.1f}MB (uri download)")
            else:
                print("FAIL no video data")
        else:
            filtered = getattr(resp, 'rai_media_filtered_count', 0)
            if filtered:
                print("FILTERED by safety")
            else:
                print("FAIL no video in response")
    except Exception as e:
        err = str(e)[:120]
        if '429' in err:
            print("RATE LIMITED")
        else:
            print(f"ERROR: {err}")

print("\n=== ALL SCENES ===")
for f in sorted(os.listdir(OUTPUT)):
    if f.endswith('.mp4'):
        size = os.path.getsize(os.path.join(OUTPUT, f)) / (1024*1024)
        print(f"  {f}: {size:.1f}MB")

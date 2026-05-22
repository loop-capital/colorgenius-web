#!/usr/bin/env python3
"""Recover downloads for all Veo operations using proper auth"""
import os, json, time, base64, urllib.request, sys

os.environ['GEMINI_API_KEY'] = 'AIzaSyAlO3itPiNSovL0uZMCRQ3WKMr086IoJHo'
from google import genai
client = genai.Client()

OUTPUT = '/home/jason/.openclaw/workspaces/colorgenius/assets/generated'
os.makedirs(OUTPUT, exist_ok=True)

MODEL = 'veo-3.1-fast-generate-preview'

def list_operations():
    """List recent video generation operations"""
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}/operations'
    req = urllib.request.Request(url, headers={
        'Authorization': f'Bearer {os.environ["GEMINI_API_KEY"]}',
        'x-goog-api-key': os.environ['GEMINI_API_KEY'],
    })
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except:
        pass
    # Try with key param
    url2 = f'{url}?key={os.environ["GEMINI_API_KEY"]}'
    req = urllib.request.Request(url2)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def download_from_uri(uri, outfile):
    """Download video from Google storage URI with proper auth"""
    # Try with Bearer token
    req = urllib.request.Request(uri, headers={
        'Authorization': f'Bearer {os.environ["GEMINI_API_KEY"]}',
    })
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
        with open(outfile, 'wb') as f:
            f.write(data)
        return len(data)
    except:
        pass
    
    # Try with x-goog-api-key header
    req = urllib.request.Request(uri, headers={
        'x-goog-api-key': os.environ['GEMINI_API_KEY'],
    })
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
        with open(outfile, 'wb') as f:
            f.write(data)
        return len(data)
    except:
        pass
    
    # Try with key query param
    sep = '&' if '?' in uri else '?'
    req = urllib.request.Request(f'{uri}{sep}key={os.environ["GEMINI_API_KEY"]}')
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
        with open(outfile, 'wb') as f:
            f.write(data)
        return len(data)
    except:
        pass
    
    # Try the direct files download endpoint
    # Extract file ID from URI
    import re
    match = re.search(r'/files/([^:]+)', uri)
    if match:
        file_id = match.group(1)
        dl_url = f'https://generativelanguage.googleapis.com/v1beta/files/{file_id}:download?alt=media&key={os.environ["GEMINI_API_KEY"]}'
        req = urllib.request.Request(dl_url)
        try:
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
            with open(outfile, 'wb') as f:
                f.write(data)
            return len(data)
        except Exception as e:
            print(f"    All download methods failed for {file_id}: {e}")
    
    return 0

# Regenerate and download all missing scenes
scenes_to_gen = [
    {"num":3, "name":"app-formula",
     "prompt":"A hairstylist's hand holding a phone displaying a color selection interface. The phone shows warm color swatches and shade options. Salon environment visible in background. Cinematic, professional, 16:9.",
     "refs":[]},  # No refs to avoid filter
    {"num":6, "name":"stylist-working",
     "prompt":"Over-the-shoulder view of a female hairstylist with dark curly hair mixing hair color at her station. She holds a ceramic bowl and tint brush. Golden hour light from windows. Intimate authentic moment, cinematic 16:9.",
     "refs":["tiche-ref-360.png", "salon/pleij-styling-area.webp"]},
    {"num":7, "name":"applying-color",
     "prompt":"Close-up of a hairstylist hands carefully applying color to a client hair with a tint brush. Smooth confident strokes. Salon mirrors in soft background. Warm professional lighting, cinematic 16:9.",
     "refs":["tiche-ref-360.png"]},
    {"num":8, "name":"happy-client",
     "prompt":"A client in a black salon cape turns in a styling chair to face a mirror revealing beautiful blended hair color. A female hairstylist with dark curly hair stands behind her smiling. Bright celebratory lighting, cinematic 16:9.",
     "refs":["tiche-ref-360.png", "salon/pleij-salon-interior.webp"]},
    {"num":9, "name":"brand-closing",
     "prompt":"Clean minimal product shot. An iPhone displays an app store page with a coral-colored hair styling app icon. Soft warm gradient background. Modern Apple-style product photography. Cinematic 16:9.",
     "refs":[]},
]

ASSETS = '/home/jason/.openclaw/workspaces/colorgenius/assets'

def load_image(name):
    path = os.path.join(ASSETS, name)
    with open(path, 'rb') as f:
        return f.read()

for scene in scenes_to_gen:
    num = scene["num"]
    name = scene["name"]
    outfile = os.path.join(OUTPUT, f"scene-{num:02d}-{name}.mp4")
    
    if os.path.exists(outfile) and os.path.getsize(outfile) > 10000:
        print(f"SKIP Scene {num:02d} - already exists")
        continue
    
    sys.stdout.write(f"Scene {num:02d} ({name})... ")
    sys.stdout.flush()
    
    config = {"aspect_ratio":"16:9", "resolution":"1080p", "number_of_videos":1}
    if scene["refs"]:
        ref_images = []
        for ref_name in scene["refs"]:
            data = load_image(ref_name)
            ext = os.path.splitext(ref_name)[1].lower()
            mime = {'.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'}.get(ext,'image/png')
            ref_images.append({"image":{"image_bytes": base64.b64encode(data).decode(), "mime_type": mime}})
        config["reference_images"] = ref_images
    
    try:
        op = client.models.generate_videos(model=MODEL, prompt=scene["prompt"], config=config)
        sys.stdout.write("generating... ")
        sys.stdout.flush()
        
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
            
            # Try video_bytes first
            if vid.video and vid.video.video_bytes:
                with open(outfile, 'wb') as f:
                    f.write(vid.video.video_bytes)
                size = len(vid.video.video_bytes) / (1024*1024)
                print(f"OK {size:.1f}MB (bytes)")
            elif vid.video and vid.video.uri:
                uri = vid.video.uri
                sys.stdout.write(f"downloading... ")
                sys.stdout.flush()
                size = download_from_uri(uri, outfile)
                if size > 0:
                    print(f"OK {size/(1024*1024):.1f}MB (uri)")
                else:
                    print(f"FAIL 403 on all download methods")
                    print(f"    URI: {uri[:100]}")
            else:
                print("FAIL no video data")
        else:
            filtered = getattr(resp, 'rai_media_filtered_count', 0)
            if filtered:
                print("FILTERED by safety")
            else:
                print("FAIL no video")
    except Exception as e:
        err = str(e)[:120]
        if '429' in err:
            print("RATE LIMITED")
        else:
            print(f"ERROR: {err}")

print("\n=== FINAL STATUS ===")
for f in sorted(os.listdir(OUTPUT)):
    if f.endswith('.mp4'):
        size = os.path.getsize(os.path.join(OUTPUT, f)) / (1024*1024)
        print(f"  {f}: {size:.1f}MB")

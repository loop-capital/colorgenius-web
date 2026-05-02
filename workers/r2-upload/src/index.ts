export interface Env {
  R2_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/upload' && request.method === 'POST') {
      try {
        const { sessionId, angle, contentType } = await request.json();
        const key = `sessions/${sessionId}/${angle}-${Date.now()}.jpg`;
        
        // Generate presigned URL (30 min expiry)
        // Note: In Cloudflare Workers, we can't directly create presigned URLs for R2
        // Instead, we'll use a workaround by having the worker proxy the upload
        return new Response(JSON.stringify({
          success: true,
          uploadUrl: `https://colorgenius-r2-upload.shiny-sky-8891.workers.dev/proxy-upload/${key}`,
          publicUrl: `https://pub-bb99062a526e4db384e390a5bdd65455.r2.dev/${key}`,
          key,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle the proxy upload endpoint
    if (url.pathname.startsWith('/proxy-upload/') && request.method === 'PUT') {
      try {
        const key = url.pathname.substring('/proxy-upload/'.length);
        
        // Get the request body
        const body = await request.arrayBuffer();
        
        console.log(`Uploading to R2: key=${key}, size=${body.byteLength}`);
        
        // Upload to R2
        await env.R2_BUCKET.put(key, body, {
          httpMetadata: {
            contentType: request.headers.get('content-type') || 'image/jpeg',
          }
        });
        
        console.log(`Successfully uploaded to R2: ${key}`);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error uploading to R2:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
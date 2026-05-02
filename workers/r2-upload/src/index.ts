export interface Env {
  // R2 Bucket binding
  R2_BUCKET: R2Bucket;
  
  // Optional: R2 credentials for S3 API (if needed)
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
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
        
        // Return information for direct upload to R2 via our worker proxy
        return new Response(JSON.stringify({
          success: true,
          uploadUrl: `https://colorgenius-r2-upload.shiny-sky-8891.workers.dev/upload-direct/${key}`,
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

    // Handle direct upload endpoint
    if (url.pathname.startsWith('/upload-direct/') && request.method === 'PUT') {
      try {
        const key = url.pathname.substring('/upload-direct/'.length);
        
        // Get the request body
        const body = await request.arrayBuffer();
        
        // Upload to R2 using the binding
        await env.R2_BUCKET.put(key, body, {
          httpMetadata: {
            contentType: request.headers.get('content-type') || 'image/jpeg',
          }
        });
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error uploading to R2:', error);
        return new Response(JSON.stringify({ error: 'Failed to upload to R2' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
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
        const signedUrl = await env.R2_BUCKET.createSignedUrl(key, {
          method: 'PUT',
          headers: { 'content-type': contentType || 'image/jpeg' },
          expiresIn: 1800,
        });

        return new Response(JSON.stringify({
          success: true,
          uploadUrl: signedUrl,
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

    return new Response('Not Found', { status: 404 });
  },
};
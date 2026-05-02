// src/index.ts
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (url.pathname === "/upload" && request.method === "POST") {
      try {
        const { sessionId, angle, contentType } = await request.json();
        const key = `sessions/${sessionId}/${angle}-${Date.now()}.jpg`;
        return new Response(JSON.stringify({
          success: true,
          uploadUrl: `https://colorgenius-r2-upload.shiny-sky-8891.workers.dev/proxy-upload/${key}`,
          publicUrl: `https://pub-bb99062a526e4db384e390a5bdd65455.r2.dev/${key}`,
          key
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    if (url.pathname.startsWith("/proxy-upload/") && request.method === "PUT") {
      try {
        const key = url.pathname.substring("/proxy-upload/".length);
        const body = await request.arrayBuffer();
        console.log(`Uploading to R2: key=${key}, size=${body.byteLength}`);
        console.log(`R2_BUCKET binding type: ${typeof env.R2_BUCKET}`);
        await env.R2_BUCKET.put(key, body, {
          httpMetadata: {
            contentType: request.headers.get("content-type") || "image/jpeg"
          }
        });
        console.log(`Successfully uploaded to R2: ${key}`);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (error) {
        console.error("Error uploading to R2:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    return new Response("Not Found", { status: 404 });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map

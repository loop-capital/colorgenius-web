export interface Env {
  R2_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'GET' && request.url.endsWith('/test')) {
      try {
        // Try to list objects in the bucket to verify binding works
        // Note: R2 binding doesn't have a list method, but we can try to put/get
        const testKey = `test-binding-${Date.now()}.txt`;
        await env.R2_BUCKET.put(testKey, 'test data', {
          httpMetadata: {
            contentType: 'text/plain',
          }
        });
        
        const retrieved = await env.R2_BUCKET.get(testKey);
        if (retrieved) {
          const content = await retrieved.text();
          await env.R2_BUCKET.delete(testKey); // cleanup
          return new Response(JSON.stringify({
            success: true,
            message: 'R2 binding works!',
            testContent: content
          }), { headers: { 'Content-Type': 'application/json' } });
        } else {
          return new Response(JSON.stringify({
            success: false,
            message: 'Failed to retrieve object from R2'
          }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          bindingType: typeof env.R2_BUCKET
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
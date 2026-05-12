// ColorGenius API - Cloudflare Worker
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  CACHE: KVNamespace;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Initialize Supabase
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    try {
      // Route: GET /api/shades - Get all shades with line/brand info
      if (path === '/api/shades' && request.method === 'GET') {
        const lineSlug = url.searchParams.get('line');
        const brandSlug = url.searchParams.get('brand');
        const level = url.searchParams.get('level');
        const tone = url.searchParams.get('tone');
        const search = url.searchParams.get('search');

        let query = supabase
          .from('shades')
          .select(`
            *,
            color_lines (
              name,
              slug,
              type,
              mixing_ratio,
              processing_time,
              gray_coverage,
              developers,
              activators,
              underlying_pigments,
              brands (name, slug)
            )
          `);

        if (lineSlug) query = query.eq('color_lines.slug', lineSlug);
        if (level) query = query.eq('level', parseInt(level));
        if (tone) query = query.ilike('tone', tone);
        if (search) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);

        const { data, error } = await query.order('level').order('code');

        if (error) throw error;
        return Response.json({ shades: data }, { headers: corsHeaders });
      }

      // Route: GET /api/lines - Get all color lines
      if (path === '/api/lines' && request.method === 'GET') {
        const { data, error } = await supabase
          .from('color_lines')
          .select('*, brands (name, slug)')
          .order('name');

        if (error) throw error;
        return Response.json({ lines: data }, { headers: corsHeaders });
      }

      // Route: GET /api/shades/:id - Get single shade with full technical data
      if (path.match(/^\/api\/shades\/[\w-]+$/) && request.method === 'GET') {
        const id = path.split('/').pop();
        const { data, error } = await supabase
          .from('shades')
          .select('*, color_lines (*, brands (name, slug))')
          .eq('id', id)
          .single();

        if (error) throw error;
        return Response.json({ shade: data }, { headers: corsHeaders });
      }

      // Route: POST /api/formulas - Create formula
      if (path === '/api/formulas' && request.method === 'POST') {
        const body = await request.json();
        const { data, error } = await supabase
          .from('formulas')
          .insert(body)
          .select()
          .single();

        if (error) throw error;
        return Response.json({ formula: data }, { status: 201, headers: corsHeaders });
      }

      // Route: GET /api/formulas - Get stylist's formulas
      if (path === '/api/formulas' && request.method === 'GET') {
        const stylistId = url.searchParams.get('stylist_id');
        const clientId = url.searchParams.get('client_id');

        let query = supabase.from('formulas').select('*, shades (*), clients (name)');
        if (stylistId) query = query.eq('stylist_id', stylistId);
        if (clientId) query = query.eq('client_id', clientId);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return Response.json({ formulas: data }, { headers: corsHeaders });
      }

      // Route: POST /api/services - Record completed service
      if (path === '/api/services' && request.method === 'POST') {
        const body = await request.json();
        const { data, error } = await supabase
          .from('services')
          .insert(body)
          .select()
          .single();

        if (error) throw error;
        return Response.json({ service: data }, { status: 201, headers: corsHeaders });
      }

      // Route: GET /api/brands
      if (path === '/api/brands' && request.method === 'GET') {
        const { data, error } = await supabase.from('brands').select('*').order('name');
        if (error) throw error;
        return Response.json({ brands: data }, { headers: corsHeaders });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (err: any) {
      return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
  },
};

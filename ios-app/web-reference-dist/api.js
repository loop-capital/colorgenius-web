// ColorGenius API Client
const API_BASE = window.location.hostname === 'localhost' 
  ? 'https://beuiayrnzbgvvqfgsenc.supabase.co/rest/v1'
  : 'https://beuiayrnzbgvvqfgsenc.supabase.co/rest/v1';

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldWlheXJuemJndnZxZmdzZW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTExOTAsImV4cCI6MjA5MzQyNzE5MH0.qzW29jlsPmd4SCZ_b_GIAXNeyzHu3n3wovY2ihE91SU';

const headers = {
  'apikey': API_KEY,
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

// Fetch shades with product line info
async function loadShades(filters = {}) {
  let query = 'select=*,product_lines(name,slug,color_type,mixing_ratio,developer_options,brands(name,slug))';
  
  if (filters.level) query += `&level=eq.${filters.level}`;
  if (filters.tone) query += `&primary_tone=ilike.${filters.tone}*`;
  if (filters.search) query += `&or=(shade_name.ilike.*${filters.search}*,shade_code.ilike.*${filters.search}*)`;
  
  try {
    const res = await fetch(`${API_BASE}/shades?${query}&is_active=eq.true&order=level,shade_code&limit=600`, { headers });
    const data = await res.json();
    return (data || []).map(s => ({
      id: s.id,
      brand: s.product_lines?.brands?.name || 'Unknown',
      line: s.product_lines?.name || '',
      lineSlug: s.product_lines?.slug || '',
      name: s.shade_code + ' ' + s.shade_name,
      code: s.shade_code,
      level: s.level,
      tone: (s.primary_tone || '').trim(),
      hex: rgbToHex(s.rgb_representation || [128,128,128]),
      mixing_ratio: s.product_lines?.mixing_ratio || '',
      developers: s.product_lines?.developer_options || [],
    }));
  } catch (err) {
    console.error('Failed to load shades:', err);
    return SHADES; // fallback to embedded
  }
}

function rgbToHex(rgb) {
  if (!rgb || rgb.length < 3) return '#888888';
  return '#' + rgb.map(c => Math.max(0,Math.min(255,c)).toString(16).padStart(2,'0')).join('');
}

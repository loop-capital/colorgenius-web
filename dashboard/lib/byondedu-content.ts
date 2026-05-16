export interface ByondEduContent {
  id: string;
  type: 'pro-tip' | 'micro-lesson' | 'course';
  title: string;
  brand?: { name: string; verified: boolean };
  creator: { name: string; avatar?: string };
  thumbnail?: string;
  videoUrl?: string;
  text?: string;
  duration?: number; // seconds
  relevanceScore: number;
  url: string;
}

export interface ContentQuery {
  brand?: string;
  service?: string;
  shades?: string[];
  hairType?: string;
  contentType?: 'pro-tip' | 'micro-lesson' | 'course';
  limit?: number;
}

/**
 * Fetch relevant educational content from ByondEdu.
 * Falls back to curated mock data if the API is unavailable.
 */
export async function fetchRelevantContent(
  query: ContentQuery
): Promise<ByondEduContent[]> {
  const url = new URL('https://byondedu.com/api/v1/content/relevant');

  if (query.brand) url.searchParams.set('brand', query.brand);
  if (query.service) url.searchParams.set('service', query.service);
  if (query.shades?.length) url.searchParams.set('shades', query.shades.join(','));
  if (query.hairType) url.searchParams.set('hairType', query.hairType);
  if (query.contentType) url.searchParams.set('contentType', query.contentType);
  if (query.limit) url.searchParams.set('limit', String(query.limit));

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      // Light timeout so the UI never hangs
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      console.warn('[ByondEdu] API returned', res.status, '- serving fallback data');
      return getMockContent(query);
    }

    const json = await res.json();
    const data = json.data ?? json;
    if (Array.isArray(data)) return data as ByondEduContent[];
    return getMockContent(query);
  } catch (err) {
    console.warn('[ByondEdu] Fetch failed:', err);
    return getMockContent(query);
  }
}

/* ------------------------------------------------------------------ */
/*  Mock / fallback data                                               */
/* ------------------------------------------------------------------ */

function getMockContent(query: ContentQuery): ByondEduContent[] {
  const brand = query.brand ?? 'generic';
  const isVerified = ['schwarzkopf', 'redken', 'wella', 'matrix', 'joico', 'paul mitchell'].includes(brand.toLowerCase());

  const all: ByondEduContent[] = [
    {
      id: 'mock-1',
      type: 'pro-tip',
      title: 'Gray Coverage: How to Avoid Dull Results',
      brand: { name: brand, verified: isVerified },
      creator: { name: 'Eiza Pleij' },
      text: 'When working with 50%+ gray, always bump your developer by one volume and extend processing time by 5 minutes for full saturation.',
      relevanceScore: 0.97,
      url: 'https://byondedu.com/tips/gray-coverage',
    },
    {
      id: 'mock-2',
      type: 'pro-tip',
      title: 'Balayage Sectioning for Maximum Lift',
      brand: { name: brand, verified: isVerified },
      creator: { name: 'Marcus Reid' },
      text: 'Keep sub-sections no wider than 1 inch. Wider sections = uneven lift and muddied tones.',
      relevanceScore: 0.94,
      url: 'https://byondedu.com/tips/balayage-sectioning',
    },
    {
      id: 'mock-3',
      type: 'micro-lesson',
      title: 'Color Correction: Banding & Build-Up',
      brand: { name: brand, verified: isVerified },
      creator: { name: 'Sarah Lin, Color Director' },
      thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=320&q=80',
      duration: 420,
      relevanceScore: 0.91,
      url: 'https://byondedu.com/lessons/color-correction-banding',
    },
    {
      id: 'mock-4',
      type: 'micro-lesson',
      title: 'Understanding Underlying Pigment at Level 6',
      brand: { name: brand, verified: isVerified },
      creator: { name: 'Dana Cole' },
      thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=320&q=80',
      duration: 315,
      relevanceScore: 0.89,
      url: 'https://byondedu.com/lessons/underlying-pigment-l6',
    },
    {
      id: 'mock-5',
      type: 'course',
      title: 'Mastering Developer Choice',
      brand: { name: brand, verified: isVerified },
      creator: { name: 'ByondEdu Pro Team', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80' },
      thumbnail: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=320&q=80',
      duration: 3600,
      relevanceScore: 0.85,
      url: 'https://byondedu.com/courses/mastering-developer',
    },
    {
      id: 'mock-6',
      type: 'pro-tip',
      title: 'Porosity Test: The Water-Spray Method',
      brand: { name: brand, verified: isVerified },
      creator: { name: 'Jasmine Ortiz' },
      text: 'Spray a small section with water. If it beads and rolls off, porosity is low. If it absorbs instantly, porosity is high.',
      relevanceScore: 0.82,
      url: 'https://byondedu.com/tips/porosity-test',
    },
  ];

  // Filter by contentType if requested
  let filtered = query.contentType ? all.filter(c => c.type === query.contentType) : all;

  // Boost relevance for matching brand (mock heuristic)
  filtered = filtered.map(c => ({
    ...c,
    relevanceScore: query.brand && c.brand?.name.toLowerCase() === query.brand.toLowerCase()
      ? Math.min(1, c.relevanceScore + 0.05)
      : c.relevanceScore,
  }));

  // Sort by relevance desc
  filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return filtered.slice(0, query.limit ?? 3);
}

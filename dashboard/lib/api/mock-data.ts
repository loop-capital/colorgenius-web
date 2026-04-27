/**
 * ColorGenius API Mock Data
 * In-memory storage for community, marketplace, and gallery endpoints
 */

import { CommunityPost, VoteRecord, Template, Purchase, GalleryItem, TrendingColor, SeasonalCollection, StylistPortfolio } from './types';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function now(): string {
  return new Date().toISOString();
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ─── Mock Community Posts ───────────────────────────────────────────────────────

export let communityPosts: CommunityPost[] = [
  {
    id: uuid(),
    author_id: 'user-1',
    author_name: 'Eiza Martinez',
    author_avatar: 'https://ui-avatars.com/api/?name=Eiza+Martinez&background=d4a574&color=fff',
    formulation_id: 'form-1',
    formulation_snapshot: {
      brand: 'Wella',
      line: 'Koleston Perfect ME+',
      shade_code: '6/73',
      shade_name: 'Dark Blonde Golden',
      level: 6,
      tone: 'golden',
      developer_volume: 20,
      processing_time: 35,
      application: 'balayage',
    },
    before_photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    after_photo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    caption: 'Beautiful caramel balayage on previously colored hair. Processed for 35 mins with 20 vol.',
    hair_description: 'Previously colored, normal porosity, 15% gray',
    tags: ['balayage', 'caramel', 'warm', 'wella'],
    likes: 142,
    saves: 38,
    score: 154,
    is_public: true,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
  },
  {
    id: uuid(),
    author_id: 'user-2',
    author_name: 'Jaden Cole',
    author_avatar: 'https://ui-avatars.com/api/?name=Jaden+Cole&background=7c9cb6&color=fff',
    formulation_id: 'form-2',
    formulation_snapshot: {
      brand: 'Schwarzkopf',
      line: 'Igora Royal',
      shade_code: '5-1',
      shade_name: 'Light Brown Ash',
      level: 5,
      tone: 'ash',
      developer_volume: 20,
      processing_time: 40,
      application: 'all_over',
    },
    before_photo: 'https://images.unsplash.com/photo-1503951914875-bfcc4c1cf8c3?w=400',
    after_photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    caption: 'Full gray coverage using Igora Royal 5-1 with 5-0 additive. 60% gray coverage achieved.',
    hair_description: 'Virgin, low porosity, 60% gray',
    tags: ['gray-coverage', 'ash', 'natural', 'schwarzkopf'],
    likes: 98,
    saves: 45,
    score: 121,
    is_public: true,
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
  },
  {
    id: uuid(),
    author_id: 'user-3',
    author_name: 'Maya Sterling',
    author_avatar: 'https://ui-avatars.com/api/?name=Maya+Sterling&background=b67c9c&color=fff',
    formulation_id: 'form-3',
    formulation_snapshot: {
      brand: 'Pulp Riot',
      line: 'FACTION8',
      shade_code: '6-6',
      shade_name: 'Copper',
      level: 6,
      tone: 'copper',
      developer_volume: 10,
      processing_time: 30,
      application: 'foilyage',
    },
    after_photo: 'https://images.unsplash.com/photo-1519699047748-de8e4a5e4dc6?w=400',
    caption: 'Bold copper transformation using Pulp Riot FACTION8! High porosity hair soaked this up beautifully.',
    hair_description: 'Previously colored, high porosity, 0% gray',
    tags: ['copper', 'bold', 'pulp-riot', 'foilyage'],
    likes: 267,
    saves: 89,
    score: 340,
    is_public: true,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
  {
    id: uuid(),
    author_id: 'user-1',
    author_name: 'Eiza Martinez',
    author_avatar: 'https://ui-avatars.com/api/?name=Eiza+Martinez&background=d4a574&color=fff',
    formulation_id: 'form-4',
    formulation_snapshot: {
      brand: 'Redken',
      line: 'Shades EQ',
      shade_code: '09V',
      shade_name: 'Platinum Ice',
      level: 9,
      tone: 'violet',
      developer_volume: 20,
      processing_time: 20,
      application: 'gloss',
    },
    after_photo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    caption: 'Platinum gloss refresh using Shades EQ 09V. Perfect toning treatment between lightening sessions.',
    hair_description: 'Previously lightened, high porosity, 0% gray',
    tags: ['platinum', 'gloss', 'redken', 'toning'],
    likes: 203,
    saves: 67,
    score: 268,
    is_public: true,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
  },
  {
    id: uuid(),
    author_id: 'user-4',
    author_name: 'Riley Park',
    author_avatar: 'https://ui-avatars.com/api/?name=Riley+Park&background=9cb67c&color=fff',
    formulation_id: 'form-5',
    formulation_snapshot: {
      brand: 'Matrix',
      line: 'SoColor',
      shade_code: '4RV',
      shade_name: 'Dark Brown Red Violet',
      level: 4,
      tone: 'red-violet',
      developer_volume: 20,
      processing_time: 35,
      application: 'all_over',
    },
    before_photo: 'https://images.unsplash.com/photo-1503951914875-bfcc4c1cf8c3?w=400',
    after_photo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    caption: 'Rich red violet on level 4 — perfect for fall! Matrix SoColor delivers amazing vibrancy.',
    hair_description: 'Previously colored, normal porosity, 10% gray',
    tags: ['red-violet', 'fall', 'matrix', 'vibrant'],
    likes: 178,
    saves: 52,
    score: 230,
    is_public: true,
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
  },
];

// ─── Mock Votes ────────────────────────────────────────────────────────────────

export let votes: VoteRecord[] = [];

// ─── Mock Templates ─────────────────────────────────────────────────────────────

export let templates: Template[] = [
  {
    id: 'tmpl-1',
    creator_id: 'user-1',
    creator_name: 'Eiza Martinez',
    community_post_id: communityPosts[0].id,
    title: 'Caramel Balayage Master Template',
    description: 'Complete formulation template for warm caramel balayage on previously colored hair. Includes timing, sectioning, and aftercare.',
    category: 'Balayage',
    tags: ['balayage', 'caramel', 'warm', 'wella', 'previously-colored'],
    price_cents: 1499,
    rating: 48, // out of 50 (4.8 stars)
    review_count: 23,
    purchase_count: 45,
    adaptation_params: {
      base_level_range: [5, 7],
      porosity_adjustments: { low: 'add 5 min', normal: 'standard', high: 'reduce 5 min' },
      developer_options: [20, 30],
      sectioning_guide: true,
    },
    is_active: true,
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
  },
  {
    id: 'tmpl-2',
    creator_id: 'user-2',
    creator_name: 'Jaden Cole',
    community_post_id: communityPosts[1].id,
    title: 'Gray Coverage Perfection System',
    description: 'Proven system for 50%+ gray coverage using Schwarzkopf Igora Royal. Covers formulation, application order, and processing.',
    category: 'Gray Coverage',
    tags: ['gray-coverage', 'ash', 'schwarzkopf', 'permanent'],
    price_cents: 1999,
    rating: 50, // 5.0 stars
    review_count: 31,
    purchase_count: 78,
    adaptation_params: {
      gray_percent_range: [30, 100],
      developer_options: [20, 30],
      additive_guide: true,
      timing_calculator: true,
    },
    is_active: true,
    created_at: daysAgo(15),
    updated_at: daysAgo(15),
  },
  {
    id: 'tmpl-3',
    creator_id: 'user-3',
    creator_name: 'Maya Sterling',
    community_post_id: communityPosts[2].id,
    title: 'Copper Transformation Blueprint',
    description: 'Bold copper formulations using Pulp Riot. From consultation to aftercare — everything you need for vibrant copper results.',
    category: 'Fashion Color',
    tags: ['copper', 'pulp-riot', 'bold', 'fashion-color'],
    price_cents: 2499,
    rating: 47,
    review_count: 19,
    purchase_count: 34,
    adaptation_params: {
      base_level_range: [5, 7],
      pre_lightening_guide: true,
      maintenance_schedule: true,
      product_list: true,
    },
    is_active: true,
    created_at: daysAgo(7),
    updated_at: daysAgo(7),
  },
  {
    id: 'tmpl-4',
    creator_id: 'user-1',
    creator_name: 'Eiza Martinez',
    community_post_id: communityPosts[3].id,
    title: 'Platinum Toning Protocol',
    description: 'Redken Shades EQ toning protocols for platinum maintenance. Multiple formulations for different underlying pigments.',
    category: 'Toning',
    tags: ['platinum', 'toning', 'redken', 'maintenance'],
    price_cents: 999,
    rating: 46,
    review_count: 42,
    purchase_count: 89,
    adaptation_params: {
      underlying_pigment_options: ['yellow', 'gold', 'orange', 'brassy'],
      processing_time_range: [15, 25],
      dilution_guide: true,
    },
    is_active: true,
    created_at: daysAgo(20),
    updated_at: daysAgo(20),
  },
  {
    id: 'tmpl-5',
    creator_id: 'user-4',
    creator_name: 'Riley Park',
    community_post_id: communityPosts[4].id,
    title: 'Fall Red-Violet Formula Pack',
    description: 'Three red-violet formulations for different base levels and gray percentages. Perfect autumn transformation toolkit.',
    category: 'Fashion Color',
    tags: ['red-violet', 'fall', 'matrix', 'vibrant'],
    price_cents: 1799,
    rating: 45,
    review_count: 15,
    purchase_count: 28,
    adaptation_params: {
      base_level_range: [3, 6],
      gray_adjustments: true,
      seasonal_variations: ['fall', 'winter'],
    },
    is_active: true,
    created_at: daysAgo(12),
    updated_at: daysAgo(12),
  },
];

// ─── Mock Purchases ─────────────────────────────────────────────────────────────

export let purchases: Purchase[] = [
  {
    id: 'pur-1',
    buyer_id: 'buyer-1',
    template_id: 'tmpl-1',
    price_paid_cents: 1499,
    creator_earnings_cents: 1200,
    platform_fee_cents: 299,
    status: 'completed',
    created_at: daysAgo(3),
  },
  {
    id: 'pur-2',
    buyer_id: 'buyer-2',
    template_id: 'tmpl-1',
    price_paid_cents: 1499,
    creator_earnings_cents: 1200,
    platform_fee_cents: 299,
    status: 'completed',
    created_at: daysAgo(5),
  },
  {
    id: 'pur-3',
    buyer_id: 'buyer-3',
    template_id: 'tmpl-2',
    price_paid_cents: 1999,
    creator_earnings_cents: 1600,
    platform_fee_cents: 399,
    status: 'completed',
    created_at: daysAgo(2),
  },
  {
    id: 'pur-4',
    buyer_id: 'buyer-4',
    template_id: 'tmpl-3',
    price_paid_cents: 2499,
    creator_earnings_cents: 2000,
    platform_fee_cents: 499,
    status: 'completed',
    created_at: daysAgo(1),
  },
  {
    id: 'pur-5',
    buyer_id: 'buyer-1',
    template_id: 'tmpl-4',
    price_paid_cents: 999,
    creator_earnings_cents: 800,
    platform_fee_cents: 199,
    status: 'completed',
    created_at: daysAgo(7),
  },
  {
    id: 'pur-6',
    buyer_id: 'buyer-5',
    template_id: 'tmpl-2',
    price_paid_cents: 1999,
    creator_earnings_cents: 1600,
    platform_fee_cents: 399,
    status: 'completed',
    created_at: daysAgo(4),
  },
];

// ─── Mock Gallery Items ─────────────────────────────────────────────────────────

export const galleryItems: GalleryItem[] = communityPosts.map((post, i) => ({
  id: `gallery-${i + 1}`,
  post_id: post.id,
  stylist_id: post.author_id,
  stylist_name: post.author_name,
  stylist_avatar: post.author_avatar,
  formulation_snapshot: {
    brand: post.formulation_snapshot.brand,
    line: post.formulation_snapshot.line,
    shade_code: post.formulation_snapshot.shade_code,
    shade_name: post.formulation_snapshot.shade_name,
    level: post.formulation_snapshot.level,
    tone: post.formulation_snapshot.tone,
    color_hex: ['#D4A574', '#7C9CB6', '#B67C4A', '#C5B9CD', '#9C6B7C'][i % 5],
    color_family: ['warm-brown', 'cool-blonde', 'copper', 'platinum', 'red-violet'][i % 5],
  },
  after_photo: post.after_photo || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
  before_photo: post.before_photo,
  caption: post.caption,
  tags: post.tags,
  likes: post.likes,
  season: ['spring', 'summer', 'fall', 'winter'][i % 4],
  created_at: post.created_at,
}));

// ─── Mock Trending Colors ──────────────────────────────────────────────────────

export const trendingColors: TrendingColor[] = [
  {
    id: 'trend-1',
    shade_name: 'Copper',
    shade_code: '6-6',
    color_hex: '#B67C4A',
    color_family: 'copper',
    brand: 'Pulp Riot',
    line: 'FACTION8',
    level: 6,
    tone: 'copper',
    post_count: 342,
    like_count: 2847,
    trend_score: 987,
    sample_photos: [
      'https://images.unsplash.com/photo-1519699047748-de8e4a5e4dc6?w=400',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    ],
  },
  {
    id: 'trend-2',
    shade_name: 'Platinum Ice',
    shade_code: '09V',
    color_hex: '#C5B9CD',
    color_family: 'platinum',
    brand: 'Redken',
    line: 'Shades EQ',
    level: 9,
    tone: 'violet',
    post_count: 278,
    like_count: 2156,
    trend_score: 812,
    sample_photos: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    ],
  },
  {
    id: 'trend-3',
    shade_name: 'Dark Blonde Golden',
    shade_code: '6/73',
    color_hex: '#D4A574',
    color_family: 'warm-brown',
    brand: 'Wella',
    line: 'Koleston Perfect ME+',
    level: 6,
    tone: 'golden',
    post_count: 256,
    like_count: 1893,
    trend_score: 734,
    sample_photos: [
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
      'https://images.unsplash.com/photo-1503951914875-bfcc4c1cf8c3?w=400',
    ],
  },
  {
    id: 'trend-4',
    shade_name: 'Light Brown Ash',
    shade_code: '5-1',
    color_hex: '#7C9CB6',
    color_family: 'ash-brown',
    brand: 'Schwarzkopf',
    line: 'Igora Royal',
    level: 5,
    tone: 'ash',
    post_count: 198,
    like_count: 1456,
    trend_score: 612,
    sample_photos: [
      'https://images.unsplash.com/photo-1503951914875-bfcc4c1cf8c3?w=400',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    ],
  },
  {
    id: 'trend-5',
    shade_name: 'Dark Brown Red Violet',
    shade_code: '4RV',
    color_hex: '#9C6B7C',
    color_family: 'red-violet',
    brand: 'Matrix',
    line: 'SoColor',
    level: 4,
    tone: 'red-violet',
    post_count: 189,
    like_count: 1324,
    trend_score: 578,
    sample_photos: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
      'https://images.unsplash.com/photo-1519699047748-de8e4a5e4dc6?w=400',
    ],
  },
  {
    id: 'trend-6',
    shade_name: 'Rose Gold',
    shade_code: '9-89',
    color_hex: '#E8C4C4',
    color_family: 'rose-gold',
    brand: 'Schwarzkopf',
    line: 'BlondMe',
    level: 9,
    tone: 'rose',
    post_count: 167,
    like_count: 1234,
    trend_score: 523,
    sample_photos: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    ],
  },
];

// ─── Mock Seasonal Collections ──────────────────────────────────────────────────

export const seasonalCollections: SeasonalCollection[] = [
  {
    season: 'spring',
    title: 'Spring Awakening 2026',
    description: 'Fresh, light tones inspired by blooming gardens and golden sunlight.',
    colors: [
      { id: 'sc-spring-1', shade_name: 'Honey Blonde', shade_code: '8/03', color_hex: '#E8D4A8', color_family: 'blonde', description: 'Warm honey tones for a sun-kissed look', sample_photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400' },
      { id: 'sc-spring-2', shade_name: 'Rose Gold', shade_code: '9-89', color_hex: '#E8C4C4', color_family: 'rose-gold', description: 'Soft rose gold for a romantic spring vibe', sample_photo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400' },
      { id: 'sc-spring-3', shade_name: 'Butterscotch', shade_code: '7/43', color_hex: '#D4A87C', color_family: 'warm-brown', description: 'Rich butterscotch warmth', sample_photo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400' },
    ],
    created_at: daysAgo(30),
  },
  {
    season: 'summer',
    title: 'Summer Heat 2026',
    description: 'Bold, vibrant colors that capture the energy of summer.',
    colors: [
      { id: 'sc-summer-1', shade_name: 'Copper', shade_code: '6-6', color_hex: '#B67C4A', color_family: 'copper', description: 'Bold copper for summer sunsets', sample_photo: 'https://images.unsplash.com/photo-1519699047748-de8e4a5e4dc6?w=400' },
      { id: 'sc-summer-2', shade_name: 'Beige Blonde', shade_code: '9/13', color_hex: '#D4C4A8', color_family: 'beige', description: 'Natural beige blonde for beachy vibes', sample_photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400' },
      { id: 'sc-summer-3', shade_name: 'Golden Auburn', shade_code: '6/43', color_hex: '#B68C5A', color_family: 'auburn', description: 'Warm golden auburn depth', sample_photo: 'https://images.unsplash.com/photo-1503951914875-bfcc4c1cf8c3?w=400' },
    ],
    created_at: daysAgo(15),
  },
  {
    season: 'fall',
    title: 'Autumn Ember 2026',
    description: 'Rich, warm tones that mirror the changing leaves.',
    colors: [
      { id: 'sc-fall-1', shade_name: 'Red Violet', shade_code: '4RV', color_hex: '#9C6B7C', color_family: 'red-violet', description: 'Deep red violet for fall drama', sample_photo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400' },
      { id: 'sc-fall-2', shade_name: 'Chocolate Brown', shade_code: '4/0', color_hex: '#5C4033', color_family: 'brown', description: 'Rich chocolate warmth', sample_photo: 'https://images.unsplash.com/photo-1503951914875-bfcc4c1cf8c3?w=400' },
      { id: 'sc-fall-3', shade_name: 'Cinnamon', shade_code: '5/43', color_hex: '#A87C5A', color_family: 'cinnamon', description: 'Spicy cinnamon warmth', sample_photo: 'https://images.unsplash.com/photo-1519699047748-de8e4a5e4dc6?w=400' },
    ],
    created_at: daysAgo(5),
  },
  {
    season: 'winter',
    title: 'Winter Frost 2026',
    description: 'Cool, icy tones for the winter season.',
    colors: [
      { id: 'sc-winter-1', shade_name: 'Platinum Ice', shade_code: '09V', color_hex: '#C5B9CD', color_family: 'platinum', description: 'Icy platinum perfection', sample_photo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400' },
      { id: 'sc-winter-2', shade_name: 'Ash Brown', shade_code: '5-1', color_hex: '#7C9CB6', color_family: 'ash-brown', description: 'Cool ash brown sophistication', sample_photo: 'https://images.unsplash.com/photo-1503951914875-bfcc4c1cf8c3?w=400' },
      { id: 'sc-winter-3', shade_name: 'Silver', shade_code: '10/81', color_hex: '#C0C0C0', color_family: 'silver', description: 'Metallic silver statement', sample_photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400' },
    ],
    created_at: daysAgo(1),
  },
];

// ─── Mock Stylist Portfolios ────────────────────────────────────────────────────

export const stylistPortfolios: StylistPortfolio[] = [
  {
    stylist_id: 'user-1',
    stylist_name: 'Eiza Martinez',
    stylist_avatar: 'https://ui-avatars.com/api/?name=Eiza+Martinez&background=d4a574&color=fff',
    stylist_bio: 'Master colorist with 12 years experience. Specializing in balayage and dimensional color. Based in Columbus, OH.',
    stylist_location: 'Columbus, OH',
    stylist_specialty: 'Balayage Specialist',
    portfolio_count: 47,
    total_likes: 3847,
    follower_count: 1256,
    recent_work: galleryItems.filter(g => g.stylist_id === 'user-1'),
    specialties: ['Balayage', 'Dimensional Color', 'Toning', 'Blonding'],
  },
  {
    stylist_id: 'user-2',
    stylist_name: 'Jaden Cole',
    stylist_avatar: 'https://ui-avatars.com/api/?name=Jaden+Cole&background=7c9cb6&color=fff',
    stylist_bio: 'Gray coverage expert and precision colorist. 8 years transforming clients with confidence.',
    stylist_location: 'Columbus, OH',
    stylist_specialty: 'Gray Coverage Expert',
    portfolio_count: 32,
    total_likes: 2156,
    follower_count: 876,
    recent_work: galleryItems.filter(g => g.stylist_id === 'user-2'),
    specialties: ['Gray Coverage', 'Precision Color', 'Natural Tones', 'Men\'s Color'],
  },
  {
    stylist_id: 'user-3',
    stylist_name: 'Maya Sterling',
    stylist_avatar: 'https://ui-avatars.com/api/?name=Maya+Sterling&background=b67c9c&color=fff',
    stylist_bio: 'Fashion color visionary. Pushing boundaries with bold, creative color transformations.',
    stylist_location: 'Columbus, OH',
    stylist_specialty: 'Fashion Color Artist',
    portfolio_count: 56,
    total_likes: 4523,
    follower_count: 1890,
    recent_work: galleryItems.filter(g => g.stylist_id === 'user-3'),
    specialties: ['Fashion Color', 'Creative Color', 'Vivids', 'Color Correction'],
  },
  {
    stylist_id: 'user-4',
    stylist_name: 'Riley Park',
    stylist_avatar: 'https://ui-avatars.com/api/?name=Riley+Park&background=9cb67c&color=fff',
    stylist_bio: 'Seasonal color specialist. Creating trending looks that inspire clients year-round.',
    stylist_location: 'Columbus, OH',
    stylist_specialty: 'Trending Color Specialist',
    portfolio_count: 38,
    total_likes: 2890,
    follower_count: 1034,
    recent_work: galleryItems.filter(g => g.stylist_id === 'user-4'),
    specialties: ['Trending Colors', 'Red-Violet', 'Seasonal Collections', 'Vibrant Tones'],
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function generateId(): string {
  return uuid();
}

export function calculateScore(post: CommunityPost): number {
  // Simple scoring algorithm: likes + saves * 2 + recency boost
  const ageHours = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  const recencyBoost = Math.max(0, 100 - ageHours);
  return Math.round(post.likes + post.saves * 2 + recencyBoost);
}

export function updatePostScore(postId: string): void {
  const post = communityPosts.find(p => p.id === postId);
  if (post) {
    post.score = calculateScore(post);
  }
}

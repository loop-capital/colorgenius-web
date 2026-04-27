/**
 * ColorGenius API Shared Types
 * Standard response format and domain types
 */

// ─── Standard API Response ────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    cursor?: string;
    total?: number;
  };
}

// ─── Community Types ──────────────────────────────────────────────────────────

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  formulation_id: string;
  formulation_snapshot: {
    brand: string;
    line: string;
    shade_code: string;
    shade_name: string;
    level: number;
    tone: string;
    developer_volume: number;
    processing_time: number;
    application: string;
  };
  before_photo?: string;
  after_photo?: string;
  caption?: string;
  hair_description?: string;
  tags: string[];
  likes: number;
  saves: number;
  score: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoteRecord {
  post_id: string;
  user_id: string;
  action: 'like' | 'save' | 'unlike' | 'unsave';
  created_at: string;
}

// ─── Marketplace Types ──────────────────────────────────────────────────────────

export interface Template {
  id: string;
  creator_id: string;
  creator_name: string;
  community_post_id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  price_cents: number;
  rating: number;
  review_count: number;
  purchase_count: number;
  adaptation_params: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  buyer_id: string;
  template_id: string;
  price_paid_cents: number;
  creator_earnings_cents: number;
  platform_fee_cents: number;
  status: 'pending' | 'completed' | 'refunded';
  created_at: string;
}

export interface CreatorEarnings {
  creator_id: string;
  total_sales: number;
  total_earnings_cents: number;
  pending_payout_cents: number;
  templates_count: number;
  top_templates: Array<{
    template_id: string;
    title: string;
    sales: number;
    earnings_cents: number;
  }>;
}

// ─── Gallery Types ──────────────────────────────────────────────────────────────

export interface GalleryItem {
  id: string;
  post_id: string;
  stylist_id: string;
  stylist_name: string;
  stylist_avatar?: string;
  stylist_bio?: string;
  stylist_location?: string;
  formulation_snapshot: {
    brand: string;
    line: string;
    shade_code: string;
    shade_name: string;
    level: number;
    tone: string;
    color_hex: string;
    color_family: string;
  };
  after_photo: string;
  before_photo?: string;
  caption?: string;
  tags: string[];
  likes: number;
  season?: string;
  created_at: string;
}

export interface TrendingColor {
  id: string;
  shade_name: string;
  shade_code: string;
  color_hex: string;
  color_family: string;
  brand: string;
  line: string;
  level: number;
  tone: string;
  post_count: number;
  like_count: number;
  trend_score: number;
  sample_photos: string[];
}

export interface SeasonalCollection {
  season: string;
  title: string;
  description: string;
  colors: Array<{
    id: string;
    shade_name: string;
    shade_code: string;
    color_hex: string;
    color_family: string;
    description: string;
    sample_photo?: string;
  }>;
  created_at: string;
}

export interface StylistPortfolio {
  stylist_id: string;
  stylist_name: string;
  stylist_avatar?: string;
  stylist_bio?: string;
  stylist_location?: string;
  stylist_specialty?: string;
  portfolio_count: number;
  total_likes: number;
  follower_count: number;
  recent_work: GalleryItem[];
  specialties: string[];
}

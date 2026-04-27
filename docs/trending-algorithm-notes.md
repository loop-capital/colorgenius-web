# Trending Algorithm Notes — ColorGenius Community + Gallery

## Overview

The trending algorithm computes a "hotness score" for community posts and marketplace templates. It balances engagement velocity, content quality, recency decay, and editorial signals. Two feeds use variants of this algorithm:

1. **Community Trending** (`/api/community/trending`) — Stylist-facing
2. **Gallery Trending** (`/api/gallery/trending`) — Consumer-facing (subset of community)
3. **Marketplace Trending** (`/api/marketplace/browse?sort=popular`) — Template ranking

---

## Core Scoring Formula

```
Score = (Engagement_Velocity × Quality_Multiplier) / Recency_Decay + Editorial_Boost
```

### 1. Engagement Velocity (0–100)

Measures how fast a post is gaining interaction relative to its age.

```
engagement_velocity = (
  likes_weight    × likes_count    +
  saves_weight    × saves_count    +
  comments_weight × comments_count +
  share_weight    × share_count    +  // future: external shares
  click_weight    × profile_clicks   // future: "Book on UpLook" clicks
) / hours_since_posted
```

**Default weights:**

| Action | Weight | Rationale |
|--------|--------|-----------|
| Like | 1.0 | Low friction, low signal |
| Save | 3.0 | Higher intent — consumer wants to reference later |
| Comment | 2.5 | Conversation starter |
| Share (future) | 5.0 | Viral distribution |
| Profile click / "Book on UpLook" (future) | 4.0 | Strongest conversion signal |

**For marketplace templates**, add:

```
template_engagement = purchases_weight × sales_count + review_weight × review_count
```

| Action | Weight |
|--------|--------|
| Purchase | 10.0 |
| Review | 4.0 |
| Rating ≥ 4 | ×1.2 multiplier on review score |

### 2. Quality Multiplier (0.5–2.0)

Penalizes low-quality content, rewards high-quality posts.

```
quality_multiplier = base(1.0)
  + photo_quality_bonus     // 0–0.3: AI-detected photo clarity, lighting
  + complete_profile_bonus    // 0–0.2: Stylist has bio, salon, verified
  + formulation_bonus         // 0–0.3: Linked to actual formulation with confidence ≥ 0.85
  + educator_bonus            // 0–0.2: ByondEdu verified educator
  - low_engagement_penalty    // −0.3: < 3 interactions in first 24h
  - report_penalty            // −0.5: Any moderation flags
```

**Photo quality detection (future):**
- Blur detection (Laplacian variance)
- Lighting balance (histogram analysis)
- Face/hair detection confidence
- Before/after pair completeness

### 3. Recency Decay (Hours Since Posted)

Prevents old posts from dominating. Uses exponential decay.

```
recency_decay = e^(hours_since_posted / half_life)
```

**Half-life per feed:**

| Feed | Half-life | Effect |
|------|-----------|--------|
| Trending (24h) | 6 hours | Very fresh content wins |
| Trending (7d) | 24 hours | Weekly viral window |
| Trending (30d) | 72 hours | Monthly archive view |
| Seasonal | ∞ (no decay) | Manually curated |
| Editor's Pick | ∞ (no decay) | Editorial control |

### 4. Editorial Boost (+0–50 points)

Human curation overrides algorithm for featured content.

```
editorial_boost = 
  + editor_pick_bonus      // +25, manually selected by ByondEdu/ColorGenius team
  + seasonal_featured      // +20, pinned to seasonal feed
  + new_creator_boost      // +15, first post from new verified stylist
  + diversity_boost        // +10, underrepresented technique/color (prevents filter bubble)
```

---

## Trend Score Update Schedule

| Table | Update Frequency | Trigger |
|-------|-----------------|---------|
| `community_post.trend_score` | Every 15 minutes | Background job (Redis queue) |
| `trending_feed` | Every 30 minutes | Regenerate top 100 per feed type |
| `gallery_post.featured_rank` | On editorial action | Manual admin trigger |

### Background Job: Trend Score Recalculation

```typescript
// jobs/recalculate-trend-scores.ts

export async function recalculateTrendScores() {
  const posts = await prisma.communityPost.findMany({
    where: {
      moderation_status: 'approved',
      is_public: true,
      created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    },
    include: {
      stylist: true,
      formulation: true,
      _count: { likes: true, saves: true, comments: true }
    }
  });

  const scored = posts.map(post => ({
    id: post.id,
    score: computeTrendScore(post)
  }));

  // Batch update
  await prisma.$transaction(
    scored.map(({ id, score }) =>
      prisma.communityPost.update({
        where: { id },
        data: { trend_score: score }
      })
    )
  );

  // Update TrendingFeed table
  await regenerateTrendingFeeds(scored);
}

function computeTrendScore(post: CommunityPostWithRelations): number {
  const hoursSince = (Date.now() - post.created_at.getTime()) / 3600000;
  
  const engagement = (
    1.0 * post.likes_count +
    3.0 * post.saves_count +
    2.5 * post.comments_count
  ) / Math.max(hoursSince, 0.5); // Minimum 0.5h to prevent infinity

  const quality = computeQualityMultiplier(post);
  const decay = Math.exp(hoursSince / 6); // 6h half-life for trending
  const editorial = post.is_featured ? 25 : 0;

  return (engagement * quality) / decay + editorial;
}
```

---

## Feed-Specific Variants

### Community Trending (`/api/community/trending`)

- Audience: Stylists (authenticated)
- Content: All approved community posts
- Sort: `trend_score DESC`
- Filter: `moderation_status = 'approved' AND is_public = true`
- Boost: Posts with high-confidence formulations (+0.2 quality)

### Gallery Trending (`/api/gallery/trending`)

- Audience: Consumers (anonymous)
- Content: Subset of community posts approved for gallery
- Sort: `trend_score DESC`
- Filter: `moderation_status = 'approved' AND gallery_post.is_featured = true`
- Extra: Only posts with both before AND after photos
- Extra: Stylist must have `gallery_approved = true`

### Marketplace Popular (`/api/marketplace/browse?sort=popular`)

- Audience: Stylists buying templates
- Content: Approved marketplace templates
- Sort: `sales_count DESC, review_count DESC, avg_rating DESC`
- Variant score:
```
template_score = (sales_count × 10 + review_count × 4 + avg_rating × 20) / days_since_listed
```

### Seasonal Collections (`/api/gallery/seasonal`)

- Manually curated by ByondEdu editorial team
- No algorithmic scoring — purely editorial
- Updated: Beginning of each season (March 1, June 1, September 1, December 1)
- Selection criteria:
  1. Color matches seasonal palette (warm for spring/fall, cool for summer, rich for winter)
  2. Before/after shows dramatic but achievable transformation
  3. Stylist has UpLook profile linked
  4. Post has > 10 community likes

### Editor's Pick (`feed_type = 'editors_pick'`)

- Hand-selected by ColorGenius team
- Bypasses algorithm entirely
- Fixed rank position for featured period
- Maximum 10 picks at a time

---

## Anti-Gaming Measures

| Risk | Mitigation |
|------|-----------|
| Like-botting | Rate limit: max 1 like/5 sec per IP fingerprint. Require account age > 7 days. |
| Self-promotion spam | Max 3 posts/day per stylist. Auto-flag posts with same photo hash. |
| Purchase ring fraud | Require verified Stripe payment. Min purchase price: 500¢. Flag same-card multiple purchases. |
| Review bombing | Only verified purchasers can review. Review cooldown: 7 days after purchase. |
| Engagement farming | Weight saves/comments higher than likes. Track session duration — bots have 0 dwell time. |

---

## Performance Considerations

### Materialized Trend Scores

- `community_post.trend_score` is materialized (stored column), not computed on read
- Recalculated every 15 minutes by background worker
- Read query: `SELECT ... ORDER BY trend_score DESC LIMIT 50 OFFSET ?`

### Indexing

```sql
-- Primary trending query index
CREATE INDEX idx_community_post_trending 
ON "CommunityPost"(trend_score DESC, created_at DESC)
WHERE moderation_status = 'approved' AND is_public = true;

-- Gallery feed index (joins GalleryPost)
CREATE INDEX idx_gallery_post_featured 
ON "GalleryPost"(featured_rank, created_at DESC)
WHERE is_featured = true;

-- Marketplace popular
CREATE INDEX idx_marketplace_template_popular 
ON "MarketplaceTemplate"(sales_count DESC, avg_rating DESC, created_at DESC)
WHERE status = 'approved';
```

### Caching

```
Redis keys:
- trending:community:24h → TTL 15 min
- trending:gallery:7d → TTL 30 min
- trending:marketplace:popular → TTL 60 min
- seasonal:current → TTL 24 hours (refreshes seasonally)
```

---

## Future Enhancements

1. **ML-based photo quality scoring** — Replace heuristics with a lightweight model that scores before/after pair quality
2. **Personalized feeds** — "For You" feed based on stylist's past formulations, liked posts, purchased templates
3. **Geographic weighting** — Boost posts from stylists in same region (for consumer gallery → local booking intent)
4. **A/B testing framework** — Test different weight combinations and measure "Book on UpLook" CTR
5. **Real-time trending** — WebSocket push for "Trending Now" badge on hot posts

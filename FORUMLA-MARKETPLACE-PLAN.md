# ColorGenius Formula Marketplace — Integration Plan & Timeline

**Date:** 2026-04-25
**Owner:** ColorGenius CEO (Lucy)
**Source:** Jason Opland business model confirmation
**Status:** Architecture phase — begins Month 20, launches Month 22-23

---

## Executive Summary

ColorGenius will launch an **AI-adapted formula marketplace** that allows stylists to monetize their best work. Raw formulas are context-dependent and can't be sold directly. But AI-adapted templates — personalized to each buyer's client — can be.

**Revenue split:** 70% creator / 20% ColorGenius / 10% transaction fee.

**ByondEdu integration** adds premium educator templates at higher price points.

---

## How It Works

```
1. STYLIST completes service → Takes before/after photos
2. STYLIST optionally shares formula to community (free, opt-in)
3. COMMUNITY ranks/likes the best results (social proof, engagement)
4. SYSTEM flags high-engagement formulas as "trending"
5. STYLIST opts-in → "Make this a sellable template"
6. AI ADAPTATION ENGINE parameterizes the formula (adjustable inputs)
7. MARKETPLACE lists template → Preview, reviews, adaptation samples
8. BUYER purchases → Enters their client's hair profile
9. AI ADAPTS → Personalized formula with confidence score
10. BUYER applies → Rates result, contributes learning data
11. REVENUE SPLIT → 70% creator, 20% ColorGenius, 10% transaction fee
```

---

## Revenue Model

### Standard Templates (Stylist-Created)

| Component | Take | Notes |
|-----------|------|-------|
| Stylist Creator | **70%** | Revenue share for formula template |
| ColorGenius Platform | **20%** | AI adaptation, hosting, discovery, trust & safety |
| Transaction Fee | **10%** | Payment processing, marketplace ops |
| **Buyer Price** | **$5–$15** | Per AI-adapted formula |

### Premium Templates (ByondEdu Educators)

| Component | Take | Notes |
|-----------|------|-------|
| Educator Creator | **60%** | Higher value, certified technique |
| ColorGenius Platform | **25%** | Featured placement, cross-promotion |
| Transaction Fee | **10%** | Payment processing |
| ByondEdu | **5%** | Course platform referral |
| **Buyer Price** | **$25–$75** | Per premium AI-adapted template |

### ByondEdu Cross-Sell Funnel

```
Buyer sees premium template →
  "Learn the technique behind this viral formula" →
    CTA: Enroll in [Educator Name]'s ColorGenius Masterclass →
      Course sale revenue: Educator 50% / ColorGenius 30% / ByondEdu 20%
```

---

## Why This Works

| Problem | Solution |
|---------|----------|
| Raw formulas are context-dependent (base color, porosity, damage, water quality) | AI adapts template to buyer's specific client |
| Stylists can't monetize their skill | Sell parameterized templates that AI personalizes |
| Buyers fear uncalibrated recipes | Confidence score + fallback to "requires consultation" |
| Discovery is hard | Trending/seasonal feeds create urgency + repeat engagement |
| Educators need distribution | ByondEdu integration = built-in audience + course upsell |

---

## Integration Architecture

### Database Schema Extensions

```sql
-- Community posts (extends formulations table)
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formulation_id UUID REFERENCES formulations(id),
    stylist_id UUID REFERENCES stylists(id),
    before_photo_url TEXT,
    after_photo_url TEXT,
    description TEXT,
    tags TEXT[], -- e.g. ['balayage', 'blonde', 'cool-tone']
    likes_count INT DEFAULT 0,
    saves_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    trend_score DECIMAL(5,2) DEFAULT 0.0, -- computed ranking
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace templates (sellable versions of community posts)
CREATE TABLE marketplace_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_post_id UUID REFERENCES community_posts(id),
    stylist_id UUID REFERENCES stylists(id),
    price_cents INT DEFAULT 799, -- $7.99 default
    is_premium BOOLEAN DEFAULT false, -- ByondEdu educator template
    educator_id UUID REFERENCES educators(id), -- NULL for standard
    adaptation_params JSONB, -- parameterized formula inputs
    preview_data JSONB, -- sample adaptation outputs
    review_count INT DEFAULT 0,
    avg_rating DECIMAL(2,1) DEFAULT 0.0,
    sales_count INT DEFAULT 0,
    total_earnings_cents INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending_review', -- pending_review, approved, rejected, paused
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template purchases
CREATE TABLE template_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_stylist_id UUID REFERENCES stylists(id),
    template_id UUID REFERENCES marketplace_templates(id),
    client_id UUID REFERENCES clients(id), -- buyer's client
    price_paid_cents INT,
    adaptation_result JSONB, -- AI-generated personalized formula
    confidence_score DECIMAL(4,3),
    status VARCHAR(20) DEFAULT 'purchased', -- purchased, adapted, applied, refunded
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue splits (for payout tracking)
CREATE TABLE revenue_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES template_purchases(id),
    recipient_type VARCHAR(20), -- creator, platform, transaction_fee, byondedu
    recipient_id UUID, -- stylist_id or NULL for platform
    amount_cents INT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
    paid_at TIMESTAMP,
    stripe_transfer_id TEXT
);

-- Trending / seasonal feeds
CREATE TABLE trending_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_type VARCHAR(20), -- trending, seasonal, editors_pick, new_arrivals
    season VARCHAR(20), -- spring, summer, fall, winter (if seasonal)
    template_id UUID REFERENCES marketplace_templates(id),
    rank_position INT,
    featured_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/community/share` | Share formulation to community |
| GET | `/api/community/feed` | Browse community formulas |
| POST | `/api/community/vote` | Like/rank community formula |
| GET | `/api/community/trending` | Trending community posts |
| POST | `/api/marketplace/templates` | List template for sale (creator) |
| GET | `/api/marketplace/browse` | Browse marketplace templates |
| GET | `/api/marketplace/trending` | Trending/seasonal feeds |
| POST | `/api/marketplace/purchase` | Purchase template |
| POST | `/api/marketplace/adapt` | AI adapt template to client |
| GET | `/api/marketplace/creator/dashboard` | Creator earnings + analytics |
| POST | `/api/marketplace/payout` | Request revenue payout |
| GET | `/api/marketplace/reviews` | Template reviews |

### AI Adaptation Engine v1

```
INPUT: Purchased template + buyer's client profile
  ├── Current hair: base color, level, tone, porosity, damage
  ├── Desired outcome: target shade, technique
  ├── Environmental: water hardness (if known), climate
  └── Constraints: allergies, previous treatments

AI ADAPTATION:
  ├── Parse template formula (products, ratios, developer)
  ├── Map client hair characteristics to template parameters
  ├── Adjust developer volume (higher lift needed? finer hair?)
  ├── Adjust processing time (porosity, damage)
  ├── Adjust product mix (compensate for undertone, gray coverage)
  ├── Calculate confidence score (0.0-1.0)
  └── IF confidence < 0.7 → Flag "Requires stylist consultation"

OUTPUT: Personalized formula + confidence score + warnings
```

---

## ByondEdu Integration

### Educator Verification

```
1. Educator applies via ByondEdu platform
2. ByondEdu certifies: credentials, course completion, teaching history
3. ColorGenius imports verification badge
4. Educator gets "Certified Educator" badge on marketplace
5. Premium template tier unlocked ($25-$75 vs $5-$15)
```

### Cross-Promotion

- Formula page shows educator's ByondEdu profile
- "Learn the technique" CTA links to course enrollment
- Featured placement for certified educators in seasonal feeds
- Revenue share: 5% to ByondEdu on premium template sales

---

## Content Moderation

| Layer | Action | Responsibility |
|-------|--------|----------------|
| **Upload** | Photo scan (no faces, hair only) + metadata validation | Automated |
| **Review** | First 3 posts manually reviewed; approve trusted creators | Human moderator |
| **Community** | Report button + community flagging | Users |
| **AI** | NSFW detection, duplicate detection, quality scoring | ML model |
| **Trust** | Seller rating threshold to remain listed | Automated |

---

## Timeline

### Phase 2 (Months 5-8): Foundation
- **Month 5-6:** Community sharing feature (opt-in before/after posts)
- **Month 6-7:** Basic liking/ranking system, stylist profiles
- **Month 7-8:** Content moderation pipeline, social features

### Phase 3 (Months 9-14): Preparation
- **Month 9-10:** AI adaptation engine v0 (parameterized formulas)
- **Month 10-11:** Stripe Connect architecture, payout system
- **Month 11-12:** Creator onboarding flow, analytics dashboard
- **Month 12-14:** Beta marketplace with 50 creators, internal testing

### Phase 4.5 (Months 20-28): Launch & Scale
- **Month 20-21:** Community foundation → 1,000+ formulas shared
- **Month 22-23:** **MARKETPLACE LAUNCH** → 100+ sellable templates
- **Month 23-24:** ByondEdu integration, educator onboarding
- **Month 24-25:** Seasonal/trending feeds, discovery features
- **Month 25-28:** Scale to 500+ creators, $50K monthly GMV

### Key Dates

| Milestone | Target Date | Success Metric |
|-----------|-------------|----------------|
| Community sharing live | Month 6 (Oct 2026) | 100 posts/week |
| AI adaptation engine v1 | Month 10 (Feb 2027) | >80% confidence on test cases |
| Marketplace beta | Month 14 (Jun 2027) | 50 creators, $2K GMV |
| Marketplace public launch | Month 22 (Feb 2028) | 100+ templates, 500 buyers |
| ByondEdu integration | Month 24 (Apr 2028) | 10 educator templates |
| $50K monthly GMV | Month 28 (Aug 2028) | 500+ active creators |

---

## Success Metrics

### Community Phase
- Formulas shared: 1,000+ by Month 21
- Weekly active community users: 500+ by Month 21
- Average engagement per post: 10+ likes

### Marketplace Phase
- Sellable templates live: 100+ by Month 23
- Monthly GMV: $10K by Month 24, $50K by Month 28
- Active creators: 500+ by Month 28
- Average template rating: 4.5+ stars
- Refund rate: <5%
- AI adaptation confidence: >80% average

### ByondEdu Integration
- Certified educators: 25+ by Month 26
- Premium templates: 50+ by Month 26
- Course cross-sell conversion: 10%+

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low creator adoption | Medium | High | Start with champions; showcase earnings; easy upload |
| AI adaptation quality poor | Medium | Critical | Conservative thresholds; human review; refund policy |
| Content moderation failures | Medium | High | Automated + community flagging; clear guidelines |
| Payment/chargeback issues | Low | High | Stripe Connect handles disputes; clear refund policy |
| Marketplace chicken-and-egg | High | Medium | Seed with "staff picks"; incentivize early creators |
| ByondEdu integration delays | Low | Medium | Parallel track; can launch without educator tier |

---

## Next Steps

1. **Architecture (Month 5-6):** Design marketplace schema extensions, API contracts
2. **Stripe Connect Setup (Month 9):** Configure split payment flows, creator onboarding
3. **AI Adaptation v0 (Month 9-10):** Parameterized formula engine, confidence scoring
4. **Community Beta (Month 6-7):** Before/after sharing, opt-in only
5. **Creator Outreach (Month 12-14):** Recruit 50 beta creators from existing user base
6. **ByondEdu Partnership (Month 12):** Formalize revenue share, integration spec

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-25  
**Author:** ColorGenius CEO (Lucy)

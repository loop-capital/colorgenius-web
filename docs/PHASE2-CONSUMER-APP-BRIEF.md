# LookGenius (TBD Name) — Consumer Style AI

**Status:** Phase 2 Backlog · **Priority:** ColorGenius Pro Tool First  
**Draft Date:** 2026-04-27 · **Target Launch:** Months 6-8 (post-beta)  
**Owner:** ColorGenius CEO (Iris) · **Drafted For:** Jason Opland

---

## Strategic Context

ColorGenius is the **revenue driver** (Phase 1) — pro tool for stylists, formulation engine, marketplace.  
The **consumer-facing service** is the **traffic driver** (Phase 2) — it feeds the top of the funnel, builds the brand, and eventually becomes its own revenue stream.

**Sequencing:**
- Phase 1 (Months 1-5): ColorGenius pro tool → stylists pay, AI engine learns
- Phase 2 (Months 6-12): Consumer gallery + style AI → free/viral, drives UpLook bookings + product sales
- Phase 3 (Months 12+): Full commerce → products, affiliate revenue, premium consumer features

---

## The Problem for Consumers

Consumers don't wake up thinking "what color?" They think:
- "What style suits my face?"
- "What's trending this season?"
- "I want a change but don't know what"
- "Show me before/afters on someone like me"
- "What cut + color combo works?"

**ColorGenius is too narrow for this mental model.** We need a consumer brand that speaks "style" and "look," not just "formulation."

---

## Product Vision

### Name Options

| Name | Logic | Status |
|------|-------|--------|
| **ColorGenius Discover** | Keeps brand equity, sub-brand feel | Safe default |
| **LookGenius** | "Genius" family, broader than color | **Recommended** |
| **StyleGenius** | Even broader, but generic | Backup |
| **Chroma** | Premium rebrand, artistic | Long-term option |

**Recommendation:** Launch as **ColorGenius Discover** (lower risk, builds on existing brand). Rebrand to **LookGenius** in Month 8-10 if consumer traction is strong and the experience genuinely expands beyond color.

### Core Experience

```
Consumer opens LookGenius (or ColorGenius Discover)
  ├── Uploads selfie → AI analyzes:
  │     ├── Face shape (oval, round, square, heart, diamond)
  │     ├── Skin tone (warm, cool, neutral)
  │     ├── Hair texture (fine, medium, coarse)
  │     ├── Current color level
  │     └── Undertone analysis
  ├── "Trending Styles" feed → Curated by ColorGenius AI + engagement
  ├── "Colors for You" → ColorGenius shade recommendations
  ├── "Styles for Your Face" → Cut + color combos ranked by match
  ├── Taps a look → Before/after gallery + stylist profile
  │     └── "Book this stylist on UpLook" → deep-link to getuplook.com
  └── "Save to My Looks" → Takes to their stylist
```

---

## Feature Set (Phase 2)

### MVP (Month 6-7)

| Feature | Description | Data Source |
|---------|-------------|-------------|
| **Trending Colors Feed** | Scrollable gallery of top community posts | ColorGenius CommunityPosts (public subset) |
| **Seasonal Collections** | Curated sets: "Spring Pastels," "Fall Coppers" | Manual curation + algorithm |
| **Highest Rated** | Community-ranked looks by engagement | Trending algorithm from ColorGenius |
| **Stylist Portfolio View** | Public-facing before/afters per stylist | CommunityPosts filtered by stylist_id |
| **Book on UpLook CTA** | Deep-link to getuplook.com/professional/:slug | UpLook integration spec (already drafted) |
| **Save/Share Looks** | Like Pinterest — save to board, share to social | ConsumerLike, ConsumerSave tables |

### V1 (Month 8-10)

| Feature | Description |
|---------|-------------|
| **Face Shape Analysis** | Upload selfie → AI detects face shape → recommends flattering cuts |
| **Skin Tone Matcher** | Analyzes undertone → recommends complementary colors |
| **"Try It On" AR** | Overlay color on user's photo (basic — not full AR) |
| **Style Quiz** | "What's my vibe?" → Trendy, Classic, Bold, Natural → personalized feed |
| **Stylist Discovery** | "Find stylists near me who do this look" → UpLook geo search |

### V2 (Month 10-12)

| Feature | Description |
|---------|-------------|
| **Product Recommendations** | "To maintain this color, use X shampoo" → affiliate links |
| **Skin Care Cross-Sell** | "This blonde looks best with cool-toned skin — try these products" |
| **Premium Consumer Tier** | $4.99/mo — unlimited AI analysis, exclusive educator content, early access to trends |
| **Group/Gift Mode** | "Gift a color consultation" → virtual gift card |

---

## Revenue Model (Phase 2)

| Revenue Stream | Phase | Mechanism |
|----------------|-------|-----------|
| **UpLook referral fee** | Month 6+ | $ per booking generated from LookGenius CTAs |
| **Product affiliate** | Month 10+ | Amazon/Sephora/brand affiliate links on product recommendations |
| **Premium consumer tier** | Month 10+ | $4.99/mo subscription for power users |
| **Sponsored placements** | Month 12+ | Brands pay for featured placement in seasonal feeds |
| **Manufacturer data** | Month 12+ | Aggregate trend data sold to color manufacturers |

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Next.js 15 + Tailwind v4 | Same stack as ColorGenius dashboard |
| **API** | ColorGenius API (existing) | Gallery endpoints already in `/api/gallery/*` |
| **AI Analysis** | ColorGenius Engine (existing) | Face shape = new ML model, color analysis = existing |
| **Auth** | Anonymous browsing + optional signup | No friction for first visit |
| **Deep Links** | UpLook integration | Already spec'd in `docs/uplook-integration-spec.md` |
| **Analytics** | Same as ColorGenius | `gallery.post.view`, `gallery.uplook.click`, etc. |

---

## Data Model (Already Built)

From the community/marketplace schema delivered by `colorgenius-architect` (2026-04-27):

- `GalleryPost` — public consumer-facing content (subset of CommunityPosts)
- `ConsumerLike`, `ConsumerSave` — anonymous or authenticated engagement
- `TrendingFeed` — algorithmic feeds (trending, seasonal, editor's pick)
- `Stylist.uplook_profile_url` — deep-link to getuplook.com
- `GalleryPost.stylist_id` → `Stylist` → UpLook profile

**No new schema work needed.** The data model is ready. We just need the UI layer.

---

## Success Metrics

| Metric | Month 6 Target | Month 12 Target |
|--------|---------------|-----------------|
| Monthly active consumers | 5,000 | 50,000 |
| Average session duration | 3 min | 5 min |
| UpLook referral clicks | 500/mo | 5,000/mo |
| UpLook conversion rate | 5% | 8% |
| Saved looks per user | 2 | 5 |
| Organic shares per user | 0.5 | 1.5 |
| Premium subscriber rate | N/A | 3% |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| ColorGenius brand dilution | Keep "Powered by ColorGenius" badge; maintain pro focus on main brand |
| Face shape AI inaccuracy | Start with 3 broad categories (round, oval, angular) → expand |
| Low consumer engagement | Seed with Pleij client base; incentivize stylist sharing |
| UpLook integration delays | Phase 1 = manual profile links; Phase 2 = API sync |
| Content moderation | Same pipeline as community posts; manual review for featured placements |

---

## Next Steps (When Phase 2 Starts)

1. **Confirm name** — ColorGenius Discover vs LookGenius
2. **Consumer UI design brief** — Moodboard, wireframes, color palette
3. **Face shape ML model** — Research open-source models (MediaPipe, dlib)
4. **UpLook API handshake** — Confirm getuplook.com deep-link format with PC3 team
5. **Content seeding** — Recruit 50 stylists to share before/afters for launch
6. **Launch strategy** — TikTok/Instagram viral campaign around "Find your perfect color"

---

## Relationship to ColorGenius

```
┌─────────────────────────────────────────────────────────────┐
│                    CONSUMER JOURNEY                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Consumer discovers LookGenius (TikTok, Instagram, word)    │
│         ↓                                                   │
│  Browses trending styles → "I want this look"              │
│         ↓                                                   │
│  Taps "Book this stylist on UpLook"                        │
│         ↓                                                   │
│  UpLook → Finds stylist → Books appointment               │
│         ↓                                                   │
│  Stylist uses ColorGenius at appointment → Formula        │
│         ↓                                                   │
│  Stylist posts result to Community → Feeds Gallery          │
│         ↓                                                   │
│  Next consumer discovers it → Cycle continues               │
│                                                             │
│  Revenue flow:                                              │
│  • ColorGenius = stylist subscription + marketplace fees  │
│  • UpLook = booking fees                                    │
│  • LookGenius = affiliate + premium + sponsored             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**ColorGenius is the engine. LookGenius is the discovery layer. UpLook is the transaction layer.**

---

*Drafted by Iris (colorgenius-ceo) · Do not action until Phase 2 begins · ColorGenius pro tool is the priority*

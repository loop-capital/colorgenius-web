# ByondEdu × COLORgenius — Course Structure, Pricing & Integration Spec

**Date:** May 2026
**Contact:** Jason Opland, Founder

---

## The Vision

COLORgenius recommends formulas. ByondEdu teaches stylists how to execute them. Together, they close the loop from client inspiration to perfect execution.

**The flywheel:**

```
Client wants look → Stylist gets formula → ByondEdu surfaces education
→ Stylist executes confidently → Client reviews → Community content
→ More clients discover → More stylists learn → More brands engage
```

---

## Contextual Education in COLORgenius

When a stylist receives a formula recommendation, ByondEdu content surfaces **inline** — embedded in the results, not a link to a separate page.

### How It Works

| Step | What Happens |
|------|-------------|
| Formula generated | COLORgenius knows: brand, shades, service type, hair characteristics |
| Content query | App calls ByondEdu API: `GET /api/content?brand=wella&service=balayage&shades=7/03,6/43` |
| Inline display | Relevant video tip, micro-lesson, or article surfaces below formula card |
| Full course | If stylist wants more, full course loads inline or links to ByondEdu |

### Content That Surfaces

| Content Type | When It Shows | Duration |
|-------------|---------------|----------|
| **Pro Tips** | Every formula | 1-3 sentences |
| **Micro-Lessons** | Complex techniques (balayage, color correction, foiling) | 60-120 sec video |
| **Application Guides** | New-to-stylist brands or shades | 3-5 min video |
| **Full Courses** | Stylist clicks "Learn More" | 15-60 min |
| **Certification** | After completing a learning path | Multi-course |

### Client → Stylist Request Flow

1. Client browses looks on GetUpLook or COLORgenius client portal
2. Client submits desired look to their stylist before appointment
3. Stylist receives request in COLORgenius dashboard
4. Formula auto-generated from the client's desired look
5. **If stylist needs guidance:** ByondEdu education link is right there — from the brand or educator who submitted the content
6. Stylist watches, executes confidently
7. Result photo → AI score → client review → community

**This is the unlock:** The client drives demand. The stylist needs education to fulfill it. ByondEdu is the bridge. And every brand wants their education to be the one that shows up.

---

## Course Structure

### Content Tiers

| Tier | Format | Duration | Who Creates | Purpose |
|------|--------|----------|-------------|---------|
| **Pro Tips** | Text + optional image | 1-3 sentences | Brand or Educator | Quick guidance, surfaced inline |
| **Micro-Lessons** | Video | 60-120 sec | Brand or Educator | Specific technique demonstration |
| **Short Courses** | Video + quiz | 15-30 min | Educator or Brand | Focused skill (e.g., "Balayage Fundamentals") |
| **Full Courses** | Video + quiz + assignment | 1-3 hours | Educator | Comprehensive topic (e.g., "Advanced Color Correction") |
| **Certification Paths** | Multi-course + practical exam | 5-20 hours | Educator or Brand | Credential: "Certified in [Brand/Technique]" |
| **Brand Training** | Video series + product knowledge | 30 min - 2 hours | Brand (via ByondEdu) | Product-specific training required for Commerce Partner visibility |

### Course Categories (Hair Color Focus)

| Category | Examples |
|----------|---------|
| **Color Theory** | Underlying pigment, level systems, tone families |
| **Application Techniques** | Balayage, foiling, color melting, root shadow |
| **Brand-Specific** | Wella Koleston Perfect formulation, Redken Shades EQ mixing |
| **Color Correction** | Banding removal, brass neutralization, damage repair |
| **Grey Coverage** | Resistant grey techniques, blending, full coverage |
| **Formulation** | Custom mixing, cross-brand conversion, tone adjustment |
| **Safety & Chemistry** | Allergen management, porosity assessment, developer science |
| **Business** | Pricing color services, consultations, client retention |

---

## Pricing Model

### For Stylists (Course Consumers)

| Model | Price Range | How It Works |
|-------|------------|--------------|
| **Free** | $0 | Brand-sponsored training, basic tips, community content |
| **Pay-per-course** | $5–75 | One-time purchase, lifetime access to course |
| **ByondEdu Pro Subscription** | $19/mo or $149/yr | Unlimited access to all courses, priority new content |

### Course Pricing Guide (What Educators Charge)

| Course Type | Suggested Price | ByondEdu Fee (30%) | Educator Earns (70%) |
|-------------|----------------|--------------------|--------------------|
| Pro Tip | Free (brand-sponsored) | $0 | $0 |
| Micro-Lesson | $5–15 | $1.50–4.50 | $3.50–10.50 |
| Short Course (15-30 min) | $15–45 | $4.50–13.50 | $10.50–31.50 |
| Full Course (1-3 hours) | $45–75 | $13.50–22.50 | $31.50–52.50 |
| Certification Path | $100–250 | $30–75 | $70–175 |
| Premium Masterclass | $150–500 | $45–150 | $105–350 |

### Educator Revenue Model

| Tier | Monthly Revenue | ByondEdu Fee | Educator Earns |
|------|----------------|-------------|----------------|
| **Starter** | $0–500 | 30% | 70% |
| **Growth** | $500–2,000 | 25% | 75% |
| **Pro** | $2,000–10,000 | 20% | 80% |
| **Elite** | $10,000+ | 15% | 85% |

Lower fees at scale = incentive for top educators to stay on ByondEdu.

---

## Manufacturer Education Pricing

Brands pay to have their education surfaced contextually in COLORgenius.

### Brand Education Tiers

| Tier | Monthly Fee | What's Included |
|------|------------|-----------------|
| **Basic** | Free | Brand content on ByondEdu (self-published). Shows in search results only. No contextual placement in COLORgenius. |
| **Featured** | $1,000/mo | Contextual education surfaced in COLORgenius formula results. 3 Pro Tips + 2 Micro-Lessons per month. |
| **Premium** | $2,500/mo | All Featured benefits + unlimited Pro Tips/Micro-Lessons. Brand-branded education card in formula results. Analytics dashboard. |
| **Enterprise** | $5,000/mo | All Premium + dedicated ByondEdu channel. Certification program support. Co-branded content. Priority placement. |

### What Brands Provide

| Content Type | Who Creates | Review Process |
|-------------|-------------|----------------|
| Pro Tips | Brand education team | Quick review (24-48 hrs) |
| Micro-Lessons | Brand or contracted educator | Editorial review (3-5 days) |
| Full Courses | Brand or ByondEdu educator network | Full editorial process (1-2 weeks) |
| Certification | Brand + ByondEdu co-developed | Structured review + practical exam design |

### Brand Certification Programs

Brands can create official certification programs on ByondEdu:

| Certification Level | Requirements | Stylist Pays | Brand Gets |
|--------------------|--------------|-------------|------------|
| **Bronze** | Complete 3 courses + quiz (80%+) | $49–99 | Certified user base, usage data |
| **Silver** | Bronze + portfolio submission | $99–199 | Verified skilled users |
| **Gold** | Silver + practical assessment | $199–399 | Elite brand ambassadors |

**Revenue split:** 70% Brand / 30% ByondEdu (Brand creates the content, ByondEdu provides the platform)

---

## Integration Architecture

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   COLORgenius    │◀───────▶│    ByondEdu      │◀───────▶│     Brands       │
│                  │  API    │                  │  Content│                  │
│ • Formulation    │────────▶│ • Course catalog │◀────────│ • Pro tips       │
│ • Context query  │         │ • Content API    │         │ • Videos         │
│ • Inline display │◀────────│ • User progress  │         │ • Certifications │
│ • Client portal  │────────▶│ • Certificates   │         │ • Brand channel  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                            │
        │                            │
        ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│    GetUpLook     │         │   Educators      │
│                  │         │                  │
│ • Client looks   │         │ • Create courses │
│ • Submit to      │         │ • Earn 70-85%    │
│   stylist        │         │ • Build audience │
│ • Reviews        │         │ • Get certified  │
└──────────────────┘         └──────────────────┘
```

### ByondEdu API Endpoints (for COLORgenius integration)

```
GET  /api/content/relevant?brand=<>&service=<>&shades=<>
     → Returns ranked list of relevant content for formula context

GET  /api/content/<id>
     → Returns full content (video URL, text, quiz data)

POST /api/content/progress
     → Records stylist progress through a course

GET  /api/certifications/<stylistId>
     → Returns stylist's certifications (for profile badges)

GET  /api/brands/<brandId>/education
     → Returns all education content for a brand
```

---

## Revenue Summary

### ByondEdu Revenue Streams

| Stream | Model | Est. Monthly (at scale) |
|--------|-------|------------------------|
| Course sales | 15-30% of educator price | $5,000–50,000 |
| Pro subscriptions | $19/mo per stylist | $10,000–100,000 |
| Brand education tiers | $1,000–5,000/mo per brand | $5,000–25,000 |
| Certification programs | Revenue share with brands | $2,000–10,000 |
| **Total** | | **$22,000–185,000/mo** |

### COLORgenius Benefit

| Benefit | Impact |
|---------|--------|
| User retention | Education keeps stylists in-app longer |
| Brand stickiness | Brands with education get more formulations |
| Client engagement | Client → stylist → education loop drives usage |
| Differentiation | No competitor has formula + education + ordering in one app |

---

## Timeline

| Phase | What | When |
|-------|------|------|
| **Now** | ByondEdu platform finalization, beta educator onboarding | May–June 2026 |
| **Beta** | 5-10 educators creating content, brand education teams onboarded | July 2026 |
| **Launch** | Contextual education live in COLORgenius, ByondEdu public launch | Aug 2026 |
| **Scale** | Brand certification programs, full course catalog | Q4 2026 |

---

## Next Steps

1. **Finalize ByondEdu platform** for beta educator content creation
2. **Recruit 5-10 founding educators** — offer 80/20 split (instead of 70/30) for first 6 months
3. **Onboard 2-3 brand education teams** — free Featured tier for first 3 months in exchange for content
4. **Build ByondEdu API** for COLORgenius contextual content queries
5. **Wire client request → formula → education flow** in COLORgenius

---

*ByondEdu × COLORgenius — Where Formulation Meets Education*

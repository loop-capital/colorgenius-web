# Color Genius - Build Roadmap

## Executive Summary

This document outlines the phased development plan for Color Genius, including team requirements, time estimates, and key milestones. The roadmap balances rapid market entry with sustainable, scalable architecture.

---

## Phase Overview

| Phase | Duration | Focus | Team Size | Key Deliverable |
|-------|----------|-------|-----------|-----------------|
| **Phase 1** | Months 1-4 | MVP Core | 4-6 people | Photo analysis + basic formulation |
| **Phase 2** | Months 5-8 | Product-Market Fit | 8-12 people | Full platform with learning system |
| **Phase 3** | Months 9-14 | Scale & Integrate | 15-20 people | Enterprise features + integrations |
| **Phase 4** | Months 15-24 | Market Leadership | 20-30 people | Advanced AI + international expansion |
| **Phase 4.5** | Months 20-28 | Formula Marketplace | 25-35 people | AI-adapted template marketplace + ByondEdu integration |

---

## Phase 1: MVP Core (Months 1-4)

### Objectives
- Build core photo analysis pipeline
- Implement basic formulation engine
- Launch with 3 major color lines
- Validate with 50 beta stylists

### Technical Scope

```
Phase 1 Deliverables:
├── Photo Analysis Pipeline
│   ├── Hair segmentation (YOLOv8)
│   ├── Level detection (ResNet18)
│   ├── Texture classification (ResNet50)
│   └── Basic damage assessment
├── Formulation Engine v1
│   ├── 10-variable algorithm
│   ├── 3 brands: Redken, Wella, Schwarzkopf
│   ├── Basic developer selection
│   └── Simple shade matching
├── Mobile App (iOS)
│   ├── Photo capture
│   ├── Results display
│   └── Basic formula viewer
├── Backend API
│   ├── Core endpoints
│   ├── PostgreSQL database
│   └── Basic auth (JWT)
└── Infrastructure
    ├── AWS deployment
    ├── Basic monitoring
    └── CDN for images
```

### Team Composition

| Role | Count | FTE | Notes |
|------|-------|-----|-------|
| **Technical** ||||
| Tech Lead / Architect | 1 | 1.0 | Full-stack, ML experience |
| ML Engineer | 1 | 1.0 | Computer vision focus |
| Backend Engineer | 1 | 1.0 | Python, FastAPI |
| iOS Developer | 1 | 1.0 | Swift, UI/UX |
| DevOps / SRE | 1 | 0.5 | Part-time initially |
| **Product** ||||
| Product Manager | 1 | 0.5 | Part-time, domain expertise |
| UI/UX Designer | 1 | 0.5 | Part-time |
| **Total** | **6** | **5.0 FTE** | |

### Month-by-Month Breakdown

#### Month 1: Foundation
**Weeks 1-2: Setup**
- [ ] Infrastructure setup (AWS, CI/CD)
- [ ] Database schema implementation
- [ ] API scaffolding with FastAPI
- [ ] Development environment configuration

**Weeks 3-4: Photo Analysis Core**
- [ ] Implement hair segmentation model
- [ ] Build photo upload service
- [ ] Create pre-processing pipeline
- [ ] Basic color extraction

**Deliverables:**
- Working photo upload and segmentation
- API endpoints for photo analysis
- Development environment ready

#### Month 2: Color Science
**Weeks 5-6: Color Engine**
- [ ] Implement level detection model
- [ ] Build tone detection classifier
- [ ] Create color extraction pipeline
- [ ] Lighting correction algorithms

**Weeks 7-8: Database Population**
- [ ] Import Redken Shades EQ data
- [ ] Import Redken Color Gels data
- [ ] Import Wella Koleston Perfect data
- [ ] Build shade matching algorithms

**Deliverables:**
- Photo analysis returning level + tone
- 3 color lines in database
- Color matching functional

#### Month 3: Formulation Engine
**Weeks 9-10: Core Algorithm**
- [ ] Developer selection logic
- [ ] Basic shade selection
- [ ] Gray coverage rules
- [ ] Formulation validation

**Weeks 11-12: Mobile App**
- [ ] iOS app scaffolding
- [ ] Photo capture integration
- [ ] Results display screens
- [ ] Formula viewer UI

**Deliverables:**
- Working formulation generation
- Basic iOS app functional
- End-to-end flow working

#### Month 4: Polish & Beta
**Weeks 13-14: Integration**
- [ ] Connect photo analysis to formulation
- [ ] Confidence scoring
- [ ] Error handling
- [ ] API documentation

**Weeks 15-16: Beta Launch**
- [ ] Onboard 50 beta stylists
- [ ] Feedback collection system
- [ ] Bug fixes
- [ ] Performance optimization

**Deliverables:**
- MVP launched to beta
- 50 active beta users
- Feedback pipeline operational

### Budget Estimate: Phase 1

| Category | Amount | Notes |
|----------|--------|-------|
| Salaries (4 months) | $320,000 | 5 FTE average |
| Infrastructure | $8,000 | AWS, services |
| Third-party tools | $5,000 | ML platforms, etc. |
| Legal / incorporation | $10,000 | Setup costs |
| **Total Phase 1** | **$343,000** | |

---

## Phase 2: Product-Market Fit (Months 5-8)

### Objectives
- Build learning system foundation
- Add 5 more color lines
- Launch Android app
- Validate pricing model
- Reach 500 active stylists

### Technical Scope

```
Phase 2 Deliverables:
├── Learning System v1
│   ├── Feedback collection
│   ├── Basic ML models
│   ├── Formula success tracking
│   └── Regional trend detection
├── Formulation Engine v2
│   ├── 10+ color lines
│   ├── Advanced gray coverage
│   ├── Corrective color support
│   └── Cost estimation
├── Mobile Expansion
│   ├── Android app
│   ├── iOS improvements
│   └── Offline mode basics
├── Web Dashboard
│   ├── Stylist analytics
│   ├── Client management
│   └── Formula history
└── Platform Enhancements
    ├── Square billing
    ├── Webhooks
    ├── API rate limiting
    └── Advanced monitoring
```

### Team Composition

| Role | Count | FTE | Notes |
|------|-------|-----|-------|
| **Technical** ||||
| VP Engineering | 1 | 1.0 | New hire |
| ML Engineer | 2 | 2.0 | One new, one from Phase 1 |
| Backend Engineer | 2 | 2.0 | One new |
| iOS Developer | 1 | 1.0 |
| Android Developer | 1 | 1.0 | New hire |
| Full-Stack Engineer | 1 | 1.0 | Web dashboard |
| DevOps / SRE | 1 | 1.0 | Full-time now |
| QA Engineer | 1 | 0.5 | Part-time |
| **Product** ||||
| Product Manager | 1 | 1.0 | Full-time |
| UI/UX Designer | 1 | 1.0 | Full-time |
| **Business** ||||
| Customer Success | 1 | 0.5 | Part-time |
| **Total** | **12** | **11.0 FTE** | |

### Key Milestones

#### Month 5: Learning Foundation
- Build feedback collection system
- Implement outcome tracking
- Launch with Matrix, Joico, Pravana
- Customer success function

#### Month 6: Android & Web
- Android app MVP
- Web dashboard for stylists
- Advanced formulation features
- Pricing experiments

#### Month 7: Scale Preparation
- Learning system ML models
- Regional trend detection
- Payment processing
- Performance optimization

#### Month 8: Growth Launch
- Remove beta label
- Marketing launch
- Target: 500 active stylists
- Gather PMF metrics

### Budget Estimate: Phase 2

| Category | Amount | Notes |
|----------|--------|-------|
| Salaries (4 months) | $880,000 | 11 FTE |
| Infrastructure | $25,000 | Scale up |
| Third-party tools | $15,000 | ML training, etc. |
| Marketing | $50,000 | Launch campaign |
| **Total Phase 2** | **$970,000** | |
| **Cumulative** | **$1,313,000** | |

---

## Phase 3: Scale & Integrate (Months 9-14)

### Objectives
- Build salon/enterprise features
- Launch key integrations
- Advanced AI capabilities
- Reach 5,000 active stylists
- $500K ARR target

### Technical Scope

```
Phase 3 Deliverables:
├── Salon Management
│   ├── Multi-stylist accounts
│   ├── Salon analytics dashboard
│   ├── Inventory tracking
│   └── Role-based permissions
├── Integrations
│   ├── UpLook booking sync
│   ├── ProKyur product ordering
│   ├── ByondEdu learning
│   └── Square/Payment processing
├── Advanced ML
│   ├── Personalized recommendations
│   ├── Processing time prediction
│   ├── Success probability
│   └── Anomaly detection
├── Platform
│   ├── Admin panel
│   ├── API v2
│   ├── Webhook improvements
│   └── SLA monitoring
└── Quality
    ├── Comprehensive test suite
    ├── Security audit
    ├── SOC 2 preparation
    └── Performance benchmarking
```

### Team Composition

| Role | Count | FTE | Notes |
|------|-------|-----|-------|
| **Engineering** ||||
| VP Engineering | 1 | 1.0 |
| Engineering Managers | 2 | 2.0 | New hires |
| ML Engineers | 3 | 3.0 | Two new |
| Backend Engineers | 3 | 3.0 | Two new |
| Mobile Engineers | 2 | 2.0 | iOS + Android |
| Full-Stack Engineers | 2 | 2.0 | Web focus |
| DevOps / SRE | 2 | 2.0 | One new |
| QA Engineers | 2 | 2.0 | One new |
| Security Engineer | 1 | 0.5 | Part-time |
| **Product** ||||
| CPO / VP Product | 1 | 1.0 | New hire |
| Product Managers | 2 | 2.0 | One new |
| UI/UX Designers | 2 | 2.0 | One new |
| **Business** ||||
| Head of Sales | 1 | 1.0 | New hire |
| Customer Success Managers | 2 | 2.0 | New hires |
| Marketing Manager | 1 | 1.0 | New hire |
| **Operations** ||||
| Office Manager | 1 | 0.5 | Part-time |
| **Total** | **19** | **26.5 FTE** | |

### Key Milestones

#### Month 9-10: Salon Features
- Multi-seat accounts
- Salon analytics
- Team collaboration features
- Inventory basics

#### Month 11-12: Integrations
- UpLook partnership live
- ProKyur integration
- Payment processing complete
- API v2 beta

#### Month 13-14: Advanced AI
- Personalized recommendations
- Predictive models live
- Regional learning active
- Quality certifications

### Budget Estimate: Phase 3

| Category | Amount | Notes |
|----------|--------|-------|
| Salaries (6 months) | $3,975,000 | 26.5 FTE avg |
| Infrastructure | $100,000 | Scale |
| Third-party | $75,000 | APIs, tools |
| Marketing | $200,000 | Growth |
| Sales | $150,000 | Tools, travel |
| Compliance | $50,000 | SOC 2, legal |
| **Total Phase 3** | **$4,550,000** | |
| **Cumulative** | **$5,863,000** | |

---

## Phase 4: Market Leadership (Months 15-24)

### Objectives
- Industry-leading AI capabilities
- International expansion
- Enterprise sales
- 25,000+ active stylists
- $5M ARR target

### Technical Scope

```
Phase 4 Deliverables:
├── AI Innovation
│   ├── Real-time photo guidance
│   ├── Predictive color fading
│   ├── Virtual try-on
│   └── Voice-activated formulation
├── Enterprise Platform
│   ├── White-label options
│   ├── Custom integrations
│   ├── Advanced analytics
│   └── Dedicated support
├── International
│   ├── EU compliance (GDPR)
│   ├── Multi-language support
│   ├── Regional color lines
│   └── Localized pricing
└── Ecosystem
    ├── Partner marketplace
    ├── Developer platform
    ├── Open API
    └── Certification program

---

## Phase 4.5: Formula Marketplace (Months 20-28)

**NEW — Confirmed direction from Jason Opland (2026-04-25)**

### Objectives
- Launch AI-adapted formula marketplace
- Enable stylists to monetize their best work
- Integrate with ByondEdu educator platform
- Reach $500K ARR from marketplace fees alone

### Why This Works
- Raw formulas can't be sold (context-dependent: base color, porosity, damage, water quality)
- AI-adapted templates CAN be sold because ColorGenius personalizes them per client
- Stylists get recognized + earn from their best work
- Buyers get calibrated, personalized formulas, not uncalibrated recipes
- Seasonal trending creates repeat engagement

### Revenue Model

**For AI-Adapted Formula Templates:**
| Party | Take | Notes |
|-------|------|-------|
| **Stylist Creator** | 70% | Revenue share for formula template |
| **ColorGenius Platform** | 20% | Platform fee for AI adaptation, hosting, discovery |
| **Transaction Fee** | 10% | Payment processing + marketplace operations |

**Premium Educator Templates (ByondEdu Integration):**
- Higher price point ($15-$50 vs $5-$10 standard)
- Certified educators get featured placement
- Drives course signups: "Learn the technique behind this viral formula"

### Technical Scope

```
Phase 4.5 Deliverables:
├── Community Platform
│   ├── Before/after photo sharing
│   ├── Formula metadata capture (tags, products, techniques)
│   └── Social features (follows, profiles, badges)
├── Ranking & Discovery
│   ├── Community voting / liking system
│   ├── Trending algorithm (engagement + recency + quality)
│   ├── Seasonal color feeds (Spring pastels, Fall coppers, etc.)
│   └── Search & filter (color family, technique, hair type, brand)
├── AI Adaptation Engine
│   ├── Input: Purchased template + buyer's client data
│   ├── Adjust for: base color, porosity, damage, texture, water quality
│   ├── Output: Personalized formula with confidence score
│   └── Fallback: "Requires stylist consultation" for edge cases
├── Payment & Distribution
│   ├── Square Marketplace (split payments to creators)
│   ├── Creator dashboard (earnings, analytics, payout settings)
│   └── Buyer receipt + saved formula to client history
├── ByondEdu Integration
│   ├── Educator verification badge
│   ├── Course cross-promotion on formula pages
│   └── "Masterclass" template tier
└── Trust & Safety
    ├── Content moderation (photos, descriptions)
    ├── Quality thresholds for sellable templates
    ├── Dispute resolution
    └── Refund policy (AI adaptation failed = full refund)
```

### Marketplace Workflow

```
1. STYLIST completes service → Takes before/after photos
2. STYLIST optionally shares formula to community (free, optional)
3. COMMUNITY engages → Likes, comments, saves
4. SYSTEM detects → High-engagement formulas flagged as "trending"
5. STYLIST opts-in → "Make this a sellable template"
6. AI ADAPTATION ENGINE ingests formula + creates parameterized template
7. MARKETPLACE lists template → With preview, reviews, adaptation samples
8. BUYER purchases → Enters their client's hair profile
9. AI ADAPTS → Generates personalized formula for buyer's client
10. BUYER applies → Can rate/return to contribute learning data
11. REVENUE SPLIT → 70% creator, 20% ColorGenius, 10% transaction fee
```

### Team Composition (Additional to Phase 4)

| Role | Count | FTE | Notes |
|------|-------|-----|-------|
| **Engineering** ||||
| Marketplace Backend Engineer | 2 | 2.0 | Payments, ranking, fraud |
| AI Adaptation Engineer | 1 | 1.0 | Personalization engine |
| Full-Stack Engineer | 1 | 1.0 | Community features |
| Mobile Engineer | 1 | 1.0 | Marketplace in-app |
| **Product** ||||
| Marketplace Product Manager | 1 | 1.0 | New hire, marketplace expertise |
| **Business** ||||
| Creator Success Manager | 2 | 2.0 | Onboard stylists as sellers |
| Partnerships Manager (ByondEdu) | 1 | 1.0 | Joint go-to-market |
| **Total Additional** | **8** | **9 FTE** | |

### Key Milestones

#### Month 20-21: Community Foundation
- Before/after sharing feature (opt-in)
- Basic liking/ranking system
- Stylist profile pages
- Content moderation pipeline

#### Month 22-23: Marketplace Launch
- AI adaptation engine v1 (parameterized formulas)
- Square Marketplace integration
- Creator onboarding flow
- Buyer purchase + adaptation flow
- ByondEdu educator verification

#### Month 24-25: Growth & Discovery
- Seasonal/trending feeds
- Advanced search & filtering
- Creator analytics dashboard
- Review & rating system
- "Formula of the Month" featured placements

#### Month 26-28: Scale & Optimization
- ML-based quality scoring for templates
- Dynamic pricing suggestions
- International currency support
- Bulk creator payouts
- Enterprise salon marketplace (white-label)

### Success Metrics
- 1,000+ formulas shared in community (Month 21)
- 100+ sellable templates live (Month 23)
- $10K monthly marketplace GMV (Month 24)
- $50K monthly marketplace GMV (Month 28)
- 500+ active creators (Month 28)
- 4.5+ star average template rating

### Budget Estimate: Phase 4.5

| Category | Amount | Notes |
|----------|--------|-------|
| Additional Salaries (8 months) | $1,440,000 | 9 FTE avg |
| Infrastructure | $80,000 | Image hosting, ML inference |
| Third-party | $60,000 | Square fees, CDN, ML platforms |
| Marketing / Creator acquisition | $200,000 | Onboarding, influencer campaigns |
| **Total Phase 4.5** | **$1,780,000** | |
| **Cumulative through Phase 4.5** | **$23,393,000** | |

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Low creator adoption | Start with champions; showcase earnings; easy upload flow |
| AI adaptation quality | Conservative confidence thresholds; human review for edge cases |
| Content moderation | Automated + community flagging; clear guidelines |
| Payment disputes | Transparent pricing; clear refund policy; Square dispute handling |
| Marketplace chicken-and-egg | Seed with ColorGenius-generated "staff picks"; incentivize early creators |
```

### Team Composition (End of Phase 4)

| Role | Count | FTE |
|------|-------|-----|
| **Executive** |||
| CEO | 1 | 1.0 |
| CTO | 1 | 1.0 |
| CPO | 1 | 1.0 |
| VP Sales | 1 | 1.0 |
| VP Marketing | 1 | 1.0 |
| **Engineering** |||
| Engineering Directors | 2 | 2.0 |
| Engineering Managers | 4 | 4.0 |
| ML Engineers | 6 | 6.0 |
| Backend Engineers | 6 | 6.0 |
| Mobile Engineers | 4 | 4.0 |
| Full-Stack Engineers | 4 | 4.0 |
| DevOps / SRE | 4 | 4.0 |
| QA Engineers | 3 | 3.0 |
| Security Engineers | 2 | 2.0 |
| **Product** |||
| Product Directors | 2 | 2.0 |
| Product Managers | 4 | 4.0 |
| Designers | 4 | 4.0 |
| **Business** |||
| Enterprise Sales | 4 | 4.0 |
| Customer Success | 6 | 6.0 |
| Marketing | 4 | 4.0 |
| Partnerships | 2 | 2.0 |
| **Operations** |||
| HR / Recruiting | 2 | 2.0 |
| Finance | 2 | 2.0 |
| Legal | 1 | 1.0 |
| Admin | 2 | 2.0 |
| **Total** | **72** | **72 FTE** | |

### Budget Estimate: Phase 4

| Category | Amount | Notes |
|----------|--------|-------|
| Salaries (10 months) | $12,000,000 | 50 avg FTE over period |
| Infrastructure | $400,000 | Global scale |
| Third-party | $250,000 | Enterprise tools |
| Marketing | $1,500,000 | Brand building |
| Sales | $800,000 | Enterprise sales |
| International | $300,000 | Localization, legal |
| R&D | $500,000 | Advanced features |
| **Total Phase 4** | **$15,750,000** | |
| **Cumulative** | **$21,613,000** | |

---

## Summary Timeline

```
2026
├── Q2 (Apr-Jun): Phase 1
│   ├── Apr: Foundation
│   ├── May: Color Science
│   ├── Jun: Formulation + Beta
│
├── Q3 (Jul-Sep): Phase 1-2 Transition
│   ├── Jul: Learning System
│   ├── Aug: Android + Web
│   └── Sep: Scale Prep
│
├── Q4 (Oct-Dec): Phase 2
│   ├── Oct: Growth Launch
│   ├── Nov: Product-Market Fit
│   └── Dec: Holiday Pause
│
2027
├── Q1 (Jan-Mar): Phase 2-3 Transition
│   ├── Jan: Salon Features
│   ├── Feb: Integrations
│   └── Mar: Advanced AI
│
├── Q2 (Apr-Jun): Phase 3
│   ├── Apr: Partnership Launch
│   ├── May: Enterprise Beta
│   └── Jun: $500K ARR Goal
│
├── Q3 (Jul-Sep): Phase 3-4 Transition
│   ├── Jul: International Prep
│   ├── Aug: AI Innovation
│   └── Sep: Scale Hiring
│
├── Q4 (Oct-Dec): Phase 4
│   ├── Oct: Enterprise Sales
│   ├── Nov: International Launch
│   └── Dec: Market Leadership
│
2028
└── Q1+: Phase 4 Continuation
    └── $5M ARR Goal
```

---

## Key Hiring Timeline

### Immediate (Month 1)
- Tech Lead / Architect
- ML Engineer (CV)
- Backend Engineer
- iOS Developer

### Month 3-4
- Product Manager (full-time)
- UI/UX Designer
- DevOps Engineer (full-time)

### Month 5-6
- VP Engineering
- Android Developer
- Additional ML Engineer
- Full-Stack Engineer
- Customer Success

### Month 9-12
- CPO
- Head of Sales
- Engineering Managers
- Additional mobile, backend, ML
- Marketing Manager

### Month 15-18
- CTO (if different from VP Eng)
- Enterprise sales team
- International leads
- Security engineer

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|------------|
| Photo accuracy insufficient | Conservative confidence thresholds; hybrid AI + manual |
| Formulation accuracy low | Start with common cases; expand gradually |
| Scale challenges | Plan for horizontal scaling from day 1 |
| ML model drift | Automated monitoring; monthly retraining |

### Business Risks

| Risk | Mitigation |
|------|------------|
| Adoption resistance | Free trial; strong onboarding; stylist champions |
| Competition from incumbents | Speed to market; superior UX; community |
| Pricing pushback | Flexible tiers; value-based pricing experiments |
| Integration complexity | Partner closely; start with willing platforms |

### Resource Risks

| Risk | Mitigation |
|------|------------|
| Hiring delays | Build relationships early; contractor backup |
| Cash runway | Raise after PMF validation; conservative spending |
| Key person dependency | Document everything; cross-train early |

---

## Success Metrics by Phase

### Phase 1 Success
- Photo analysis confidence > 85%
- Formulation generation < 500ms
- 50 beta stylists onboarded
- 80% weekly active rate

### Phase 2 Success
- 500 active stylists
- 40% MoM growth
- $10K MRR
- NPS > 50

### Phase 3 Success
- 5,000 active stylists
- $500K ARR
- 3 enterprise customers
- 85% retention rate

### Phase 4 Success
- 25,000+ active stylists
- $5M ARR
- 20+ enterprise customers
- International presence in 3+ countries

### Phase 4.5 Success
- 1,000+ formulas shared in community (Month 21)
- 100+ sellable templates live (Month 23)
- $10K monthly marketplace GMV (Month 24)
- $50K monthly marketplace GMV (Month 28)
- 500+ active creators (Month 28)
- 4.5+ star average template rating
- ByondEdu integration with 25+ certified educators

---

**Document Version:** 1.1  
**Last Updated:** 2026-04-25  
**Total Estimated Investment:** $23.4M over 28 months  
**Author:** che-architect (ClawStudio) + ColorGenius CEO (Lucy)
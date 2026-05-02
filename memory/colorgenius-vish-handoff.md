# ColorGenius Vish Features — Implementation Handoff Package for Iris (PC2)

**Date:** 2026-04-29  
**Prepared by:** che-architect (subagent)  
**Target:** Iris (colorgenius-ceo) and che-dev team  
**Status:** Ready for implementation  

## Overview

This handoff package contains everything needed for Iris's team (che-dev) to implement the Vish-style business operations features for ColorGenius. Che's team (che-ui) has completed the frontend UI/UX specification, and this package transfers that work along with implementation guidance.

The package includes:
1. Summary of what was built in Che's workspace
2. File inventory and locations
3. Key technical decisions
4. What Iris needs to implement next
5. Blockers or questions requiring resolution
6. Instructions for transferring files to PC2 workspace

---

## 1. Summary of What Was Built

Che's team (che-ui) produced a complete **frontend UI/UX specification** transforming ColorGenius from an AI formulation engine into a full salon color management platform. Based on competitive research against Vish (the market leader in salon color management), the following **8 core features** were specified:

### Core Vish Features Specified

| # | Feature | Description | Priority | Status |
|---|---------|-------------|----------|--------|
| 1 | **Client Formula History** | Store, search, and reuse past color formulas per client — the core Vish-style feature. Screen: `/clients/[clientId]/formulas` | 🔴 Critical | ✅ Spec Complete |
| 2 | **Formula Detail / Reuse Flow** | Expandable detail panel with components, timing, stylist notes, before/after photos. Reuse/edit/archive actions. Screen: `/clients/[clientId]/formulas/[formulaId]` | 🔴 Critical | ✅ Spec Complete |
| 3 | **Cost Calculator** | Real-time cost estimation as formula is built. Shows product cost, service price, salon margin. Screen: `/formulas/cost-calculator` | 🟡 High | ✅ Spec Complete |
| 4 | **Inventory Dashboard** | Track product stock levels, set alerts (healthy/reorder/critical), view usage trends. Screen: `/salon/inventory` | 🟡 High | ✅ Spec Complete |
| 5 | **Pricing Rules Manager** | Configure how the salon charges for color services. 4 pricing methods supported. Screen: `/salon/pricing-rules` | 🟡 High | ✅ Spec Complete |
| 6 | **Service Entry / "Color Bar" Mode** | Primary stylist workflow — enter service, build formula, capture cost, save to client history. 4-step wizard. Screen: `/service/new` | 🔴 Critical | ✅ Spec Complete |
| 7 | **Formula Insights** | Analytics: avg cost per service, most used formulas, success rate, trending tones. | 🟢 Medium | ✅ Spec Complete |
| 8 | **Inventory Alert Flow** | Auto-deduct stock on service save, trigger banners/alerts when thresholds hit. | 🟡 High | ✅ Spec Complete |

### Supporting UX Flows Documented
- **New Service Flow** (primary) — Target: 60 seconds start to saved formula
- **Formula Refinement Flow** (post-service) — Rate result, adjust for next time
- **Inventory Alert Flow** — Deduct → Check thresholds → Banner/Alert actions

---

## 2. File Inventory and Locations

### Primary Deliverables from Che's Workspace

| File | Path | Size | Description |
|------|------|------|-------------|
| Vish UI/UX Spec | `memory/colorgenius-vish-ui-spec.md` | 46.3 KB | Complete frontend specification (831 lines) |
| Vish Research | `memory/colorgenius-vish-features-research.md` | 9.2 KB | Competitive analysis + feature gap |
| Bootstrap Spec | `memory/colorgenius-bootstrap-spec.md` | 39.1 KB | Technical foundation for AI formulation |
| Existing Architecture | `memory/color-genius/` | Various | ColorGenius core system specs |

### Supporting Artifacts (UI Components)

| Component | Path | Description |
|-----------|------|-------------|
| ColorgeniusHeader | `shared/artifacts/ui-components/ColorgeniusHeader.tsx` | Animated header with glassmorphism effect |
| ColorgeniusHero | `shared/artifacts/ui-components/ColorgeniusHero.tsx` | Hero section with rotating text, animated swatches |
| BeforeAfterSlider | `shared/artifacts/ui-components/BeforeAfterSlider.tsx` | Interactive before/after comparison slider |
| ColorgeniusGallery | `shared/artifacts/ui-components/ColorgeniusGallery.tsx` | Full-featured gallery with search, filters, sorting |
| ColorgeniusPricing | `shared/artifacts/ui-components/ColorgeniusPricing.tsx` | Pricing section with tier cards and billing toggle |
| index.ts | `shared/artifacts/ui-components/index.ts` | Export barrel for all components |
| package.json | `shared/artifacts/ui-components/package.json` | NPM package definition with peer dependencies |

### Website Assets (Marketing/Landing Page)

| Asset | Path | Description |
|-------|------|-------------|
| index.html | `shared/artifacts/colorgenius-website/index.html` | Complete marketing landing page |
| UI/UX Specs | `shared/artifacts/website-design/ui-ux-specs/` | Detailed specifications for each section |

---

## 3. Key Technical Decisions

### 3.1 Architecture Approach
- **Frontend:** Next.js 14+ with React 18, TypeScript, Tailwind CSS
- **State Management:** Zustand for global state, React Query/SWR for server state
- **UI Foundation:** shadcn/ui primitives extended with custom Vish components
- **Animations:** Framer Motion for all transitions and micro-interactions
- **Data Fetching:** Optimistic updates with background sync
- **Offline Support:** localStorage/IndexedDB fallback for critical operations

### 3.2 Component Interfaces (Ready for Implementation)

From `memory/colorgenius-vish-ui-spec.md` §4:

| Component | Props Interface | Key Features |
|-----------|----------------|--------------|
| `<FormulaCard />` | `formula: Formula, onReuse: () => void, onEdit: () => void, onDelete: () => void` | Default/expanded/compact states, ingredient list, result badge, cost display |
| `<CostCalculator />` | `onChange: (calculation: CostCalculation) => void, initialFormula?: FormulaComponent[]` | Real-time pricing, smart suggestions, markup rule editor |
| `<InventoryItem />` | `item: InventoryItem, onStockChange: (delta: number) => void` | Status indicators (healthy/reorder/critical), usage history sparkline |
| `<PricingRuleEditor />` | `rule: PricingRule, onSave: (rule: PricingRule) => void` | 4 pricing methods: flat multiplier, tiered, per-gram, flat+excess |
| `<ServiceFlow />` | `onComplete: (service: CompletedService) => void, initialClientId?: string` | 4-step wizard: client selection → formula build → cost confirmation → result capture |
| `<FormulaInsights />` | `timeframe: 'week' | 'month' | 'quarter', onFilterChange: (tf: string) => void` | Analytics cards: avg cost, most used formulas, success rate, trending tones |

### 3.3 API Endpoints Specified (12 New Endpoints)

From `memory/colorgenius-vish-ui-spec.md` §5.1:

```
GET    /v1/clients/:id/formulas
POST   /v1/clients/:id/formulas
GET    /v1/clients/:id/formulas/:fid
PUT    /v1/clients/:id/formulas/:fid
POST   /v1/clients/:id/formulas/:fid/reuse
GET    /v1/salon/inventory
PUT    /v1/salon/inventory/:id
POST   /v1/salon/inventory/:id/restock
GET    /v1/salon/pricing-rules
POST   /v1/salon/pricing-rules
PUT    /v1/salon/pricing-rules/:id
POST   /v1/services
PUT    /v1/services/:id/complete
GET    /v1/analytics/cost-per-service
GET    /v1/analytics/inventory-usage
```

### 3.4 Data Models Defined

From `memory/colorgenius-vish-ui-spec.md` §5.2:

- **Formula:** clientId, stylistId, serviceType, components[], processingTime, result, rating, photos, costCalculation
- **FormulaComponent:** productId, productName, shade, amount, unitCost
- **CostCalculation:** productCost, servicePrice, pricingRuleId, salonMargin, marginPercent
- **InventoryItem:** salonId, productId, currentStock, thresholds, unit, usageHistory
- **PricingRule:** salonId, name, serviceTypes[], method, min/max charge, effective dates

### 3.5 Design System Extension

Extended from existing ColorGenius brand tokens:

- **Colors:** 11 tokens (primary, secondary, success, danger, bg, surface, border, text variants)
- **Typography:** 6 levels (Inter for UI, JetBrains Mono for data)
- **Spacing:** 9-token scale (4px to 48px)
- **Primitives:** Built on shadcn/ui + Lucide React + Framer Motion + TanStack Table + React Hook Form + Zod + Recharts

### 3.6 Responsive Behavior
- **Breakpoints:** Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- **Mobile Adaptations:** Table → Card stack, full-screen modals, bottom sheets
- **Tablet Optimizations:** Split-screen layouts, 48px minimum touch targets
- **Performance Targets:** <1.5s first paint, <50ms cost calc, <1s service save, offline read/write

---

## 4. What Iris Needs to Implement Next

### 4.1 Immediate Actions (Week 1)

1. **Review and Approve Spec**
   - Read `memory/colorgenius-vish-ui-spec.md` 
   - Confirm Phase 1 scope approval
   - Provide feedback on any missing requirements

2. **Backend API Implementation**
   - Implement the 12 new API endpoints specified above
   - Extend database schema to support Formula, Inventory, PricingRule tables
   - Integrate with existing ColorGenius authentication and salon/context middleware

3. **Development Environment Setup**
   - Ensure PC2 workspace has Node.js 18+, PostgreSQL, Redis
   - Set up environment variables for API endpoints
   - Configure CORS for cross-machine communication (PC2 ↔ PC3)

### 4.2 Short-Term Actions (Weeks 2-4)

1. **Component Implementation**
   - Begin with `<FormulaCard />` and `<CostCalculator />` core components
   - Implement `<ServiceFlow />` wizard (highest user value)
   - Build `<InventoryItem />` and `<PricingRuleEditor />`
   - Create `<FormulaInsights />` analytics dashboard

2. **Feature Integration**
   - Connect components to new API endpoints
   - Implement optimistic UI updates for better UX
   - Add loading states and error boundaries
   - Implement form validation with React Hook Form + Zod

3. **UX Refinement**
   - Work with che-design to refine visual designs from wireframes to high-fidelity
   - Implement responsive breakpoints and mobile-specific interactions
   - Add accessibility attributes (ARIA labels, keyboard navigation)
   - Ensure touch targets meet 44px minimum

### 4.3 Medium-Term Actions (Weeks 5-8)

1. **Advanced Features**
   - Implement inventory auto-deduction on service save
   - Build pricing rule calculation engine (server-side)
   - Add inventory alert system (banners → modal alerts)
   - Create formula reuse/edit flows with versioning

2. **Performance & Reliability**
   - Implement caching strategies for frequently accessed data
   - Add request deduplication and retry mechanisms
   - Optimize database queries for formula history searches
   - Add offline sync conflict resolution

3. **Testing & Validation**
   - Write unit tests for components and utilities
   - Create integration tests for critical user flows
   - Perform user testing with Pleij Salon (Eiza's team)
   - Monitor performance metrics against targets

### 4.4 Deployment Preparation

1. **Infrastructure**
   - Work with che-devops to provision API endpoints
   - Set up monitoring and logging for new services
   - Configure backup strategies for new data tables

2. **Launch Readiness**
   - Prepare beta test plan with Tiché's salon
   - Create documentation for salon staff training
   - Plan rollout strategy (pilot → full launch)

---

## 5. Blockers and Questions Requiring Resolution

### 5.1 Backend Ownership Decision
**Question:** Who should implement the 12 new API endpoints?
- **Option A:** Iris's team (che-dev) implements endpoints directly
- **Option B:** Work through existing ColorGenius backend team on PC2
- **Impact:** Affects timeline and accountability

### 5.2 POS Integration Priority
**Question:** Which POS systems to target first for Phase 2?
- **Options:** Phorest, SalonBiz, Shortcuts, Zenoti, Insight, Meevo, saloniQ, Envision
- **Impact:** Determines integration effort and revenue capture capability

### 5.3 Scale vs. AI Estimation
**Question:** Should ColorGenius eliminate Vish's $195 Bluetooth scale dependency?
- **Option:** Use AI photo analysis to estimate product quantities (research indicates potential)
- **Impact:** Major competitive differentiator if accurate enough

### 5.4 Pricing Rule Engine Location
**Question:** Where should pricing calculations happen?
- **Option A:** Server-side (more secure, consistent)
- **Option B:** Client-side (faster UI updates, less server load)
- **Impact:** Affects architecture and security considerations

### 5.5 Inventory Source of Truth
**Question:** What is the source for product catalog and unit costs?
- **Options:** Manual entry, Supplier API integration (SalonCentric), Barcode scanning
- **Impact:** Affects data maintenance overhead and accuracy

### 5.6 Offline Support Requirement
**Question:** Is offline support required for MVP or Phase 2?
- **Current Spec:** Full read + create offline, sync when connected
- **Impact:** Affects complexity of state management and sync logic

### 5.7 Mobile App vs. Responsive Web
**Question:** Should we build a native salon app or rely on responsive PWA?
- **Vish Reference:** Primarily iPad app
- **Impact:** Affects development approach and salon floor UX

---

## 6. Instructions for Transferring Files to PC2 Workspace

To make these files accessible to Iris's team on PC2, you have several options:

### Option 1: Direct File Copy (Recommended for Immediate Access)
```bash
# From any machine with access to both workspaces
scp -r /home/jason/.openclaw/workspaces/che/memory/colorgenius-* jason@100.73.101.62:/home/jason/.openclaw/workspaces/che-colorgenius/memory/
scp -r /home/jason/.openclaw/workspaces/che/shared/artifacts/ jason@100.73.101.62:/home/jason/.openclaw/workspaces/che-colorgenius/shared/
```

### Option 2: Git Repository Sync
If ColorGenius has a git repository on PC2:
```bash
# Push Che's workspace changes to shared repo
cd /home/jason/.openclaw/workspaces/che
git add memory/colorgenius-vish-ui-spec.md memory/colorgenius-vish-features-research.md
git commit -m "Add Vish features UI/UX spec for handoff to Iris"
git push origin main

# Then on PC2, pull the changes
cd /home/jason/.openclaw/workspaces/che-colorgenius
git pull origin main
```

### Option 3: Shared Network Access
Both PC2 and the current machine access the same network share:
```bash
# Copy to shared location accessible by both machines
cp -r /home/jason/.openclaw/workspaces/che/memory/colorgenius-* /network/shared/colorgenius-handoff/
cp -r /home/jason/.openclaw/workspaces/che/shared/artifacts/ /network/shared/colorgenius-handoff/
```

### Option 4: Use OpenClaw's sessions_spawn for Cross-Machine Access
```bash
# Spawn a session on PC2 to access files directly
/sessions_spawn task="Access handoff files on PC2" agentId=che-dev runtime=subagent context=fork
```

**Recommended Approach:** Use Option 1 (direct copy) for immediate access, then establish Option 2 (git sync) for ongoing collaboration.

---

## 7. Cross-Brand Synergies to Consider

### 7.1 Pleij Salon Integration (Eiza's Team)
- **Beta Testing:** Tiché's salon is ideal for real-world validation
- **WigViz AR:** Could integrate with ColorGenius for virtual try-on of colored hair
- **Client Booking:** Pleij's Square integration could sync with ColorGenius service history

### 7.2 ByondEdu Integration (PC2)
- **Education Content:** Color techniques and formulas could become ByondEdu courses
- **Certification Tracking:** ByondEdu could track stylist completion of ColorGenius training
- **Shared Research:** Both platforms benefit from hair science and trend data

### 7.3 Agent Social Integration (PC2)
- **Marketing Content:** Maven's team can create social campaigns for "ColorGenius + Vish Features"
- **Before/After Content:** Pleij Salon's transformations feed Agent Social's content calendar
- **Client Acquisition:** Social drives awareness, ColorGenius converts to paying salons

### 7.4 ColorGenius Technical Synergies
- **AI Formulation Core:** Existing ColorGenius AI engine provides the "what to mix"
- **Vish Features Add:** Business operations layer provides the "tracking and charging"
- **Combined Value:** Complete platform that both formulates AND manages color profitability

---

## 8. Implementation Roadmap Summary

### Sprint 1: Foundation (Weeks 1-2)
- [ ] Backend API endpoints for Formula History and Cost Calculator
- [ ] Database schema extensions
- [ ] `<FormulaCard />` and `<CostCalculator />` components
- [ ] Basic Service Entry screen

### Sprint 2: Service Flow (Weeks 3-4)
- [ ] Complete `<ServiceFlow />` wizard
- [ ] Formula reuse/edit functionality
- [ ] Result capture (rating, photos, notes)
- [ ] Client Formula History screen

### Sprint 3: Business Ops (Weeks 5-6)
- [ ] Inventory Dashboard and alert system
- [ ] Pricing Rules Manager
- [ ] Formula Insights analytics
- [ ] Inventory auto-deduction on service save

### Sprint 4: Polish (Weeks 7-8)
- [ ] Responsive refinements and mobile optimizations
- [ ] Offline support implementation
- [ ] Performance optimization to meet targets
- [ ] Pleij Salon beta test and feedback incorporation

---

## 9. Success Criteria

### Phase 1 Launch Readiness
✅ All 8 core Vish features implemented per spec  
✅ API endpoints responding with <200ms latency  
✅ Component library published and consumable  
✅ Responsive design working on mobile/tablet/desktop  
✅ Accessibility compliance (WCAG 2.1 AA)  
✅ Performance targets met: <1.5s FP, <50ms cost calc, <1s service save  
✅ Offline support for critical paths (view history, create service)  
✅ Beta tested with Pleij Salon with positive feedback  

### Quality Gates
✅ Unit test coverage >80% for new components  
✅ Integration tests for critical user flows  
✅ Security review completed for new endpoints  
✅ Documentation updated for salon staff training  
✅ Rollout plan approved by Iris and Eiza  

---

## 10. Next Steps for Iris

1. **Immediate (Today):**
   - Review `memory/colorgenius-vish-ui-spec.md` 
   - Provide scope confirmation or feedback
   - Decide on backend ownership (che-dev vs. existing team)

2. **This Week:**
   - Set up development environment on PC2
   - Begin API endpoint implementation
   - Schedule spec review with che-design

3. **Next 2 Weeks:**
   - Implement core components (FormulaCard, CostCalculator)
   - Connect to backend endpoints
   - Begin UI refinement with design team

4. **Ongoing:**
   - Participate in weekly sync with che-architect for cross-brand coordination
   - Report blockers immediately for escalation
   - Share learnings with Maven's team for marketing preparation

---

**Package Prepared By:** che-architect (subagent)  
**Prepared At:** /home/jason/.openclaw/workspaces/che/handoffs/colorgenius-vish-handoff.md  
**Ready For:** Iris (colorgenius-ceo) and che-dev team on PC2  

*Let me know if you need any specific files copied to PC2 workspace or if you'd like me to spawn a che-dev session to begin implementation.*
# Manual Photo Analysis Fallback — Implementation Plan

## Overview
Implement a manual photo analysis fallback system for ColorGenius beta that activates when AI analysis is unavailable or fails. This allows stylists to manually input hair parameters and receive shade recommendations and formulations.

---

## Phase 1: Foundation (Week 1)

### 1.1 Create Type Definitions
**File:** `packages/web/src/types/manual-analysis.ts`
**Status:** ⬜ Not started
**Estimate:** 2 hours

Tasks:
- Define `ManualAnalysisInput` interface
- Define `ManualAnalysisResult` interface
- Define `RecommendedShade` interface
- Define `ManualAnalysisState` for form management
- Export all types

**Depends on:** None
**Blocks:** Phase 1.2, 1.3

---

### 1.2 Create Database Schema
**File:** SQL migration
**Status:** ⬜ Not started
**Estimate:** 3 hours

Tasks:
- Create `manual_analyses` table
- Create `manual_analysis_recommended_shades` junction table
- Add indexes for performance
- Create migration script

**Depends on:** Phase 1.1
**Blocks:** Phase 2.2

---

### 1.3 Build Analysis Engine
**File:** `packages/web/src/lib/manual-analysis-engine.ts`
**Status:** ⬜ Not started
**Estimate:** 6 hours

Tasks:
- Implement `calculateLiftRequired()`
- Implement `determinePreLighteningNeed()`
- Implement `filterShadesByInputs()`
- Implement `calculateConfidence()`
- Implement `generateWarnings()`
- Implement `recommendDeveloperVolume()`
- Implement `recommendProcessingTime()`
- Unit tests for all functions

**Depends on:** Phase 1.1
**Blocks:** Phase 2.2

---

## Phase 2: UI Components (Week 1-2)

### 2.1 Create Visual Reference Guide
**File:** `packages/web/src/components/VisualReferenceGuide.tsx`
**Status:** ⬜ Not started
**Estimate:** 4 hours

Tasks:
- Build level 1-10 swatch display
- Add level descriptions and names
- Add example photos for each level (stock or generated)
- Make it a reusable modal component
- Add print/export functionality
- Responsive design

**Depends on:** None
**Blocks:** Phase 2.3

---

### 2.2 Build Manual Analysis API Route
**File:** `packages/web/src/app/api/manual-analysis/route.ts`
**Status:** ⬜ Not started
**Estimate:** 4 hours

Tasks:
- Create POST endpoint for manual analysis submission
- Validate input using schema
- Call analysis engine functions
- Return recommended shades
- Store result in database
- Handle errors gracefully

**Depends on:** Phase 1.2, 1.3
**Blocks:** Phase 2.4

---

### 2.3 Build Form Components
**Files:**
- `packages/web/src/app/manual-analysis/components/PhotoUploadWithPreview.tsx`
- `packages/web/src/app/manual-analysis/components/HairLevelSelector.tsx`
- `packages/web/src/app/manual-analysis/components/HairConditionSelector.tsx`
- `packages/web/src/app/manual-analysis/components/UndertoneSelector.tsx`
**Status:** ⬜ Not started
**Estimate:** 8 hours

Tasks:
- PhotoUploadWithPreview: Wrap existing PhotoUploader, add AI failure banner
- HairLevelSelector: Visual 1-10 selector with hex colors
- HairConditionSelector: Card/toggle selector with icons
- UndertoneSelector: Visual picker with warm/cool/neutral options
- All components: TypeScript props, validation, accessibility

**Depends on:** Phase 2.1
**Blocks:** Phase 2.4

---

### 2.4 Build Main Form Page
**File:** `packages/web/src/app/manual-analysis/page.tsx`
**Status:** ⬜ Not started
**Estimate:** 6 hours

Tasks:
- Create step-by-step wizard layout
- Integrate all form components
- Manage form state (React Hook Form or Zustand)
- Implement navigation (next/back/skip)
- Add progress indicator
- Auto-save draft to localStorage
- Responsive layout (mobile-first)
- Error handling and validation

**Depends on:** Phase 2.2, 2.3
**Blocks:** Phase 2.5

---

### 2.5 Build Results Component
**File:** `packages/web/src/app/manual-analysis/components/ShadeRecommendationEngine.tsx`
**Status:** ⬜ Not started
**Estimate:** 5 hours

Tasks:
- Display recommended shades with swatches
- Show match confidence percentages
- Integrate with existing FormulaCard component
- Add "Select Shade" and "Generate Formula" buttons
- Show warnings and processing recommendations
- Add "Edit Inputs" functionality
- Responsive grid layout

**Depends on:** Phase 2.4
**Blocks:** Phase 3.1

---

## Phase 3: Integration (Week 2)

### 3.1 Integrate with Existing Upload Flow
**Files:**
- `packages/web/src/app/upload/page.tsx` (modify)
- `packages/web/src/components/PhotoUploader.tsx` (modify)
**Status:** ⬜ Not started
**Estimate:** 3 hours

Tasks:
- Add AI failure detection in upload flow
- Show "Switch to Manual Analysis" button when AI fails
- Pass photo preview to manual analysis form
- Maintain user context (client ID, etc.)
- Update navigation logic

**Depends on:** Phase 2.5
**Blocks:** Phase 3.2

---

### 3.2 Integrate with Formulation Flow
**File:** `packages/web/src/app/formulate/page.tsx` (modify)
**Status:** ⬜ Not started
**Estimate:** 2 hours

Tasks:
- Accept manual analysis results as input
- Pre-populate formulation with manual inputs
- Skip AI analysis step if manual data exists
- Update results page to show manual analysis badge

**Depends on:** Phase 3.1
**Blocks:** Phase 3.3

---

### 3.3 Add Offline Mode Support
**Files:**
- Service worker configuration
- Offline storage utilities
**Status:** ⬜ Not started
**Estimate:** 4 hours

Tasks:
- Detect offline status
- Store manual analysis inputs in IndexedDB
- Queue for sync when connection restored
- Show offline indicator
- Test offline workflow end-to-end

**Depends on:** Phase 3.2
**Blocks:** Phase 4.1

---

## Phase 4: Polish & Testing (Week 2-3)

### 4.1 Testing
**Status:** ⬜ Not started
**Estimate:** 6 hours

Tasks:
- Unit tests for analysis engine
- Component tests with React Testing Library
- End-to-end tests with Playwright
- Test all hair condition + level combinations
- Test offline mode
- Test AI failure fallback
- Cross-browser testing (Chrome, Safari, Firefox)

**Depends on:** Phase 3.3
**Blocks:** Phase 4.2

---

### 4.2 Styling & UX Polish
**Status:** ⬜ Not started
**Estimate:** 4 hours

Tasks:
- Match existing app design system
- Add animations (Framer Motion for step transitions)
- Add loading states
- Add empty/error states
- Ensure accessibility (WCAG 2.1 AA)
- Keyboard navigation support
- Screen reader labels

**Depends on:** Phase 4.1
**Blocks:** Phase 4.3

---

### 4.3 Documentation
**Status:** ⬜ Not started
**Estimate:** 2 hours

Tasks:
- Update README with manual analysis feature
- Document API endpoints
- Add component storybook entries (if applicable)
- Update user-facing help docs

**Depends on:** Phase 4.2
**Blocks:** None (final phase)

---

## Timeline Summary

| Phase | Tasks | Estimate | Week |
|-------|-------|----------|------|
| 1: Foundation | 1.1, 1.2, 1.3 | 11 hours | Week 1 |
| 2: UI Components | 2.1, 2.2, 2.3, 2.4, 2.5 | 27 hours | Week 1-2 |
| 3: Integration | 3.1, 3.2, 3.3 | 9 hours | Week 2 |
| 4: Polish & Test | 4.1, 4.2, 4.3 | 12 hours | Week 2-3 |
| **Total** | | **~59 hours** | **2-3 weeks** |

---

## Risk Factors

| Risk | Impact | Mitigation |
|------|--------|------------|
| Stock photos for level guide unavailable | Medium | Generate color swatches programmatically; source free stock photos |
| Analysis engine accuracy concerns | High | Validate with professional colorists; iterate based on feedback |
| Offline mode complexity | Medium | Start with basic offline detection; enhance in v1.1 |
| Mobile UI issues | Medium | Mobile-first design; test on actual tablets (salon use case) |

---

## Success Criteria

- [ ] Stylist can complete manual analysis in under 2 minutes
- [ ] Recommended shades match professional colorist expectations
- [ ] System gracefully handles AI failure without user confusion
- [ ] Offline mode allows form completion and syncs on reconnect
- [ ] All components pass accessibility audit
- [ ] End-to-end tests cover all user paths

---

*Plan Version: 1.0*
*Target: ColorGenius Beta Launch — August 2026*
*Estimated Total Effort: ~60 hours (1 developer, 2-3 weeks)*

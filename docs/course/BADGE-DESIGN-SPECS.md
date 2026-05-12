# COLORgenius Pro Certification Badge Design Specs
## Digital Assets for LinkedIn, UpLook, Social Media

---

## Badge System Overview

| Badge Type | Description | Earned By |
|-----------|-------------|-----------|
| **Level 1** | COLORgenius Pro Certified | Complete all 6 modules + pass exam |
| **Level 2** | COLORgenius Advanced Certified | L1 + 6 months usage + 50+ formulations |
| **Level 3** | COLORgenius Master Colorist | L2 + mentor others + brand partnership |
| **Brand Badges** | [Brand Name] Certified | Complete brand-specific module |
| **Specialty Badges** | Grey Coverage Expert, Blonding Specialist, etc. | Complete specialty module |

---

## Primary Badge: COLORgenius Pro Certified

### Design Concept
- **Shape:** Circular badge with hexagonal inner element (evokes molecular/chemical structure)
- **Style:** Modern, premium, professional
- **Feel:** Trustworthy, innovative, authoritative
- **Inspiration:** Apple WWDC badges, Salesforce Trailhead, Google certifications

### Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Primary Background | Dark Teal | #0A4D4D |
| Secondary Accent | Bright Cyan | #00D4AA |
| Gold Accent (for levels) | Champagne Gold | #D4AF37 |
| Text Primary | White | #FFFFFF |
| Text Secondary | Light Grey | #E0E0E0 |
| Border Ring | Cyan Glow | #00D4AA (40% opacity) |

### Badge Dimensions

**Digital Badge (Primary):**
- Size: 400 x 400 pixels
- Format: PNG (transparent background) + SVG (scalable)
- Safe area: 20px padding from edges

**LinkedIn Badge:**
- Size: 200 x 200 pixels
- Format: PNG
- Optimized for profile "Licenses & Certifications" section

**UpLook Badge:**
- Size: 300 x 300 pixels
- Format: PNG + SVG
- Integrates with UpLook profile badge system

**Social Media Share:**
- Size: 1080 x 1080 pixels (Instagram square)
- Size: 1200 x 630 pixels (LinkedIn/Twitter share card)
- Format: PNG + JPG

**Email Signature:**
- Size: 120 x 120 pixels
- Format: PNG
- Small but recognizable

### Badge Elements

**Outer Ring:**
- Circular border, 8px width
- Color: Gradient from #0A4D4D to #00D4AA
- Subtle glow effect (box-shadow: 0 0 20px rgba(0,212,170,0.3))

**Inner Hexagon:**
- Six-sided shape, rotated 90° (point up)
- Fill: #0A4D4D with subtle gradient
- Border: 2px solid #00D4AA

**Center Icon:**
- Stylized "CG" monogram or hair strand + molecule icon
- Color: White (#FFFFFF)
- Size: 60% of inner hexagon

**Text Elements:**
- Top arc: "COLORgenius" (small, uppercase, letter-spacing: 2px)
- Center: "PRO" (large, bold)
- Bottom arc: "CERTIFIED" (small, uppercase)

**Level Indicator:**
- Bottom of badge: 1-3 stars or Roman numerals
- Color: Champagne Gold (#D4AF37) for advanced levels
- Level 1: No stars (or single dot)
- Level 2: Two stars
- Level 3: Three stars + "MASTER" text

---

## Brand-Specific Badges

### Concept
- Same base badge design
- Brand color accent in outer ring
- Brand logo (small, approved) in bottom section
- "[Brand Name] Certified" text

### Examples:

| Brand | Accent Color | Hex |
|-------|-------------|-----|
| Moroccanoil | Signature Blue | #005F7F |
| Davines | Sage Green | #7BA05B |
| Wella | Red/Orange | #E31837 |
| Redken | Black/Red | #000000 |
| Schwarzkopf | Purple | #662D91 |
| Matrix | Teal | #00857D |

### Design Rules:
- Brand color only in outer ring gradient (not inner hexagon)
- Brand logo max 15% of badge height
- Must maintain COLORgenius primary identity
- "Certified in [Brand Name]" text, not replacing "PRO CERTIFIED"

---

## Specialty Badges

| Specialty | Icon Concept | Color Accent |
|-----------|-------------|--------------|
| Grey Coverage Expert | Silver hair strand | Silver #C0C0C0 |
| Blonding Specialist | Lightning bolt + blonde strand | Yellow #FFD700 |
| Color Correction Master | Eraser + color wheel | Orange #FF6B35 |
| Vivid Color Artist | Rainbow spectrum | Magenta #FF00FF |
| Men's Color Expert | Male silhouette + scissors | Navy #000080 |
| Balayage Master | Hand with brush | Rose Gold #B76E79 |

---

## Certificate Design

### Digital Certificate (PDF)
- Size: US Letter (8.5 x 11 inches) or A4
- Orientation: Landscape
- Background: Subtle geometric pattern in #0A4D4D at 5% opacity
- Border: 2px solid #00D4AA with corner flourishes

### Certificate Elements:
1. **Header:** "COLORgenius" logo + "Pro Certification" 
2. **Statement:** "This certifies that [Name] has successfully completed"
3. **Course Title:** "COLORgenius Pro Certification Program"
4. **Description:** "12-hour comprehensive course in AI-assisted color formulation"
5. **Date:** Date of completion
6. **Certification ID:** Unique identifier (e.g., CG-PRO-2026-001234)
7. **Badge:** Large badge graphic (200x200px)
8. **Signature:** Jason Opland, Founder (digital signature)
9. **QR Code:** Links to verification page at colorgenius.com/verify
10. **Footer:** "Verify at colorgenius.com/verify/[ID]"

### Print Certificate:
- Same design as digital
- Printed on 110lb cardstock
- Optional: Foil stamp for badge area (gold foil)
- Optional: Embossed seal sticker

---

## Social Media Share Cards

### Instagram/TikTok Announcement
- Size: 1080 x 1080
- Background: Dark teal gradient
- Center: Large badge (400x400)
- Text: "I'M COLORgenius PRO CERTIFIED 🎨"
- Subtext: "12 hours. 6 modules. Precision formulation."
- Hashtags area: #COLORgenius #ColoristLife #HairEducation
- User handle area: @[username]

### LinkedIn Announcement
- Size: 1200 x 627
- Layout: Badge left (300x300), text right
- Headline: "COLORgenius Pro Certified"
- Body: "Just completed 12 hours of AI-assisted color formulation training. Ready to deliver precision results for every client."
- CTA: "Learn more: colorgenius.com/academy"

### Twitter/X Announcement
- Size: 1200 x 675
- Badge centered, large
- Text: "COLORgenius Pro Certified ✓"
- "12 hours of advanced formulation training. Let's get precise. 🎨"

---

## UpLook Integration Specs

### Profile Badge Display
- Size: 150 x 150 pixels on profile
- Hover: Tooltip shows certification details
- Click: Links to verification page

### Badge Directory
- Page: uplook.com/certifications/colorgenius
- Grid of certified professionals
- Filter by: Location, specialty, brand certifications
- Badge displayed prominently on profile cards

### Verification API
- Endpoint: `GET /api/v1/verify/:certification_id`
- Response: `{ name, certification_date, level, specialties, brands, status: "active" }`
- UpLook consumes this to display verified badges

---

## Email Signature Badge

### Layout
```
[Name]
[Title] | [Salon Name]
[Phone] | [Email]

[COLORgenius Badge: 120x120px]
"COLORgenius Pro Certified"
Verify: colorgenius.com/verify/[ID]
```

### HTML Email Signature Code
```html
<div style="font-family: Arial, sans-serif; margin-top: 20px;">
  <img src="https://colorgenius.com/badges/pro-certified-120.png" 
       alt="COLORgenius Pro Certified" 
       width="120" height="120"
       style="display: block; margin-bottom: 5px;"
  />
  <div style="font-size: 11px; color: #0A4D4D; font-weight: bold;">
    COLORgenius Pro Certified
  </div>
  <div style="font-size: 10px; color: #666;">
    Verify: <a href="https://colorgenius.com/verify/CG-PRO-2026-001234" style="color: #00D4AA;">colorgenius.com/verify/CG-PRO-2026-001234</a>
  </div>
</div>
```

---

## Production Assets Needed

### Immediate (Week 1):
- [ ] Primary badge (400x400 PNG/SVG)
- [ ] LinkedIn badge (200x200 PNG)
- [ ] UpLook badge (300x300 PNG/SVG)
- [ ] Instagram share card (1080x1080)
- [ ] LinkedIn share card (1200x627)
- [ ] Certificate template (PDF)

### Phase 2 (Week 3):
- [ ] Brand-specific badges (6 variants)
- [ ] Specialty badges (6 variants)
- [ ] Level 2 + Level 3 badges
- [ ] Animated badges (GIF/WebP) for social
- [ ] Email signature generator

### Tools for Creation:
**Option A — Canva:**
- Team account: Canva Pro ($12.99/mo)
- Templates: Start from scratch or modify certification templates
- Export: PNG, SVG, PDF

**Option B — Figma:**
- Free for small teams
- Better for precise design systems
- Export: All formats
- Collaboration: Real-time with team

**Option C — Designer Hire:**
- Budget: $500-1500 for full badge system
- Platform: 99designs, Dribbble, or Upwork
- Deliverables: All formats + source files

---

## File Naming Convention

```
colorgenius-badge-[type]-[size]-[version].[format]

Examples:
colorgenius-badge-pro-400x400-v1.svg
colorgenius-badge-pro-200x200-v1.png
colorgenius-badge-linkedin-200x200-v1.png
colorgenius-badge-uplook-300x300-v1.svg
colorgenius-share-instagram-1080x1080-v1.png
colorgenius-share-linkedin-1200x627-v1.png
colorgenius-certificate-template-v1.pdf
colorgenius-badge-moroccanoil-400x400-v1.svg
colorgenius-badge-grey-coverage-400x400-v1.svg
colorgenius-email-signature-badge-v1.png
```

---

## Verification Page Design

### URL: colorgenius.com/verify/[ID]

### Layout:
1. **Header:** COLORgenius logo
2. **Verification Status:** Large green checkmark + "Verified"
3. **Badge Display:** Large badge (300x300)
4. **Certificant Info:**
   - Name: [First Last]
   - Certification: COLORgenius Pro Certified
   - Level: 1 / 2 / 3
   - Date: [Month Day, Year]
   - ID: CG-PRO-2026-001234
5. **Specialties:** List of specialty badges earned
6. **Brand Certifications:** List of brand-specific certifications
7. **QR Code:** For mobile verification
8. **Footer:** "Verify all COLORgenius certifications at colorgenius.com/verify"

### Security:
- IDs are unique and sequential
- Page is public (anyone can verify)
- No sensitive info displayed (just name, cert details)
- API rate-limited to prevent scraping

---

## Implementation Checklist

### Design Phase (Week 1):
- [ ] Finalize badge design in Figma/Canva
- [ ] Create all size variants
- [ ] Design certificate template
- [ ] Design social share cards
- [ ] Get team feedback, iterate

### Development Phase (Week 2):
- [ ] Export all assets (PNG, SVG, PDF)
- [ ] Build verification page
- [ ] Implement QR code generation
- [ ] Create email signature generator
- [ ] Set up badge delivery system (auto-email upon certification)

### Integration Phase (Week 3):
- [ ] UpLook badge API integration
- [ ] LinkedIn badge upload system
- [ ] Social share card generation
- [ ] Certificate PDF generation
- [ ] Test end-to-end certification flow

### Launch Phase (Week 4):
- [ ] Upload to course platform
- [ ] Announce to beta stylists
- [ ] Monitor verification page traffic
- [ ] Collect feedback, iterate

---

## Budget Estimate

| Item | Cost | Time |
|------|------|------|
| Canva Pro subscription | $13/mo | Ongoing |
| Figma (free tier) | $0 | Ongoing |
| Designer (if outsourced) | $500-1500 | One-time |
| Badge asset storage (CDN) | $10-20/mo | Ongoing |
| Certificate PDF generation service | $30-50/mo | Ongoing |
| QR code generation API | $0 (free tier) | Ongoing |
| **Total First Month** | **~$60-1600** | — |
| **Ongoing Monthly** | **~$50-80** | — |

---

## Next Steps

1. **Choose design tool** — Figma vs Canva vs hire designer
2. **Create first badge** — Start with primary Pro Certified badge
3. **Team review** — Get feedback from Jason, Che, beta stylists
4. **Iterate** — Refine based on feedback
5. **Scale** — Create remaining badge variants

---

*Prepared by: Iris (COLORgenius CEO)*  
*Date: 2026-05-10*

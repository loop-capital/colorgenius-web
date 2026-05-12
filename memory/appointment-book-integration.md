# Salon Appointment Book Integration — Research Brief

**ColorGenius Research | May 2026**

---

## 1. Major US Salon Booking Platforms

### Fresha
- **Market share:** Largest globally; 120,000+ partner businesses, 450,000+ professionals, 1B+ appointments booked. Dominant in UK/EU, growing fast in US.
- **API:** ❌ **Not public.** No self-service developer portal. Partner integrations exist (e.g., Twilio) but require direct partnership agreement. Reddit/forum complaints confirm third-party devs cannot access API freely.
- **Webhooks:** ❌ Not available publicly.
- **Pricing:** Core platform is free; takes 20% marketplace fee for clients sourced through Fresha. Premium add-ons available.
- **Integration route:** CSV export/import, or negotiate direct partnership.

### Vagaro
- **Market share:** Strong in North America; 221,000+ businesses per some estimates. Very popular with US salons/spas.
- **API:** ⚠️ **Limited / private.** Developer Features category exists on support site but no public API docs found. Apify scrapers suggest data is accessible but not via official API.
- **Webhooks:** ✅ **Yes** — webhook support documented for events (appointment updates, etc.). Requires subscription.
- **Pricing:** $30/month solo, $50/month pro (single location). Multi-location pricing higher.
- **Integration route:** Webhooks for event-driven updates; no confirmed public REST API for reading appointments.

### Square Appointments
- **Market share:** Huge installed base via Square POS ecosystem. Default choice for salons already using Square.
- **API:** ✅ **Public, well-documented.** Bookings API is GA (generally available). RESTful API with sandbox environment.
- **Webhooks:** ✅ **Full webhook support** — `booking.created`, `booking.updated`, `booking.cancelled` events documented.
- **Pricing:** Free for individuals; paid tiers for multi-staff ($60+/month).
- **Integration route:** Direct API + webhooks. OAuth 2.0. Best-in-class developer experience.

### Boulevard
- **Market share:** Fastest-growing "premium" platform. Targets high-end salons/spas.
- **API:** ✅ **Public.** GraphQL Admin API + Client API. Developer portal with sandbox. SDK available (Book SDK).
- **Webhooks:** ✅ **Yes** — webhook management API documented. GraphQL-based.
- **Pricing:** Not transparent; enterprise-tier platform. API access appears included in higher tiers.
- **Integration route:** Direct GraphQL API + webhooks. Strong developer experience. Premium salons only.

### GlossGenius
- **Market share:** Rising star, mobile-first, popular with independent stylists and small salons.
- **API:** ❌ **Not public.** No developer portal found. Integrates with Google Calendar, Square, Stripe, QuickBooks — but no third-party API.
- **Webhooks:** ❌ No public webhook support.
- **Pricing:** $24/month basic, higher tiers for multi-location.
- **Integration route:** Calendar sync via Google Calendar/iCal as bridge only.

### Booksy
- **Market share:** Popular with barbershops and male grooming. Global presence (US, UK, EU).
- **API:** ⚠️ **Alpha / limited.** `alpha.docs.booksy.net` exists with OAuth2-based public API, but appears early-stage.
- **Webhooks:** ❌ Not documented.
- **Pricing:** Subscription model; varies by country.
- **Integration route:** Unofficial reverse-engineered APIs exist on GitHub. Official API too immature for production.

### Mindbody
- **Market share:** Legacy player; strong in fitness but significant salon/spa presence.
- **API:** ✅ **Public.** SOAP/REST API (v6.0 documented). Developer portal requires account + activation per business owner.
- **Webhooks:** ⚠️ Limited webhook support; primarily polling-based API.
- **Pricing:** Higher-tier; legacy enterprise contracts.
- **Integration route:** API available but SOAP-heavy, more complex. Better for large spas than salons.

---

## 2. Integration Approaches

| Approach | Feasibility | Best For |
|----------|-------------|----------|
| **Direct API** | Best for Square, Boulevard, Mindbody. Fresha/Vagaro/GlossGenius/ Booksy lack public APIs. | Real-time, two-way sync. Full data access. |
| **Webhook-based** | Square (excellent), Boulevard (GraphQL webhooks), Vagaro (basic). Others: no. | Event-driven: get notified when appointments created/updated/cancelled. |
| **Calendar sync (Google/iCal)** | Universal fallback. GlossGenius, Vagaro, Fresha all sync to Google Calendar. | MVP bridge when API unavailable. Read-only, lossy (service type mapping unreliable). |
| **CSV import/export** | All platforms support. | One-time bulk import. Not suitable for ongoing sync. |

---

## 3. ColorGenius MVP Recommendation

### Prioritize These 2 Platforms

#### 1. Square Appointments — **First Priority**
- Why: Public API, webhooks, sandbox, huge US salon penetration, free tier attracts indies.
- Data available: appointment time, client name (via Customers API), service type (via Catalog API), stylist (via Team API), location.
- Effort: **Low** — 1-2 weeks for basic read-only sync. OAuth flow is standard.
- Approach: REST API polling + webhooks for real-time updates.

#### 2. Boulevard — **Second Priority (Premium Segment)**
- Why: Public GraphQL API, webhooks, targets exactly the high-end salon segment ColorGenius wants.
- Data available: appointments, clients, services, staff — via GraphQL queries.
- Effort: **Medium** — 2-3 weeks. GraphQL learning curve. Enterprise onboarding may require partnership discussion.
- Approach: GraphQL API + webhook subscriptions.

### For Platforms Without API (Fresha, GlossGenius, Vagaro)
**Calendar sync bridge via Google Calendar**
- ColorGenius connects to stylists' Google Calendar.
- Reads appointment blocks. Extracts client name from title, time from event.
- Service type: unreliable — may need manual mapping or post-appointment confirmation.
- Stylist: known from which calendar stream.
- Effort: **Low** — 1 week. Uses Google Calendar API (standard).

---

## 4. Data We Need

| Field | Square API | Boulevard API | Google Calendar Bridge |
|-------|-----------|-------------|------------------------|
| Appointment time | ✅ Bookings API | ✅ Appointments query | ✅ Event start/end |
| Client name | ✅ Customers API | ✅ Clients query | ⚠️ From event title |
| Service type | ✅ Catalog API | ✅ Services query | ❌ Usually missing |
| Stylist | ✅ Team API | ✅ Staff query | ✅ Known by calendar |
| Location | ✅ Locations API | ✅ Location query | ❌ Missing |

---

## 5. Effort Estimates

| Integration | Approach | Time |
|-----------|----------|------|
| Square Appointments | Direct API + Webhooks | 1–2 weeks |
| Boulevard | GraphQL API + Webhooks | 2–3 weeks |
| Google Calendar Bridge | Calendar sync (fallback) | 1 week |
| Vagaro | Webhooks only (if accessible) | TBD — need to test webhook payload depth |
| Fresha | CSV / manual only | N/A — no API path |

---

## 6. Open Questions

1. What booking platform does **Pleij Salon** currently use? This should override the above priority list if it's Fresha/Vagaro/GlossGenius.
2. Does Pleij sync their booking calendar to Google Calendar? If yes, the calendar bridge works immediately.
3. For Vagaro: need to verify webhook payloads include service type and client name, or only appointment IDs requiring follow-up API calls.
4. For Boulevard: confirm API access tier — is it included in all plans or enterprise-only?

---

## Bottom Line

**Build for Square first.** Best API, biggest US footprint, lowest integration effort. **Add Boulevard second** for premium salons. **Implement Google Calendar bridge as universal fallback** for every other platform. Do not invest in Fresha/GlossGenius direct API integration until they open their APIs.

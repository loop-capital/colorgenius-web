# UpLook Integration Spec — ColorGenius Gallery → getuplook.com

## Overview

The ColorGenius public consumer gallery links every featured post to its creator's UpLook profile on `getuplook.com`. When a consumer sees a hair color they love, they tap "Book this stylist on UpLook" and are deep-linked to the stylist's UpLook profile page where they can view availability, services, and book an appointment.

**Key principle:** UpLook is the booking surface. ColorGenius is the discovery surface. We drive qualified, color-intent consumers to UpLook.

---

## Data Model

### Stylist UpLook Linkage

Added to the `Stylist` model:

```prisma
model Stylist {
  // ... existing fields ...
  uplook_user_id     String?  // UpLook internal user UUID
  uplook_profile_url String?  // Full URL: https://getuplook.com/professional/:slug
  gallery_approved   Boolean  @default(false) // Can appear in public gallery
}
```

### Gallery Post UpLook Linkage

In `GalleryPost`:

```prisma
model GalleryPost {
  // ... existing fields ...
  stylist_uplook_profile_url String   // Denormalized for fast reads
  stylist_uplook_user_id     String?  // For analytics/attribution
}
```

Denormalizing `stylist_uplook_profile_url` on the gallery post avoids a JOIN when rendering the public gallery feed, which is our highest-traffic endpoint.

---

## UpLook Deep-Linking Protocol

### URL Format

```
https://getuplook.com/professional/:uplook_slug?ref=colorgenius&cg_post=:gallery_post_id&cg_color=:color_tag
```

### Query Parameters

| Param | Required | Description |
|-------|----------|-------------|
| `ref` | Yes | Always `colorgenius`. Enables UpLook to attribute traffic source. |
| `cg_post` | No | ColorGenius `gallery_post_id`. Enables UpLook to show "Client loved this color" context banner. |
| `cg_color` | No | Color tag from the post (e.g., `cool-blonde-balayage`). Enables UpLook to auto-filter services. |

### Example URLs

```
# Full deep link with context
https://getuplook.com/professional/sarah-marie-pleij?ref=colorgenius&cg_post=gp_abc123&cg_color=cool-blonde-balayage

# Minimal link (stylist profile only)
https://getuplook.com/professional/sarah-marie-pleij?ref=colorgenius
```

---

## Flow Diagram

```
Consumer Gallery (ColorGenius)
         │
         ▼
    ┌─────────┐
    │ Browse  │ ──→ Sees color they love
    └────┬────┘
         │
         ▼
    ┌────────────────────────────┐
    │ "Book this stylist on UpLook" │
    │ Deep-link button             │
    └─────────────┬──────────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │ UpLook opens              │
    │ - Shows stylist profile   │
    │ - Context banner: "ColorGenius client loved this look" │
    │ - Auto-filters: Balayage, Blonde services │
    └─────────────┬─────────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │ Consumer books appointment  │
    │ UpLook tracks attribution   │
    └─────────────────────────────┘
```

---

## Sync Mechanism: Stylist → UpLook Profile Linkage

### Option A: Manual (Phase 1 — Beta)

Stylist pastes their UpLook profile URL in ColorGenius settings. We validate the URL domain is `getuplook.com`.

```typescript
// Dashboard → Settings → Integrations
POST /api/stylist/uplook-link
Body: { uplook_profile_url: string }

// Validation
function validateUpLookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'getuplook.com' 
        && parsed.pathname.startsWith('/professional/');
  } catch {
    return false;
  }
}
```

### Option B: OAuth/API Sync (Phase 2)

UpLook exposes an API endpoint for ColorGenius to:
- Look up a stylist by email → get `uplook_user_id` and `uplook_slug`
- Validate the linkage

```
GET https://api.getuplook.com/v1/professionals/lookup?email=:stylist_email
Headers: { "Authorization": "Bearer {UPLOOK_API_KEY}" }

Response: {
  user_id: string,
  slug: string,
  profile_url: string,
  verified: boolean,
  rating: number,
  review_count: number
}
```

### Option C: Webhook Bi-Directional Sync (Phase 3)

- UpLook notifies ColorGenius when a booking from a ColorGenius referral completes
- ColorGenius notifies UpLook when a stylist's gallery_approved status changes

---

## Gallery Post → UpLook Link Generation

### Server-Side Link Builder

```typescript
// lib/uplook.ts

interface UpLookLinkParams {
  uplookProfileUrl: string;
  galleryPostId: string;
  colorTag?: string;
}

export function buildUpLookDeepLink(params: UpLookLinkParams): string {
  const url = new URL(params.uplookProfileUrl);
  url.searchParams.set('ref', 'colorgenius');
  
  if (params.galleryPostId) {
    url.searchParams.set('cg_post', params.galleryPostId);
  }
  
  if (params.colorTag) {
    url.searchParams.set('cg_color', params.colorTag);
  }
  
  return url.toString();
}

// Usage in API response
function enrichGalleryPost(post: GalleryPost) {
  return {
    ...post,
    uplook_booking_url: post.stylist_uplook_profile_url 
      ? buildUpLookDeepLink({
          uplookProfileUrl: post.stylist_uplook_profile_url,
          galleryPostId: post.id,
          colorTag: post.season_tag || post.communityPost.tags[0]
        })
      : null
  };
}
```

### Frontend Deep-Link Button

```tsx
// components/gallery/BookOnUpLookButton.tsx

interface Props {
  uplookBookingUrl: string | null;
  stylistName: string;
}

export function BookOnUpLookButton({ uplookBookingUrl, stylistName }: Props) {
  if (!uplookBookingUrl) {
    return (
      <button disabled className="opacity-50 cursor-not-allowed">
        Booking unavailable
      </button>
    );
  }

  return (
    <a
      href={uplookBookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="uplook-book-btn"
      data-event="uplook_deep_link_click"
      data-stylist={stylistName}
    >
      <UpLookLogo className="w-4 h-4" />
      Book {stylistName} on UpLook
    </a>
  );
}
```

---

## Analytics & Attribution

### Events Tracked (ColorGenius → Analytics)

| Event | Properties | Description |
|-------|-----------|-------------|
| `gallery.post.view` | `post_id`, `stylist_id` | Consumer viewed post detail |
| `gallery.uplook.click` | `post_id`, `stylist_id`, `has_context` | Clicked "Book on UpLook" |
| `gallery.uplook.conversion` | `post_id`, `stylist_id` | Tracked via UpLook webhook |

### UpLook Attribution Data

UpLook stores the `ref=colorgenius` parameter and tracks:
- Traffic source: `colorgenius`
- Referred by post: `cg_post`
- Color intent: `cg_color`
- Conversion: booking completion

### Revenue Attribution (Future)

When UpLook supports referral fees:
```
ColorGenius → UpLook referral → Booking completed → % fee to ColorGenius
```

---

## Security & Validation

### URL Validation Rules

1. **Domain whitelist**: Only `getuplook.com` or `www.getuplook.com`
2. **Path check**: Must include `/professional/`
3. **HTTPS only**: Reject HTTP URLs
4. **No query injection**: Strip existing query params before adding ours

### Rate Limiting

- `GET /api/gallery/public` — 100 req/min (public, unauthenticated)
- Deep-link generation is stateless and uncached (URLs contain post IDs)

### Privacy

- Gallery posts never expose stylist email or phone
- Consumer fingerprint hashes are one-way (SHA-256 of IP + UA)
- UpLook only receives public gallery post ID, no client data

---

## Implementation Checklist

- [ ] Add `uplook_user_id`, `uplook_profile_url`, `gallery_approved` to Stylist model
- [ ] Add `stylist_uplook_profile_url`, `stylist_uplook_user_id` to GalleryPost model
- [ ] Create `POST /api/stylist/uplook-link` endpoint with URL validation
- [ ] Implement `buildUpLookDeepLink()` utility
- [ ] Add "Book on UpLook" CTA to GalleryPost card + detail views
- [ ] Add `ref=colorgenius` analytics event tracking
- [ ] Document UpLook API endpoint for Phase 2 OAuth sync
- [ ] Create UpLook webhook receiver for booking attribution (Phase 3)

---

## Appendix: UpLook API Contract (Proposed)

For Phase 2, request these endpoints from UpLook team:

```
# Lookup stylist by email
GET /v1/professionals/lookup?email={email}
→ { user_id, slug, profile_url, verified }

# Report gallery feature
POST /v1/partners/colorgenius/gallery-feature
Body: { professional_id, post_id, featured_at, color_tags }
→ { success: true }

# Booking attribution webhook (UpLook → ColorGenius)
POST https://colorgenius.ai/api/webhooks/uplook/booking
Headers: { "X-UpLook-Signature": "..." }
Body: { 
  professional_id, 
  booking_id, 
  client_id?, 
  referral_post_id?, 
  service_type,
  booking_value_cents,
  booked_at 
}
```

# ColorGenius ↔ GetUpLook.com Integration Spec

**Status: real and implemented on the ColorGenius side, as of 2026-09-17. GetUpLook has no implementation yet — this is what its formula-discovery UI needs to be built against.**

> A previous version of this document described a different, unrelated concept
> (deep-linking a gallery post to a stylist's UpLook profile to book an
> appointment, via `uplook_user_id`/`gallery_approved` fields). Those fields were
> never added to the schema and no code implements that flow — it's a separate,
> unbuilt idea. This document replaces it and covers only the formula
> marketplace integration described below, which is real and tested.

## What this integration actually is

A hairstylist (or a color manufacturer/brand) publishes a formula for sale in
ColorGenius's marketplace. That listing gets a short public **share code**
(`CG-XXXXXXXX`). GetUpLook.com is the **consumer discovery surface**: a
consumer searches/browses formulas there, finds one they want, and either:

- shares the share code with their own hairstylist so that stylist can look
  it up and purchase it in ColorGenius, or
- submits a request (name, email, optional notes/appointment date) that lands
  directly in the *listing's creator's* inbox inside ColorGenius.

ColorGenius never needs to know GetUpLook's user accounts or send it any
private client data. All three endpoints below are **public, unauthenticated
by design** — matching the model consumers actually browse under (no
ColorGenius login), and mirroring how a receipt/order lookup page works
elsewhere on the web. There is currently no API key or rate limiting on these
endpoints (see **Open items** below).

Base URL: `https://colorgenius.co`

---

## 1. Search / browse formulas

```
GET /api/v1/uplook/formulas
```

Query params (all optional):

| Param | Type | Description |
|---|---|---|
| `q` | string | Free-text search across title, description, and tags |
| `category` | string | Exact category match (case-insensitive) |
| `price_min` / `price_max` | integer (cents) | Price range filter |
| `cursor` | string | Pass the previous response's `meta.cursor` to page forward |
| `limit` | integer, 1–50 | Default 20 |

Response:

```json
{
  "success": true,
  "data": [
    {
      "share_code": "CG-TESTUPLOOK1",
      "title": "Sunset Copper Balayage",
      "description": "A warm copper balayage formula for medium-dark hair",
      "category": "balayage",
      "tags": ["copper", "warm", "balayage"],
      "price_cents": 1999,
      "photo_url": null,
      "rating": "0",
      "review_count": 0,
      "purchase_count": 0,
      "creator_name": "Uplook Test",
      "creator_avatar": null,
      "creator_verified": false
    }
  ],
  "meta": { "cursor": "8007cf9d-...", "hasMore": false }
}
```

The recipe itself (color/developer ingredients, ratios) is **never** included
here or in the detail lookup below — that's the product being sold, withheld
until a real purchase happens inside ColorGenius. Verified live against the
production database on 2026-09-17.

## 2. Formula detail by share code

```
GET /api/marketplace/lookup/:code
```

`:code` accepts either `CG-XXXXXXXX` or just `XXXXXXXX` (the `CG-` prefix is
normalized automatically). This is what GetUpLook's formula detail page
should call once a consumer picks a result from search.

Response:

```json
{
  "success": true,
  "data": {
    "share_code": "CG-TESTUPLOOK1",
    "formula": {
      "id": "8007cf9d-...",
      "title": "Sunset Copper Balayage",
      "description": "A warm copper balayage formula for medium-dark hair",
      "creator_name": "Uplook Test",
      "creator_avatar": null,
      "category": "balayage",
      "tier": "premium",
      "score": 50,
      "per_use_cents": 0,
      "rating": "0",
      "usage_count": 0,
      "tags": ["copper", "warm", "balayage"]
    }
  }
}
```

404 with `{ "success": false, "error": { "code": "NOT_FOUND", ... } }` if the
code doesn't match an active listing.

## 3. Consumer → stylist request ("share with my stylist")

```
POST /api/marketplace/client-requests
Content-Type: application/json

{
  "share_code": "CG-TESTUPLOOK1",
  "client_name": "Jane Doe",
  "client_email": "jane@example.com",
  "consumer_notes": "Want this for my next appointment",
  "appointment_date": "2026-10-01"
}
```

`share_code` and `client_name` are required; the rest are optional. This
creates a `formula_client_requests` row that lands directly in the listing
creator's authenticated request inbox (`GET /api/marketplace/client-requests`
from inside ColorGenius, already built and in use).

---

## What GetUpLook needs to build

1. A search/browse UI calling endpoint 1, with a search box (`q`) and
   category filter.
2. A formula detail page, reached from a search result's `share_code`,
   calling endpoint 2.
3. A "share this with my stylist" form on the detail page, calling endpoint 3.
4. Nothing else is required to ship the consumer-facing loop described above
   — all three endpoints are live in production today.

## Open items (not built, flagged rather than assumed)

- **No rate limiting or abuse protection** on any of these three public
  endpoints yet. Fine for initial integration; revisit before GetUpLook
  drives meaningful traffic.
- **No API key mechanism exists or is required** — these are intentionally
  public reads/writes, not gated. If GetUpLook's own architecture needs a
  server-to-server credential for some other reason, that's a separate ask,
  not something this spec currently requires.
- **Real payment capture for formula purchases doesn't exist yet inside
  ColorGenius** (the "buy this formula" flow in the ColorGenius app itself
  currently marks every purchase as completed with no actual charge — a
  known, separate gap, tracked independently of this integration). This
  doesn't block GetUpLook's discovery/request flow above, which never
  triggers a purchase directly.
- The old booking-appointment-deep-link concept (this doc's previous
  version) remains unbuilt. If that's still wanted, it needs its own schema
  fields and design pass — nothing here assumes it exists.

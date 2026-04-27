# ColorGenius Community + Marketplace + Public Gallery

## API Contract v1.0

This document defines the REST API contract for the ColorGenius Community, Marketplace, and Public Gallery subsystems. It follows OpenAPI-style conventions for request/response schemas, HTTP status codes, error formatting, authentication, and rate-limiting.

---

## Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Rate Limits](#rate-limits)
4. [Error Response Format](#error-response-format)
5. [Common Types](#common-types)
6. [Endpoints](#endpoints)
   - [Community Endpoints](#community-endpoints)
   - [Marketplace Endpoints](#marketplace-endpoints)
   - [Gallery Endpoints](#gallery-endpoints)

---

## Base URL

```
https://api.colorgenius.io/v1
```

All endpoints are prefixed with the above base URL.

---

## Authentication

### Community & Marketplace

| Mechanism | Value |
|-----------|-------|
| Type | Bearer Token (stylist JWT) |
| Header | `Authorization: Bearer <jwt>` |

Stylist JWTs are short-lived tokens issued by the ColorGenius auth service after login. They contain `sub` (stylist ID), `role`, `salon_id`, and `exp`.

### Gallery (Public)

| Mechanism | Value |
|-----------|-------|
| Type | Optional fingerprint + email |
| Header | `X-Device-Fingerprint: <sha256>` (optional) |
| Body | `email` (optional, for "save" actions) |

Gallery vote endpoints accept an optional device fingerprint (`X-Device-Fingerprint`) for anonymous tracking and an optional `email` to persist saved posts cross-device. No JWT required.

---

## Rate Limits

Rate limits are enforced per endpoint category and keyed by `stylist_id` (authenticated) or `X-Device-Fingerprint` / `IP` (public).

| Category | Limit | Window | Scope |
|----------|-------|--------|-------|
| Community (Write) | 30 requests | 60 seconds | per stylist |
| Community (Read) | 120 requests | 60 seconds | per stylist |
| Marketplace (Write) | 20 requests | 60 seconds | per stylist |
| Marketplace (Read) | 100 requests | 60 seconds | per stylist |
| Gallery (Write) | 10 requests | 60 seconds | per fingerprint/IP |
| Gallery (Read) | 200 requests | 60 seconds | per fingerprint/IP |
| Creator Dashboard | 30 requests | 60 seconds | per stylist |

When a limit is exceeded, the API returns `429 Too Many Requests` with `Retry-After` header.

---

## Error Response Format

All error responses share a consistent shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description of what went wrong.",
    "details": {
      "field": "formulation_id",
      "reason": "not_found"
    },
    "request_id": "req_abc123xyz",
    "timestamp": "2025-08-01T12:00:00Z"
  }
}
```

### Common HTTP Status Codes

| Status | Meaning | Typical Cause |
|--------|---------|---------------|
| 400 | Bad Request | Validation failure, malformed body, duplicate action |
| 401 | Unauthorized | Missing or invalid JWT |
| 403 | Forbidden | Valid auth but insufficient permission (not owner, not approved) |
| 404 | Not Found | Resource does not exist |
| 402 | Payment Required | Marketplace payment failure |
| 409 | Conflict | Resource state prevents action (e.g., already shared) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server failure |

---

## Common Types

### CommunityPost

```json
{
  "id": "post_abc123",
  "formulation_id": "form_xyz789",
  "stylist_id": "stylist_001",
  "stylist_name": "Eiza V.",
  "salon_name": "Pleij Salon",
  "before_photo_url": "https://cdn.colorgenius.io/photos/before_abc.jpg",
  "after_photo_url": "https://cdn.colorgenius.io/photos/after_abc.jpg",
  "caption": "Balayage refresh for summer!",
  "hair_description": "Natural level 6, fine texture, previously highlighted",
  "tags": ["balayage", "blonde", "summer"],
  "is_public": true,
  "status": "active",
  "moderation_status": "approved",
  "trend_score": 87.4,
  "likes_count": 142,
  "saves_count": 38,
  "user_liked": true,
  "user_saved": false,
  "created_at": "2025-07-28T14:30:00Z",
  "updated_at": "2025-07-29T09:15:00Z"
}
```

### GalleryPost

```json
{
  "id": "post_abc123",
  "stylist_id": "stylist_001",
  "stylist_name": "Eiza V.",
  "salon_name": "Pleij Salon",
  "uplook_profile_url": "https://getuplook.com/professional/eiza-v",
  "after_photo_url": "https://cdn.colorgenius.io/photos/after_abc.jpg",
  "caption": "Balayage refresh for summer!",
  "hair_description": "Natural level 6, fine texture, previously highlighted",
  "tags": ["balayage", "blonde", "summer"],
  "season": "summer",
  "likes_count": 142,
  "saves_count": 38,
  "featured": true,
  "created_at": "2025-07-28T14:30:00Z"
}
```

### MarketplaceTemplate

```json
{
  "id": "tmpl_def456",
  "community_post_id": "post_abc123",
  "stylist_id": "stylist_001",
  "stylist_name": "Eiza V.",
  "title": "Summer Blonde Balayage Template",
  "description": "A warm, sun-kissed balayage formula adaptable for levels 5–8.",
  "category": "balayage",
  "tags": ["balayage", "blonde", "summer", "warm"],
  "price_cents": 499,
  "is_premium": false,
  "rating": 4.8,
  "review_count": 23,
  "sales_count": 156,
  "status": "active",
  "preview_data": {
    "before_photo_url": "https://cdn.colorgenius.io/photos/before_abc.jpg",
    "after_photo_url": "https://cdn.colorgenius.io/photos/after_abc.jpg",
    "hair_description": "Natural level 6, fine texture"
  },
  "adaptation_params": {
    "base_levels": [5, 6, 7, 8],
    "tones": ["warm", "neutral"],
    "developer_options": ["20vol", "30vol"]
  },
  "created_at": "2025-07-29T10:00:00Z",
  "updated_at": "2025-08-01T08:00:00Z"
}
```

### TemplateDashboardItem

```json
{
  "template_id": "tmpl_def456",
  "title": "Summer Blonde Balayage Template",
  "status": "active",
  "price_cents": 499,
  "sales_count": 156,
  "earnings_cents": 77844,
  "rating": 4.8,
  "review_count": 23,
  "created_at": "2025-07-29T10:00:00Z"
}
```

### RevenueChartPoint

```json
{
  "date": "2025-07-29",
  "sales": 12,
  "earnings_cents": 5988
}
```

---

## Endpoints

### Community Endpoints

**Auth Required:** Bearer Token (stylist JWT)

---

#### POST /api/community/share

Share a hair color formulation to the community feed.

**Request Body:**

```json
{
  "formulation_id": "form_xyz789",
  "before_photo_url": "https://cdn.colorgenius.io/photos/before_abc.jpg",
  "after_photo_url": "https://cdn.colorgenius.io/photos/after_abc.jpg",
  "caption": "Balayage refresh for summer!",
  "hair_description": "Natural level 6, fine texture, previously highlighted",
  "tags": ["balayage", "blonde", "summer"],
  "is_public": true
}
```

**Response (201 Created):**

```json
{
  "id": "post_abc123",
  "status": "active",
  "moderation_status": "pending_review",
  "trend_score": 0.0,
  "created_at": "2025-08-01T12:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `ALREADY_SHARED` | Formulation already shared to community |
| 403 | `NOT_YOUR_FORMULATION` | Cannot share another stylist's formulation |
| 404 | `FORMULATION_NOT_FOUND` | Formulation ID does not exist |

---

#### GET /api/community/feed

Browse the community feed with filtering and sorting.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (1-indexed) |
| `limit` | integer | No | 20 | Items per page (max 50) |
| `tag` | string | No | — | Filter by single tag |
| `sort` | enum | No | `recent` | `trending`, `recent`, `top_rated` |
| `stylist_id` | string | No | — | Filter by specific stylist |

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "post_abc123",
      "formulation_id": "form_xyz789",
      "stylist_id": "stylist_001",
      "stylist_name": "Eiza V.",
      "salon_name": "Pleij Salon",
      "before_photo_url": "https://cdn.colorgenius.io/photos/before_abc.jpg",
      "after_photo_url": "https://cdn.colorgenius.io/photos/after_abc.jpg",
      "caption": "Balayage refresh for summer!",
      "hair_description": "Natural level 6, fine texture, previously highlighted",
      "tags": ["balayage", "blonde", "summer"],
      "is_public": true,
      "status": "active",
      "moderation_status": "approved",
      "trend_score": 87.4,
      "likes_count": 142,
      "saves_count": 38,
      "user_liked": true,
      "user_saved": false,
      "created_at": "2025-07-28T14:30:00Z",
      "updated_at": "2025-07-29T09:15:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1456,
    "has_more": true
  }
}
```

---

#### POST /api/community/vote

Like, unlike, save, or unsave a community post.

**Request Body:**

```json
{
  "post_id": "post_abc123",
  "action": "like"
}
```

`action` enum: `like`, `unlike`, `save`, `unsave`

**Response (200 OK):**

```json
{
  "post_id": "post_abc123",
  "likes_count": 143,
  "saves_count": 38,
  "user_liked": true,
  "user_saved": false
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 404 | `POST_NOT_FOUND` | Community post does not exist |

---

#### GET /api/community/trending

Get trending community posts over a time period.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | enum | No | `7d` | `24h`, `7d`, `30d` |
| `limit` | integer | No | 20 | Max items (max 50) |

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "post_abc123",
      "formulation_id": "form_xyz789",
      "stylist_id": "stylist_001",
      "stylist_name": "Eiza V.",
      "salon_name": "Pleij Salon",
      "before_photo_url": "https://cdn.colorgenius.io/photos/before_abc.jpg",
      "after_photo_url": "https://cdn.colorgenius.io/photos/after_abc.jpg",
      "caption": "Balayage refresh for summer!",
      "hair_description": "Natural level 6, fine texture, previously highlighted",
      "tags": ["balayage", "blonde", "summer"],
      "is_public": true,
      "status": "active",
      "moderation_status": "approved",
      "trend_score": 87.4,
      "likes_count": 142,
      "saves_count": 38,
      "user_liked": true,
      "user_saved": false,
      "created_at": "2025-07-28T14:30:00Z",
      "updated_at": "2025-07-29T09:15:00Z"
    }
  ],
  "meta": {
    "period": "7d",
    "generated_at": "2025-08-01T12:00:00Z"
  }
}
```

---

### Marketplace Endpoints

**Auth Required:** Bearer Token (stylist JWT)

---

#### POST /api/marketplace/templates

Convert an approved community post into a marketplace template.

**Request Body:**

```json
{
  "community_post_id": "post_abc123",
  "price_cents": 499,
  "title": "Summer Blonde Balayage Template",
  "description": "A warm, sun-kissed balayage formula adaptable for levels 5–8.",
  "category": "balayage",
  "tags": ["balayage", "blonde", "summer", "warm"],
  "adaptation_params": {
    "base_levels": [5, 6, 7, 8],
    "tones": ["warm", "neutral"],
    "developer_options": ["20vol", "30vol"]
  },
  "preview_data": {
    "before_photo_url": "https://cdn.colorgenius.io/photos/before_abc.jpg",
    "after_photo_url": "https://cdn.colorgenius.io/photos/after_abc.jpg",
    "hair_description": "Natural level 6, fine texture"
  },
  "is_premium": false
}
```

**Response (201 Created):**

```json
{
  "id": "tmpl_def456",
  "status": "pending_review",
  "price_cents": 499,
  "created_at": "2025-08-01T12:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `POST_NOT_APPROVED` | Community post not approved for marketplace |
| 403 | `NOT_YOUR_POST` | Cannot monetize another stylist's post |

---

#### GET /api/marketplace/browse

Browse and search marketplace templates.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `limit` | integer | No | 20 | Items per page (max 50) |
| `category` | string | No | — | Filter by category |
| `min_price` | integer | No | — | Minimum price in cents |
| `max_price` | integer | No | — | Maximum price in cents |
| `sort` | enum | No | `popular` | `popular`, `recent`, `rating`, `price_asc`, `price_desc` |
| `tags` | string[] | No | — | Filter by tags (comma-separated) |

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "tmpl_def456",
      "community_post_id": "post_abc123",
      "stylist_id": "stylist_001",
      "stylist_name": "Eiza V.",
      "title": "Summer Blonde Balayage Template",
      "description": "A warm, sun-kissed balayage formula adaptable for levels 5–8.",
      "category": "balayage",
      "tags": ["balayage", "blonde", "summer", "warm"],
      "price_cents": 499,
      "is_premium": false,
      "rating": 4.8,
      "review_count": 23,
      "sales_count": 156,
      "status": "active",
      "preview_data": {
        "before_photo_url": "https://cdn.colorgenius.io/photos/before_abc.jpg",
        "after_photo_url": "https://cdn.colorgenius.io/photos/after_abc.jpg",
        "hair_description": "Natural level 6, fine texture"
      },
      "adaptation_params": {
        "base_levels": [5, 6, 7, 8],
        "tones": ["warm", "neutral"],
        "developer_options": ["20vol", "30vol"]
      },
      "created_at": "2025-07-29T10:00:00Z",
      "updated_at": "2025-08-01T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 342,
    "has_more": true
  }
}
```

---

#### POST /api/marketplace/purchase

Purchase a marketplace template.

**Request Body:**

```json
{
  "template_id": "tmpl_def456",
  "client_id": "client_ghi789"
}
```

`client_id` is optional; if omitted, the purchase is saved to the stylist's library for later adaptation.

**Response (201 Created):**

```json
{
  "purchase_id": "pur_abc123",
  "status": "completed",
  "price_paid_cents": 499,
  "purchased_at": "2025-08-01T12:00:00Z"
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `ALREADY_PURCHASED` | Template already purchased |
| 402 | `PAYMENT_FAILED` | Payment processing failure |
| 404 | `TEMPLATE_NOT_FOUND` | Template ID does not exist |

---

#### POST /api/marketplace/adapt

Adapt a purchased template to a specific client.

**Request Body:**

```json
{
  "purchase_id": "pur_abc123",
  "client_id": "client_ghi789"
}
```

**Response (200 OK):**

```json
{
  "adaptation_result": {
    "formulation_id": "form_new456",
    "original_template_id": "tmpl_def456",
    "adapted_for_client": "client_ghi789",
    "recommended_shades": [
      {
        "brand": "Redken",
        "shade": "8N",
        "developer": "20vol",
        "ratio": "1:1",
        "timing_minutes": 35
      }
    ],
    "adjustments": {
      "developer_change": "20vol → 30vol",
      "timing_adjustment": "+5 min",
      "notes": "Increased developer for resistant gray coverage"
    }
  },
  "confidence_score": 0.94,
  "status": "completed",
  "adapted_at": "2025-08-01T12:05:00Z"
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `ALREADY_ADAPTED` | Template already adapted for this client |
| 403 | `NOT_YOUR_PURCHASE` | Cannot adapt another stylist's purchase |
| 404 | `PURCHASE_NOT_FOUND` | Purchase ID does not exist |

---

#### GET /api/marketplace/creator/dashboard

View creator analytics and earnings.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | enum | No | `30d` | `7d`, `30d`, `90d`, `all` |

**Response (200 OK):**

```json
{
  "total_sales": 156,
  "total_earnings_cents": 77844,
  "avg_rating": 4.8,
  "templates": [
    {
      "template_id": "tmpl_def456",
      "title": "Summer Blonde Balayage Template",
      "status": "active",
      "price_cents": 499,
      "sales_count": 156,
      "earnings_cents": 77844,
      "rating": 4.8,
      "review_count": 23,
      "created_at": "2025-07-29T10:00:00Z"
    }
  ],
  "revenue_chart": [
    {
      "date": "2025-07-29",
      "sales": 12,
      "earnings_cents": 5988
    },
    {
      "date": "2025-07-30",
      "sales": 8,
      "earnings_cents": 3992
    }
  ]
}
```

---

### Gallery Endpoints

**Auth:** Public — no JWT required. Optional `X-Device-Fingerprint` header for anonymous tracking.

---

#### GET /api/gallery/public

Browse the public gallery with filtering.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `limit` | integer | No | 24 | Items per page (max 50) |
| `featured` | boolean | No | — | Show only featured posts |
| `season` | string | No | — | Filter by season |
| `tag` | string | No | — | Filter by single tag |

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "post_abc123",
      "stylist_id": "stylist_001",
      "stylist_name": "Eiza V.",
      "salon_name": "Pleij Salon",
      "uplook_profile_url": "https://getuplook.com/professional/eiza-v",
      "after_photo_url": "https://cdn.colorgenius.io/photos/after_abc.jpg",
      "caption": "Balayage refresh for summer!",
      "hair_description": "Natural level 6, fine texture, previously highlighted",
      "tags": ["balayage", "blonde", "summer"],
      "season": "summer",
      "likes_count": 142,
      "saves_count": 38,
      "featured": true,
      "created_at": "2025-07-28T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 24,
    "total": 3420,
    "has_more": true
  }
}
```

---

#### GET /api/gallery/trending

Get trending gallery posts over a time period.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 20 | Max items (max 50) |
| `period` | enum | No | `7d` | `24h`, `7d`, `30d` |

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "post_abc123",
      "stylist_id": "stylist_001",
      "stylist_name": "Eiza V.",
      "salon_name": "Pleij Salon",
      "uplook_profile_url": "https://getuplook.com/professional/eiza-v",
      "after_photo_url": "https://cdn.colorgenius.io/photos/after_abc.jpg",
      "caption": "Balayage refresh for summer!",
      "hair_description": "Natural level 6, fine texture, previously highlighted",
      "tags": ["balayage", "blonde", "summer"],
      "season": "summer",
      "likes_count": 142,
      "saves_count": 38,
      "featured": true,
      "created_at": "2025-07-28T14:30:00Z"
    }
  ],
  "meta": {
    "period": "7d",
    "generated_at": "2025-08-01T12:00:00Z"
  }
}
```

---

#### GET /api/gallery/seasonal

Browse gallery posts by season.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `season` | enum | **Yes** | — | `spring`, `summer`, `fall`, `winter` |
| `page` | integer | No | 1 | Page number |
| `limit` | integer | No | 24 | Items per page (max 50) |

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "post_abc123",
      "stylist_id": "stylist_001",
      "stylist_name": "Eiza V.",
      "salon_name": "Pleij Salon",
      "uplook_profile_url": "https://getuplook.com/professional/eiza-v",
      "after_photo_url": "https://cdn.colorgenius.io/photos/after_abc.jpg",
      "caption": "Balayage refresh for summer!",
      "hair_description": "Natural level 6, fine texture, previously highlighted",
      "tags": ["balayage", "blonde", "summer"],
      "season": "summer",
      "likes_count": 142,
      "saves_count": 38,
      "featured": true,
      "created_at": "2025-07-28T14:30:00Z"
    }
  ],
  "meta": {
    "season": "summer",
    "page": 1,
    "limit": 24,
    "total": 856,
    "has_more": true
  }
}
```

---

#### GET /api/gallery/stylist/:id

View a stylist's public gallery profile and posts.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Stylist ID |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `limit` | integer | No | 24 | Items per page (max 50) |

**Response (200 OK):**

```json
{
  "stylist": {
    "id": "stylist_001",
    "display_name": "Eiza V.",
    "salon_name": "Pleij Salon",
    "uplook_profile_url": "https://getuplook.com/professional/eiza-v",
    "total_posts": 47,
    "total_likes": 3284
  },
  "posts": [
    {
      "id": "post_abc123",
      "stylist_id": "stylist_001",
      "stylist_name": "Eiza V.",
      "salon_name": "Pleij Salon",
      "uplook_profile_url": "https://getuplook.com/professional/eiza-v",
      "after_photo_url": "https://cdn.colorgenius.io/photos/after_abc.jpg",
      "caption": "Balayage refresh for summer!",
      "hair_description": "Natural level 6, fine texture, previously highlighted",
      "tags": ["balayage", "blonde", "summer"],
      "season": "summer",
      "likes_count": 142,
      "saves_count": 38,
      "featured": true,
      "created_at": "2025-07-28T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 24,
    "total": 47,
    "has_more": true
  }
}
```

---

#### POST /api/gallery/vote

Public vote (like/unlike/save/unsave) on a gallery post.

**Request Body:**

```json
{
  "post_id": "post_abc123",
  "action": "like",
  "fingerprint": "a1b2c3d4e5f6...",
  "email": "user@example.com"
}
```

`action` enum: `like`, `unlike`, `save`, `unsave`  
`fingerprint`: Optional SHA-256 device fingerprint for anonymous tracking  
`email`: Optional email for cross-device saved posts

**Response (200 OK):**

```json
{
  "post_id": "post_abc123",
  "likes_count": 143,
  "saves_count": 38
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 404 | `POST_NOT_FOUND` | Gallery post does not exist |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-08-01 | Initial API contract for Community + Marketplace + Public Gallery |

---

## Appendix: Quick Reference

### Status Values

| Entity | Status Values |
|--------|--------------|
| Community Post | `active`, `archived`, `removed` |
| Moderation Status | `pending_review`, `approved`, `rejected`, `flagged` |
| Marketplace Template | `pending_review`, `active`, `paused`, `archived` |
| Purchase | `pending`, `completed`, `refunded` |
| Adaptation | `pending`, `completed`, `failed` |

### Trend Score Calculation

The `trend_score` is a normalized 0–100 score computed from:
- Like velocity (likes per hour)
- Save ratio (saves / likes)
- Recency decay (newer posts score higher)
- Stylist reputation multiplier

### Season Assignment

Posts are automatically tagged with a season based on creation date:
- Spring: March 20 – June 19
- Summer: June 20 – September 21
- Fall: September 22 – December 20
- Winter: December 21 – March 19

Stylists may override the auto-assigned season.

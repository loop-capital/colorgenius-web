# ColorGenius API Contract — Beta v1.0
**Owner:** colorgenius-architect
**Date:** April 25, 2026
**Status:** Ready for implementation

---

## Base URL

```
Production:  https://api.colorgenius.ai/v1
Staging:     https://api-staging.colorgenius.ai/v1
Local:       http://localhost:3000/api
```

---

## Authentication

### Method: JWT Bearer Token

```
Authorization: Bearer <jwt_token>
```

### Token Acquisition
```
POST /auth/login
{
  "email": "stylist@salon.com",
  "password": "secure_password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
  "expiresAt": "2026-04-26T19:25:00Z",
  "stylist": {
    "id": "uuid",
    "name": "Jane Doe",
    "salonId": "uuid"
  }
}
```

### Refresh Token
```
POST /auth/refresh
{
  "refreshToken": "..."
}
```

---

## Core Endpoints

### 1. Photo Analysis

```
POST /analyze
```

**Request:**
```json
{
  "photo": "<base64_encoded_image>",
  "photoFormat": "jpeg",
  "clientId": "uuid",
  "questionnaire": {
    "previousTreatments": ["bleach", "perm"],
    "metallicDye": false,
    "allergies": ["PPD"],
    "hairTexture": "fine",
    "scalpCondition": "sensitive",
    "desiredOutcome": "full_color"
  },
  "manualOverride": {
    "level": 6,
    "tone": "warm",
    "condition": "healthy"
  }
}
```

**Response:**
```json
{
  "analysisId": "uuid",
  "status": "complete",
  "photoAnalysis": {
    "level": {
      "value": 6,
      "confidence": 0.85,
      "method": "auto"
    },
    "tone": {
      "value": "warm",
      "confidence": 0.72,
      "method": "auto"
    },
    "condition": {
      "value": "healthy",
      "confidence": 0.80,
      "method": "auto"
    },
    "porosity": {
      "value": "medium",
      "confidence": 0.65,
      "method": "auto"
    }
  },
  "questionnaireFlags": [
    {
      "type": "warning",
      "message": "Client has PPD allergy. Use PPD-free color line."
    }
  ],
  "recommendedDeveloper": "20 Vol",
  "suggestedPreTreatments": [],
  "timestamp": "2026-04-25T19:25:00Z"
}
```

**Errors:**
- `400` — Invalid photo format or size
- `422` — Unable to analyze photo (too dark, no hair detected)
- `429` — Rate limit exceeded (10 photos/minute)

---

### 2. Formulation Generation

```
POST /formulate
```

**Request:**
```json
{
  "analysisId": "uuid",
  "desiredShade": {
    "level": 7,
    "tone": "ash",
    "brand": "Wella",
    "line": "Koleston Perfect"
  },
  "clientId": "uuid",
  "stylistOverrides": {
    "developerVolume": "30 Vol",
    "processingTime": 35
  }
}
```

**Response:**
```json
{
  "formulationId": "uuid",
  "status": "complete",
  "analysis": {
    "currentLevel": 6,
    "desiredLevel": 7,
    "levelsToLift": 1,
    "targetTone": "Ash",
    "hairCondition": "Healthy"
  },
  "formula": {
    "colorLine": "Wella Koleston Perfect",
    "shades": [
      {
        "shade": "7/1",
        "name": "Medium Blonde Ash",
        "ratio": "1.0",
        "role": "Base color"
      },
      {
        "shade": "7/0",
        "name": "Medium Blonde Natural",
        "ratio": "0.5",
        "role": "Depth"
      }
    ],
    "developer": {
      "volume": "20 Vol",
      "percentage": "6%",
      "ratio": "1:1"
    },
    "totalMix": "1.5 parts color + 1.5 parts developer",
    "processingTime": {
      "min": 30,
      "max": 35,
      "recommended": 32
    },
    "application": "Apply to roots first, pull through last 10 minutes"
  },
  "warnings": [
    "Standard formulation — no special precautions"
  ],
  "recommendations": [
    "Use Wella Color Post Treatment after rinsing"
  ],
  "confidenceScore": 0.92,
  "requiresConfirmation": false,
  "timestamp": "2026-04-25T19:25:00Z"
}
```

**Errors:**
- `400` — Invalid shade selection
- `422` — Formulation not possible (e.g., lifting too many levels, conflicting treatments)
- `404` — Analysis not found

---

### 3. Result Scoring

```
POST /score
```

**Request:**
```json
{
  "formulationId": "uuid",
  "beforePhoto": "<base64>",
  "afterPhoto": "<base64>",
  "stylistNotes": "Client loved the color. Slightly warmer than expected.",
  "stylistRating": {
    "colorAccuracy": 9,
    "hairCondition": 9,
    "evenness": 8
  }
}
```

**Response:**
```json
{
  "scoreId": "uuid",
  "scores": {
    "colorAccuracy": {
      "score": 87,
      "confidence": 0.80,
      "method": "auto"
    },
    "hairCondition": {
      "score": 92,
      "confidence": 0.75,
      "method": "auto"
    },
    "evenness": {
      "score": 85,
      "confidence": 0.70,
      "method": "auto"
    }
  },
  "overallScore": 88,
  "aiNotes": "Color is close to target with slight warmth. Application is even. Hair condition maintained.",
  "stylistNotes": "Client loved the color. Slightly warmer than expected.",
  "timestamp": "2026-04-25T19:25:00Z"
}
```

---

### 4. Color Library

```
GET /colors
GET /colors?brand=Wella
GET /colors?brand=Wella&line=Koleston%20Perfect
GET /colors/:shadeId
```

**Response:**
```json
{
  "brands": [
    {
      "id": "wella",
      "name": "Wella",
      "lines": [
        {
          "id": "koleston-perfect",
          "name": "Koleston Perfect",
          "type": "permanent",
          "coverage": "gray",
          "shades": [
            {
              "id": "7/1",
              "name": "Medium Blonde Ash",
              "level": 7,
              "tone": "ash",
              "hex": "#8B7355",
              "description": "Cool ash blonde with gray coverage"
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 5. Client Management

```
GET /clients                    # List (paginated)
POST /clients                   # Create
GET /clients/:id                # Get profile
PUT /clients/:id                # Update
DELETE /clients/:id             # Delete (soft)
GET /clients/:id/history        # Formulation history
GET /clients/:id/photos         # Before/after gallery
```

**Create Client:**
```json
POST /clients
{
  "name": "Sarah Johnson",
  "phone": "+1-555-0123",
  "email": "sarah@email.com",
  "birthDate": "1985-03-15",
  "hairProfile": {
    "naturalLevel": 5,
    "naturalTone": "warm",
    "texture": "fine",
    "porosity": "medium"
  },
  "allergies": ["PPD"],
  "sensitivities": ["scalp_sensitive"],
  "notes": "Prefers cooler tones"
}
```

---

### 6. Formulation History

```
GET /formulations               # List (paginated)
POST /formulations              # Save (after creating via /formulate)
GET /formulations/:id           # Get details
PUT /formulations/:id           # Update (add notes, score)
DELETE /formulations/:id        # Archive
```

---

## Error Handling

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Photo must be JPEG or PNG, max 10MB",
    "field": "photo",
    "details": [
      {
        "code": "INVALID_FORMAT",
        "message": "WebP format not supported"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `ANALYSIS_FAILED` | 422 | Could not analyze photo |
| `FORMULATION_INVALID` | 422 | Formulation not possible |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /analyze` | 10 | 1 minute |
| `POST /formulate` | 20 | 1 minute |
| `POST /score` | 10 | 1 minute |
| All other | 100 | 1 minute |

---

## Pagination

All list endpoints support:

```
GET /clients?page=1&limit=20&sort=created_at:desc
```

**Response includes:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Versioning

API is versioned via URL path: `/v1/`, `/v2/`, etc.

Breaking changes bump version. Non-breaking changes (additive) stay on current version.

---

## Future Endpoints (Post-Beta)

| Endpoint | Description | Phase |
|----------|-------------|-------|
| `POST /community/share` | Share formula to community | Phase 2 |
| `GET /community/feed` | Browse community formulas | Phase 2 |
| `POST /community/vote` | Rank/like formulas | Phase 2 |
| `GET /marketplace/trending` | Trending templates | Phase 3 |
| `POST /marketplace/purchase` | Purchase template | Phase 3 |
| `POST /marketplace/adapt` | AI adapt template | Phase 3 |

---

*Contract version: 1.0.0 | Last updated: 2026-04-25*

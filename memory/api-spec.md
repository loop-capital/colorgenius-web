# Color Genius - REST API Specification

## Executive Summary

This document defines the complete REST API for Color Genius, enabling stylists, salons, and integrated platforms to access hair color formulation, photo analysis, client management, and learning system features.

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://api.colorgenius.com/v1` |
| Staging | `https://staging.colorgenius.com/v1` |
| Sandbox | `https://sandbox.colorgenius.com/v1` |

---

## Authentication

### OAuth 2.0 + JWT

```http
Authorization: Bearer {access_token}
```

### Token Endpoints

```http
POST /auth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&
client_id={client_id}&
client_secret={client_secret}&
scope=photo_analysis formulation client_read
```

### Scopes

| Scope | Description |
|-------|-------------|
| `photo_analysis` | Upload and analyze hair photos |
| `formulation` | Generate and retrieve color formulas |
| `client_read` | Read client data |
| `client_write` | Create and update clients |
| `stylist_read` | Read stylist profile |
| `stylist_write` | Update stylist preferences |
| `salon_admin` | Full salon management access |
| `analytics` | Access reporting and analytics |
| `webhooks` | Manage webhook subscriptions |

---

## Rate Limits

| Tier | Requests/Minute | Burst |
|------|-----------------|-------|
| Free | 30 | 50 |
| Professional | 300 | 500 |
| Salon | 1000 | 2000 |
| Enterprise | Custom | Custom |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 245
X-RateLimit-Reset: 1649980800
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "req_abc123xyz",
    "timestamp": "2026-04-14T22:45:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid photo format",
    "details": ["Supported formats: JPG, PNG, WebP"],
    "request_id": "req_abc123xyz"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `PHOTO_ANALYSIS_FAILED` | 422 | Could not analyze photo |
| `FORMULATION_INVALID` | 422 | Unable to generate formula |

---

## API Endpoints

### 1. Photo Analysis

#### Upload Photo for Analysis
```http
POST /photos/analyze
Content-Type: multipart/form-data
Authorization: Bearer {token}

Request:
{
  "photo": <binary>,
  "photo_type": "current" | "target" | "texture",
  "client_id": "uuid",
  "analysis_options": {
    "include_damage_assessment": true,
    "include_texture_analysis": true,
    "include_face_analysis": false
  }
}

Response: 202 Accepted
{
  "success": true,
  "data": {
    "analysis_id": "ana_123",
    "status": "processing",
    "estimated_time_ms": 1500,
    "webhook_url": "https://api.colorgenius.com/v1/webhooks/analysis/ana_123"
  }
}
```

#### Get Analysis Results
```http
GET /photos/analysis/{analysis_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "analysis_id": "ana_123",
    "status": "completed",
    "created_at": "2026-04-14T22:45:00Z",
    "completed_at": "2026-04-14T22:45:02Z",
    "photo_metadata": {
      "original_size": [3024, 4032],
      "format": "JPEG",
      "lighting_corrected": true
    },
    "hair_analysis": {
      "segmentation": {
        "mask_url": "https://cdn.colorgenius.com/masks/ana_123.png",
        "coverage_percentage": 78.5,
        "confidence": 0.96
      },
      "color": {
        "level": 7,
        "level_confidence": 0.92,
        "primary_tone": "N",
        "undertone": "neutral",
        "rgb": [130, 98, 72],
        "lab": [45.2, 8.5, 15.3]
      },
      "texture": {
        "thickness": "medium",
        "curl_pattern": "wavy",
        "density": "medium",
        "porosity": "normal"
      },
      "damage": {
        "overall_score": 0.25,
        "indicators": {
          "split_ends": false,
          "breakage": false,
          "heat_damage": true
        }
      }
    }
  }
}
```

#### Batch Photo Analysis
```http
POST /photos/analyze/batch
Content-Type: multipart/form-data
Authorization: Bearer {token}

Request:
{
  "photos": [
    {"file": <binary>, "type": "current", "label": "roots"},
    {"file": <binary>, "type": "current", "label": "ends"},
    {"file": <binary>, "type": "target", "label": "inspiration"}
  ],
  "client_id": "uuid"
}

Response: 202 Accepted
{
  "success": true,
  "data": {
    "batch_id": "batch_456",
    "analyses": ["ana_123", "ana_124", "ana_125"],
    "status": "processing",
    "webhook_url": "https://api.colorgenius.com/v1/webhooks/batch/batch_456"
  }
}
```

---

### 2. Formulation Engine

#### Generate Color Formula
```http
POST /formulations/generate
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "client_id": "cli_789",
  "current_state": {
    "photo_analysis_id": "ana_123",
    "manual_level": 7,
    "manual_tone": "N",
    "is_virgin": false,
    "previous_color": {
      "type": "permanent",
      "months_ago": 8,
      "formula_id": "frm_321"
    }
  },
  "target": {
    "photo_analysis_id": "ana_125",
    "manual_level": 9,
    "manual_tone": "G",
    "intensity": 0.8
  },
  "hair_profile": {
    "texture": "medium",
    "porosity": "normal",
    "density": "medium",
    "damage_score": 0.25,
    "elasticity_percent": 85
  },
  "client_factors": {
    "gray_percentage": 25,
    "medications": [],
    "scalp_condition": "normal",
    "has_ppd_allergy": false
  },
  "preferences": {
    "preferred_brand": "redken",
    "alternative_brands": ["wella", "schwarzkopf"],
    "prefer_ammonia_free": false,
    "prefer_plex_technology": true,
    "max_appointment_time": 120
  },
  "environment": {
    "water_hardness": "moderate",
    "sun_exposure_hours": 10
  }
}

Response: 200 OK
{
  "success": true,
  "data": {
    "formulation_id": "frm_abc123",
    "created_at": "2026-04-14T22:45:00Z",
    "confidence_score": 0.89,
    "validation": {
      "is_valid": true,
      "warnings": ["Previous color limits lift to 2 levels"],
      "alternatives": []
    },
    "primary_formula": {
      "action_type": "lift_with_color",
      "brand": "redken",
      "product_line": "color_gels_lacquers",
      "components": [
        {
          "shade": {
            "code": "9G",
            "name": "Very Light Blonde Gold",
            "level": 9,
            "tone": "G"
          },
          "amount_oz": 2.0,
          "amount_ml": 59.1,
          "purpose": "primary"
        },
        {
          "shade": {
            "code": "9N",
            "name": "Very Light Blonde Natural",
            "level": 9,
            "tone": "N"
          },
          "amount_oz": 1.0,
          "amount_ml": 29.6,
          "purpose": "gray_coverage"
        }
      ],
      "developer": {
        "volume": 30,
        "amount_oz": 3.0,
        "amount_ml": 88.7,
        "product": "color_gels_developer"
      },
      "bond_builder": {
        "product": "olaplex_no1",
        "amount_ml": 5.6
      },
      "mixing_ratio": "1:1",
      "total_volume_oz": 6.0,
      "total_volume_ml": 177.4
    },
    "toning_formula": null,
    "processing_instructions": {
      "total_time_minutes": 35,
      "application_sequence": [
        {
          "zone": "roots",
          "duration": 20,
          "description": "Apply to regrowth (Level 7)"
        },
        {
          "zone": "mids_to_ends",
          "duration": 15,
          "description": "Pull through to refresh"
        }
      ],
      "room_temperature_recommended": true,
      "heat_optional": false,
      "notes": ["Monitor for lift to prevent over-processing"]
    },
    "cost_estimate": {
      "total_product_cost": 18.50,
      "currency": "USD",
      "breakdown": [
        {"product": "Redken 9G", "cost": 6.50},
        {"product": "Redken 9N", "cost": 6.50},
        {"product": "30 Vol Developer", "cost": 3.00},
        {"product": "Olaplex No.1", "cost": 2.50}
      ]
    },
    "pricing_suggestion": {
      "recommended_price": 180.00,
      "price_range": [160.00, 220.00],
      "currency": "USD"
    },
    "recommendations": {
      "aftercare": [
        "Redken Acidic Bonding Concentrate Shampoo",
        "Olaplex No.3 weekly treatment"
      ],
      "maintenance_schedule": "Touch up every 6-8 weeks",
      "next_appointment": "Book for 6 weeks"
    }
  }
}
```

#### Get Formulation by ID
```http
GET /formulations/{formulation_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "formulation_id": "frm_abc123",
    ... // Full formulation object
  }
}
```

#### Update Formulation (Stylist Feedback)
```http
PATCH /formulations/{formulation_id}
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "stylist_adjustments": {
    "actual_developer_used": 40,
    "actual_processing_time": 40,
    "shade_modifications": "Added 0.5 oz 9A for ashier result"
  },
  "outcome": {
    "result_level": 9,
    "result_tone": "G",
    "client_satisfaction": 5,
    "color_accuracy": 4,
    "condition_after": 4,
    "photos": ["https://...", "https://..."]
  },
  "notes": "Client loved the warmth. Processing 40 min for resistant hair."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "formulation_id": "frm_abc123",
    "updated": true,
    "feedback_recorded": true,
    "learning_updated": true
  }
}
```

#### Compare Formulations
```http
POST /formulations/compare
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "base_formulation_id": "frm_abc123",
  "comparison_params": {
    "brands": ["wella", "schwarzkopf"],
    "same_target": true
  }
}

Response: 200 OK
{
  "success": true,
  "data": {
    "comparisons": [
      {
        "brand": "wella",
        "product_line": "koleston_perfect",
        "formula": { ... },
        "cost_comparison": {
          "difference_percent": 12,
          "cheaper": true
        },
        "confidence_score": 0.87
      }
    ]
  }
}
```

#### Get Alternative Formulations
```http
GET /formulations/{formulation_id}/alternatives
Authorization: Bearer {token}

Query Parameters:
- brand: Filter by brand
- max_developer: Limit developer volume
- ammonia_free: true/false

Response: 200 OK
{
  "success": true,
  "data": {
    "alternatives": [
      {
        "formulation_id": "frm_alt_1",
        "brand": "wella",
        "confidence_score": 0.85,
        "cost_estimate": { ... },
        "key_differences": ["Uses MEA instead of ammonia"]
      }
    ]
  }
}
```

---

### 3. Color Line Database

#### List Brands
```http
GET /color-lines/brands
Authorization: Bearer {token}

Query Parameters:
- tier: premium|mid|mass
- country: ISO code
- page: 1
- limit: 50

Response: 200 OK
{
  "success": true,
  "data": {
    "brands": [
      {
        "id": "brand_redken",
        "name": "Redken",
        "manufacturer": "L'Oréal Professional",
        "tier": "premium",
        "origin_country": "US",
        "product_lines_count": 5,
        "logo_url": "https://cdn.colorgenius.com/brands/redken/logo.png"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 12
    }
  }
}
```

#### Get Brand Details
```http
GET /color-lines/brands/{brand_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "brand_redken",
    "name": "Redken",
    "product_lines": [
      {
        "id": "pline_rseq",
        "name": "Shades EQ",
        "type": "demi-permanent",
        "mixing_ratio": "1:1",
        "shade_count": 120
      }
    ]
  }
}
```

#### List Shades
```http
GET /color-lines/shades
Authorization: Bearer {token}

Query Parameters:
- brand: redken
- product_line: shades_eq
- level: 7
- tone: G
- page: 1
- limit: 100

Response: 200 OK
{
  "success": true,
  "data": {
    "shades": [
      {
        "id": "shade_7g_rseq",
        "code": "7G",
        "name": "Medium Blonde Gold",
        "level": 7,
        "tone": "G",
        "is_natural": false,
        "rgb": [170, 140, 100],
        "undertone": "warm",
        "best_for": ["adding_warmth", "golden_results"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 24
    }
  }
}
```

#### Get Shade Details
```http
GET /color-lines/shades/{shade_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "shade_7g_rseq",
    "brand": "Redken",
    "product_line": "Shades EQ",
    "code": "7G",
    "name": "Medium Blonde Gold",
    "level": 7,
    "primary_tone": "G",
    "is_natural": false,
    "rgb_representation": [170, 140, 100],
    "lab_representation": [60.5, 8.2, 25.8],
    "undertone": "warm",
    "intensity_score": 0.75,
    "description": "Warm golden blonde with yellow reflect",
    "best_for": ["adding_warmth", "golden_results", "neutralizing_ash"],
    "not_recommended_for": ["high_porosity_hair"],
    "mixing_compatibility": ["7N", "7V", "7P", "6G", "8G"],
    "formulation_rules": [
      {
        "rule_type": "porosity_adjustment",
        "condition": "porosity == high",
        "action": "reduce_processing_time_15_percent"
      }
    ],
    "equivalents": [
      {
        "brand": "Wella",
        "shade_code": "7/3",
        "match_quality": 0.95
      }
    ]
  }
}
```

#### Search Shades by Color
```http
POST /color-lines/shades/search-by-color
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "rgb": [180, 150, 110],
  "lab": [65.0, 10.0, 30.0],
  "brand_filter": ["redken", "wella"],
  "tolerance": 5.0
}

Response: 200 OK
{
  "success": true,
  "data": {
    "matches": [
      {
        "shade": { ... },
        "delta_e": 2.3,
        "match_quality": "very_close"
      }
    ]
  }
}
```

#### Get Formulation Rules
```http
GET /color-lines/rules
Authorization: Bearer {token}

Query Parameters:
- brand: redken
- rule_type: gray_coverage
- active: true

Response: 200 OK
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "rule_1",
        "product_line_id": "pline_rseq",
        "rule_type": "gray_coverage",
        "priority": 10,
        "conditions": {
          "gray_percentage": ">50",
          "natural_shade": false
        },
        "actions": {
          "require_natural_series": true,
          "add_developer_volume": 0
        },
        "rationale": "Non-N series provides incomplete gray coverage"
      }
    ]
  }
}
```

---

### 4. Client Management

#### Create Client
```http
POST /clients
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "first_name": "Sarah",
  "last_name": "Johnson",
  "email": "sarah.j@email.com",
  "phone": "+1-555-123-4567",
  "date_of_birth": "1985-03-15",
  "notes": "Prefers low-maintenance colors",
  "allergies": {
    "ppd": false,
    "ammonia": false,
    "other": []
  },
  "preferences": {
    "communication": "text",
    "reminders": true
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "client_id": "cli_789",
    "created_at": "2026-04-14T22:45:00Z",
    "qr_code": "https://api.colorgenius.com/v1/clients/cli_789/qr"
  }
}
```

#### Get Client
```http
GET /clients/{client_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "client_id": "cli_789",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.j@email.com",
    "phone": "+1-555-123-4567",
    "profile": {
      "hair_history": [
        {
          "date": "2026-02-15",
          "service": "Root touch-up",
          "formula_id": "frm_321",
          "color_level": 6,
          "color_tone": "N"
        }
      ],
      "photo_gallery": [
        {
          "photo_id": "photo_1",
          "type": "current",
          "date": "2026-04-14",
          "analysis_id": "ana_123"
        }
      ],
      "preferences": {
        "preferred_brands": ["redken", "wella"],
        "disliked_tones": ["R", "C"],
        "maintenance_level": "low"
      }
    },
    "upcoming_appointments": [],
    "last_visit": "2026-02-15"
  }
}
```

#### Update Client
```http
PATCH /clients/{client_id}
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "phone": "+1-555-987-6543",
  "preferences": {
    "maintenance_level": "medium"
  }
}

Response: 200 OK
```

#### List Clients
```http
GET /clients
Authorization: Bearer {token}

Query Parameters:
- search: "Sarah"
- last_visit_before: 2026-01-01
- sort: last_visit
- order: desc
- page: 1
- limit: 50

Response: 200 OK
{
  "success": true,
  "data": {
    "clients": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 245
    }
  }
}
```

#### Get Client Hair History
```http
GET /clients/{client_id}/history
Authorization: Bearer {token}

Query Parameters:
- from_date: 2025-01-01
- to_date: 2026-04-14

Response: 200 OK
{
  "success": true,
  "data": {
    "client_id": "cli_789",
    "history": [
      {
        "visit_id": "visit_1",
        "date": "2026-02-15",
        "stylist_id": "sty_456",
        "service_type": "color",
        "formulation": { ... },
        "outcome": {
          "satisfaction": 5,
          "photos": [ ... ]
        },
        "notes": "Covered gray beautifully"
      }
    ]
  }
}
```

#### Add Photo to Client Gallery
```http
POST /clients/{client_id}/photos
Content-Type: multipart/form-data
Authorization: Bearer {token}

Request:
{
  "photo": <binary>,
  "type": "current" | "target" | "result",
  "date": "2026-04-14",
  "notes": "Before color service"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "photo_id": "photo_456",
    "analysis_id": "ana_789",
    "url": "https://cdn.colorgenius.com/photos/..."
  }
}
```

---

### 5. Stylist Management

#### Get Stylist Profile
```http
GET /stylists/me
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "stylist_id": "sty_456",
    "first_name": "Emma",
    "last_name": "Davis",
    "email": "emma@salon.com",
    "license_number": "CO-12345",
    "certifications": ["Redken Color Certified", "Olaplex Pro"],
    "preferences": {
      "default_brand": "redken",
      "preferred_developer": 20,
      "notification_settings": {
        "formula_updates": true,
        "new_features": true
      }
    },
    "salon": {
      "salon_id": "sal_123",
      "name": "Salon Chic",
      "role": "senior_stylist"
    },
    "statistics": {
      "formulations_generated": 1247,
      "average_satisfaction": 4.8,
      "top_services": ["blonde", "gray_coverage", "balayage"]
    }
  }
}
```

#### Update Stylist Preferences
```http
PATCH /stylists/me
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "preferences": {
    "default_brand": "wella",
    "notification_settings": {
      "formula_updates": false
    }
  }
}

Response: 200 OK
```

#### Get Stylist Formulations
```http
GET /stylists/me/formulations
Authorization: Bearer {token}

Query Parameters:
- from_date: 2026-01-01
- client_id: cli_789
- page: 1
- limit: 50

Response: 200 OK
{
  "success": true,
  "data": {
    "formulations": [ ... ],
    "pagination": { ... }
  }
}
```

#### Get Stylist Analytics
```http
GET /stylists/me/analytics
Authorization: Bearer {token}

Query Parameters:
- period: 30d|90d|1y

Response: 200 OK
{
  "success": true,
  "data": {
    "period": "30d",
    "total_formulations": 45,
    "average_confidence": 0.87,
    "top_brands": [
      {"brand": "redken", "count": 28, "percentage": 62},
      {"brand": "wella", "count": 12, "percentage": 27}
    ],
    "service_breakdown": {
      "gray_coverage": 15,
      "blonde": 12,
      "corrective": 3,
      "fashion": 8
    },
    "client_satisfaction": {
      "average": 4.7,
      "distribution": {
        "5_star": 38,
        "4_star": 6,
        "3_star": 1
      }
    }
  }
}
```

---

### 6. Salon Management

#### Get Salon Dashboard
```http
GET /salons/{salon_id}/dashboard
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "salon_id": "sal_123",
    "name": "Salon Chic",
    "subscription": {
      "tier": "salon",
      "seats": 8,
      "expires": "2027-04-14"
    },
    "statistics": {
      "active_stylists": 6,
      "total_clients": 1245,
      "formulations_this_month": 312,
      "average_satisfaction": 4.6
    },
    "inventory": {
      "monitored_brands": ["redken", "wella"],
      "low_stock_alerts": 3
    }
  }
}
```

#### List Salon Stylists
```http
GET /salons/{salon_id}/stylists
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "stylists": [
      {
        "stylist_id": "sty_456",
        "name": "Emma Davis",
        "role": "senior_stylist",
        "formulations_this_month": 45,
        "satisfaction_score": 4.8
      }
    ]
  }
}
```

#### Get Salon Analytics
```http
GET /salons/{salon_id}/analytics
Authorization: Bearer {token}

Query Parameters:
- period: 30d|90d|1y
- group_by: stylist|service|brand

Response: 200 OK
{
  "success": true,
  "data": {
    "revenue_analysis": {
      "product_cost": 4520.00,
      "service_revenue": 48500.00,
      "product_cost_percentage": 9.3
    },
    "formulation_trends": {
      "by_brand": [ ... ],
      "by_service": [ ... ],
      "month_over_month": +12
    }
  }
}
```

---

### 7. Learning System

#### Submit Feedback
```http
POST /learning/feedback
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "formulation_id": "frm_abc123",
  "stylist_id": "sty_456",
  "client_id": "cli_789",
  "ratings": {
    "color_accuracy": 5,
    "formula_precision": 4,
    "client_satisfaction": 5,
    "condition_after": 5,
    "overall": 5
  },
  "outcome": {
    "actual_level": 9,
    "actual_tone": "G",
    "photos": {
      "before": "https://...",
      "after": "https://..."
    },
    "adjustments_made": "Increased processing to 40 min for resistant hair",
    "client_feedback": "Love the warmth!"
  },
  "would_use_again": true,
  "suggestions": "Maybe suggest 40 vol for resistant hair types"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "feedback_id": "fdb_123",
    "recorded": true,
    "learning_updated": true,
    "thank_you_message": "Thank you! Your feedback helps improve Color Genius."
  }
}
```

#### Get Personalized Recommendations
```http
GET /learning/recommendations
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "for_stylist": {
      "improved_formulations": [
        {
          "formulation_id": "frm_new_1",
          "reason": "Based on your success with similar hair types",
          "confidence_boost": 0.05
        }
      ],
      "trending_in_region": ["mushroom_brown", "buttery_blonde"],
      "skills_to_develop": ["corrective_color", "vivids"]
    }
  }
}
```

#### Get Formula Confidence Adjustment
```http
GET /learning/confidence/{formulation_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "base_confidence": 0.85,
    "adjusted_confidence": 0.91,
    "adjustment_factors": [
      {
        "factor": "stylist_history",
        "impact": +0.03,
        "reason": "Similar formulations successful"
      },
      {
        "factor": "regional_success",
        "impact": +0.02,
        "reason": "High success rate in your region"
      },
      {
        "factor": "seasonal_trend",
        "impact": +0.01,
        "reason": "Trending color this season"
      }
    ]
  }
}
```

#### Get Similar Successful Formulas
```http
GET /learning/similar-formulas
Authorization: Bearer {token}

Query Parameters:
- hair_level: 7
- hair_texture: medium
- target_level: 9
- brand: redken
- limit: 10

Response: 200 OK
{
  "success": true,
  "data": {
    "similar_formulas": [
      {
        "formulation_id": "frm_similar_1",
        "similarity_score": 0.94,
        "success_rate": 0.96,
        "average_satisfaction": 4.8,
        "stylist_count": 45
      }
    ]
  }
}
```

---

### 8. Webhooks

#### Subscribe to Webhook
```http
POST /webhooks/subscribe
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "url": "https://salon-chic.com/api/colorgenius/webhooks",
  "events": ["formulation.completed", "feedback.received"],
  "secret": "whsec_...",
  "metadata": {
    "salon_id": "sal_123"
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "webhook_id": "whk_123",
    "status": "active"
  }
}
```

#### Webhook Events

```json
// formulation.completed
{
  "event": "formulation.completed",
  "timestamp": "2026-04-14T22:45:02Z",
  "data": {
    "formulation_id": "frm_abc123",
    "stylist_id": "sty_456",
    "client_id": "cli_789",
    "confidence_score": 0.89,
    "url": "https://api.colorgenius.com/v1/formulations/frm_abc123"
  }
}

// feedback.received
{
  "event": "feedback.received",
  "timestamp": "2026-04-14T23:30:00Z",
  "data": {
    "feedback_id": "fdb_123",
    "formulation_id": "frm_abc123",
    "stylist_id": "sty_456",
    "ratings": {
      "overall": 5
    }
  }
}

// photo.analysis.completed
{
  "event": "photo.analysis.completed",
  "timestamp": "2026-04-14T22:45:02Z",
  "data": {
    "analysis_id": "ana_123",
    "status": "completed",
    "results": { ... }
  }
}
```

#### Webhook Signature Verification

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    """Verify webhook signature."""
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

---

### 9. Integrations

#### UpLook Booking Integration
```http
GET /integrations/uplook/sync
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "appointments_synced": 12,
    "clients_synced": 8,
    "last_sync": "2026-04-14T20:00:00Z"
  }
}
```

#### ProKyur Product Ordering
```http
POST /integrations/prokyur/order
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "formulation_id": "frm_abc123",
  "quantities": {
    "shade_9g_rseq": 2,
    "shade_9n_rseq": 1,
    "dev_30vol_rseq": 1
  },
  "delivery_address": "...",
  "urgent": false
}

Response: 201 Created
{
  "success": true,
  "data": {
    "order_id": "ord_456",
    "prokyur_order_id": "PK-789123",
    "estimated_delivery": "2026-04-16",
    "total": 47.50
  }
}
```

#### ByondEdu Education
```http
GET /integrations/byondedu/recommendations
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "recommended_courses": [
      {
        "course_id": "course_123",
        "title": "Mastering Ash Blondes",
        "relevance_score": 0.92,
        "reason": "Based on your recent formulations"
      }
    ]
  }
}
```

---

### 10. System

#### Health Check
```http
GET /system/health

Response: 200 OK
{
  "status": "healthy",
  "version": "1.2.3",
  "services": {
    "api": "healthy",
    "photo_analysis": "healthy",
    "formulation": "healthy",
    "database": "healthy"
  },
  "timestamp": "2026-04-14T22:45:00Z"
}
```

#### Get API Status
```http
GET /system/status

Response: 200 OK
{
  "success": true,
  "data": {
    "api_version": "v1.2.3",
    "models": {
      "hair_segmentation": "yolov8n-seg-hair-v2.1",
      "level_classifier": "level_resnet18_v3",
      "texture_classifier": "texture_resnet50_v2"
    },
    "features_enabled": {
      "photo_analysis": true,
      "batch_processing": true,
      "learning_system": true
    }
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { ColorGeniusClient } from '@colorgenius/sdk';

const client = new ColorGeniusClient({
  apiKey: process.env.COLORGENIUS_API_KEY,
  environment: 'production'
});

// Generate formulation
const formulation = await client.formulations.generate({
  clientId: 'cli_789',
  currentState: { photoAnalysisId: 'ana_123' },
  target: { manualLevel: 9, manualTone: 'G' },
  preferences: { preferredBrand: 'redken' }
});

console.log(formulation.primaryFormula);
```

### Python
```python
from colorgenius import ColorGeniusClient

client = ColorGeniusClient(api_key="...")

# Analyze photo
with open('hair_photo.jpg', 'rb') as f:
    analysis = client.photos.analyze(
        photo=f,
        photo_type='current',
        client_id='cli_789'
    )

print(f"Detected level: {analysis.hair_analysis.color.level}")
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-14  
**API Version:** v1  
**Author:** che-architect (ClawStudio)
# ColorGenius API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication
All endpoints require a Bearer token in the `Authorization` header (except `/auth/login` and `/auth/register`).

```
Authorization: Bearer <token>
```

---

## Clients

### GET /api/clients
List all clients with pagination and search.

**Query Parameters:**
| Name   | Type   | Default | Description                     |
|--------|--------|---------|---------------------------------|
| page   | int    | 1       | Page number (≥1)                |
| limit  | int    | 10      | Items per page (1–100)          |
| search | string | ""      | Filter by name, email, or phone |

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "c1",
        "first_name": "Sarah",
        "last_name": "Mitchell",
        "name": "Sarah Mitchell",
        "email": "sarah@email.com",
        "phone": "(555) 123-4567",
        "notes": "",
        "preferred_brand": "Wella",
        "hair_type": "medium",
        "formulations": 8,
        "lastVisit": "2026-04-20",
        "avgScore": 91,
        "nextAppt": "2026-05-18",
        "created_at": "2025-01-15T00:00:00Z",
        "updated_at": "2025-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 10,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

**Error Codes:**
| Status | Error                    |
|--------|--------------------------|
| 400    | Invalid page or limit    |
| 500    | Failed to load clients     |

---

### POST /api/clients
Create a new client.

**Request Body:**
```json
{
  "first_name": "Alice",
  "last_name": "Wonder",
  "email": "alice@example.com",
  "phone": "(555) 111-2222",
  "notes": "First-time client",
  "preferred_brand": "Redken",
  "hair_type": "fine"
}
```

**Required Fields:** `first_name`, `last_name`  
**Optional Fields:** `email`, `phone`, `notes`, `preferred_brand`, `hair_type`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "c1714101234567",
    "first_name": "Alice",
    "last_name": "Wonder",
    "name": "Alice Wonder",
    "email": "alice@example.com",
    "phone": "(555) 111-2222",
    "notes": "First-time client",
    "preferred_brand": "Redken",
    "hair_type": "fine",
    "formulations": 0,
    "lastVisit": null,
    "avgScore": null,
    "nextAppt": null,
    "created_at": "2026-04-26T05:53:54.567Z",
    "updated_at": "2026-04-26T05:53:54.567Z"
  }
}
```

**Error Codes:**
| Status | Error                    |
|--------|--------------------------|
| 400    | Validation failed (details array) |
| 500    | Failed to create client    |

---

### GET /api/clients/{id}
Retrieve a single client by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "c1",
    "first_name": "Sarah",
    "last_name": "Mitchell",
    "name": "Sarah Mitchell",
    "email": "sarah@email.com",
    ...
  }
}
```

**Error Codes:**
| Status | Error              |
|--------|--------------------|
| 404    | Client not found   |
| 500    | Failed to load client |

---

### PUT /api/clients/{id}
Full update of a client. Any omitted optional field is set to its current value.

**Request Body:**
Same shape as POST. All fields optional — only provided fields are updated.

**Response:**
```json
{
  "success": true,
  "data": { /* updated client */ }
}
```

**Error Codes:**
| Status | Error              |
|--------|--------------------|
| 400    | Validation failed  |
| 404    | Client not found   |
| 500    | Failed to update client |

---

### PATCH /api/clients/{id}
Alias to PUT. Use for partial updates.

**Request Body / Response / Errors:** Same as PUT.

---

### DELETE /api/clients/{id}
Remove a client permanently.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "c1",
    "deleted": true
  }
}
```

**Error Codes:**
| Status | Error              |
|--------|--------------------|
| 404    | Client not found   |
| 500    | Failed to delete client |

---

### GET /api/clients/{id}/history
Retrieve formulation history for a client.

**Query Parameters:**
| Name  | Type | Default | Description            |
|-------|------|---------|------------------------|
| page  | int  | 1       | Page number (≥1)       |
| limit | int  | 10      | Items per page (1–100) |

**Response:**
```json
{
  "success": true,
  "data": {
    "client_id": "c1",
    "history": [
      {
        "id": "f1",
        "date": "2026-04-20",
        "brand": "Wella Koleston Perfect ME",
        "product_line": "Koleston Perfect ME",
        "service_type": "Full Color",
        "current": { "level": 6, "tone": "N" },
        "target": { "level": 7, "tone": "G" },
        "components": [
          { "code": "7/3", "name": "Gold Medium Blonde", "amount_g": 60 }
        ],
        "developer": { "volume": 20, "amount_ml": 60 },
        "mixing_ratio": "1:1",
        "processing_minutes": 35,
        "score": 91,
        "stylist_notes": "Great result, slight warmth in front."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

**Error Codes:**
| Status | Error              |
|--------|--------------------|
| 400    | Invalid page or limit |
| 500    | Failed to load history |

---

## Standard Response Format

Every API response follows this envelope:

```json
{
  "success": true | false,
  "data": { ... },
  "error": "message",      // present when success is false
  "details": [ "..." ]     // present for 400 validation errors
}
```

---

## Database Schema (Clients)

```sql
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  notes TEXT,
  preferred_brand VARCHAR(100),
  hair_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
```

**Relations:**
- `clients.user_id` → `users.id`
- `formulations.client_id` → `clients.id` (via history)

---

## Error Codes Summary

| HTTP | Meaning                        |
|------|--------------------------------|
| 200  | OK                             |
| 201  | Created                        |
| 400  | Bad Request / Validation Error |
| 401  | Unauthorized (invalid token)   |
| 404  | Not Found                      |
| 500  | Internal Server Error          |

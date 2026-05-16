# Data Handling Technical Specification

## COLORgenius Platform — Data Retention, Deletion, and Export APIs

**Document Version:** 1.0  
**Last Updated:** 2026-05-15  
**Applies To:** Engineering and DevOps teams implementing data lifecycle management  

---

## 1. Overview

This specification defines the technical requirements for:
- Data retention policies and automated enforcement
- Data export functionality (GDPR Article 20 / CCPA Right to Know)
- Data deletion functionality (GDPR Article 17 / CCPA Right to Delete)
- Consent management data model
- Cross-system synchronization for deletions

---

## 2. Data Classification and Retention

### 2.1 Data Categories

| Category ID | Name | Description | Sensitivity |
|------------|------|-------------|-----------|
| CAT-001 | Client Profile | Name, contact info, demographics | Standard |
| CAT-002 | Service History | Appointments, services rendered | Standard |
| CAT-003 | Color Formulas | Technical formula data | Standard |
| CAT-004 | Payment Data | Transaction records (Square handles PCI) | Standard |
| CAT-005 | Photos | Before/after images | Sensitive |
| CAT-006 | Health Data | Allergies, pregnancy, conditions | Special Category |
| CAT-007 | Analytics | Usage patterns, aggregated metrics | Anonymized |
| CAT-008 | Consent Records | Consent timestamps, versions | Standard |
| CAT-009 | Communication | Emails, SMS, notifications | Standard |
| CAT-010 | Account Metadata | Login history, device info | Standard |

### 2.2 Retention Matrix

| Category | Active Retention | Post-Deletion Retention | Legal Hold | Basis |
|----------|-----------------|----------------------|-----------|-------|
| CAT-001 | 2 years from last service | 30 days (grace period) | Indefinite (if legal hold) | Contract |
| CAT-002 | 2 years from last service | 30 days | Indefinite | Contract |
| CAT-003 | 2 years from last service | 30 days | Indefinite | Legitimate Interest |
| CAT-004 | 7 years (tax compliance) | N/A | 7 years minimum | Legal Obligation |
| CAT-005 | 1 year from last service or consent withdrawal | 30 days | Indefinite | Consent |
| CAT-006 | Duration of active relationship | 30 days | Indefinite | Vital Interests/Consent |
| CAT-007 | 3 years (aggregated) | N/A | N/A | Anonymized |
| CAT-008 | Duration of relationship + 2 years | 2 years | 2 years minimum | Legal Obligation |
| CAT-009 | 1 year | 30 days | Indefinite | Legitimate Interest |
| CAT-010 | 1 year from last login | 30 days | Indefinite | Security |

### 2.3 Retention Rules Engine

```python
class RetentionPolicy:
    """
    Configuration for data retention policies
    """
    DEFAULT_RETENTION_YEARS = 2
    TAX_RETENTION_YEARS = 7
    PHOTO_RETENTION_YEARS = 1
    HEALTH_RETENTION_YEARS = None  # Duration of active relationship
    GRACE_PERIOD_DAYS = 30
    
    @staticmethod
    def calculate_retention_date(category_id, last_service_date, consent_withdrawn_date=None):
        """
        Calculate the deletion date for a data category
        """
        policies = {
            'CAT-001': {'years': 2, 'from': 'last_service'},
            'CAT-002': {'years': 2, 'from': 'last_service'},
            'CAT-003': {'years': 2, 'from': 'last_service'},
            'CAT-004': {'years': 7, 'from': 'transaction_date'},
            'CAT-005': {'years': 1, 'from': 'last_service_or_consent_withdrawal'},
            'CAT-006': {'years': None, 'from': 'active_relationship'},
            'CAT-008': {'years': 2, 'from': 'consent_withdrawal'},
            'CAT-009': {'years': 1, 'from': 'last_activity'},
            'CAT-010': {'years': 1, 'from': 'last_login'},
        }
        
        policy = policies.get(category_id)
        if not policy:
            return None
            
        if policy['from'] == 'last_service_or_consent_withdrawal':
            base_date = max(last_service_date, consent_withdrawn_date or last_service_date)
        elif policy['from'] == 'active_relationship':
            return None  # Deleted when account is deleted
        else:
            base_date = last_service_date
            
        if policy['years']:
            return base_date + timedelta(days=365 * policy['years'])
        return None
```

---

## 3. Data Export API

### 3.1 API Specification

#### GET /api/v1/clients/{clientId}/data-export

**Description:** Export all personal data for a client in machine-readable format.

**Authentication:** OAuth 2.0 + client ownership verification

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | UUID | Yes | Client identifier |
| `format` | String | No | `json` (default), `csv`, `zip` |
| `locale` | String | No | Language for human-readable sections |
| `categories` | Array | No | Specific categories to export (default: all) |

**Request Example:**
```http
GET /api/v1/clients/550e8400-e29b-41d4-a716-446655440000/data-export?format=json HTTP/1.1
Host: api.colorgenius.com
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "exportId": "export-uuid-123",
  "generatedAt": "2026-05-15T14:30:00Z",
  "format": "json",
  "client": {
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "dataSubject": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1-555-0123"
    }
  },
  "categories": {
    "clientProfile": {
      "category": "CAT-001",
      "data": {
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane@example.com",
        "phone": "+1-555-0123",
        "dateOfBirth": "1990-03-15",
        "createdAt": "2023-01-10T09:00:00Z",
        "lastUpdated": "2025-12-01T14:30:00Z"
      },
      "sources": ["direct_collection"],
      "purposes": ["service_delivery", "communication"],
      "retentionUntil": "2027-12-01T00:00:00Z"
    },
    "serviceHistory": {
      "category": "CAT-002",
      "data": {
        "appointments": [
          {
            "appointmentId": "apt-001",
            "date": "2025-11-15",
            "service": "Full Color",
            "stylist": "Sarah Smith",
            "notes": "Used 6N base"
          }
        ],
        "totalAppointments": 24,
        "firstVisit": "2023-01-15",
        "lastVisit": "2025-11-15"
      },
      "sources": ["salon_entry"],
      "purposes": ["service_delivery", "record_keeping"],
      "retentionUntil": "2027-11-15T00:00:00Z"
    },
    "colorFormulas": {
      "category": "CAT-003",
      "data": {
        "formulas": [
          {
            "formulaId": "frm-001",
            "createdDate": "2025-11-15",
            "baseColor": "6N",
            "developer": "20vol",
            "processingTime": "35min",
            "notes": "Root touch-up"
          }
        ]
      },
      "sources": ["stylist_entry"],
      "purposes": ["service_delivery", "formula_management"],
      "retentionUntil": "2027-11-15T00:00:00Z"
    },
    "healthData": {
      "category": "CAT-006",
      "data": {
        "allergies": ["PPD"],
        "sensitivities": ["fragrance"],
        "pregnancyStatus": null,
        "lastUpdated": "2025-06-01T10:00:00Z"
      },
      "sources": ["direct_collection_with_consent"],
      "purposes": ["safety_precaution"],
      "retentionUntil": "active_relationship",
      "specialCategory": true,
      "consentRecordId": "cons-001"
    },
    "photos": {
      "category": "CAT-005",
      "data": {
        "photos": [
          {
            "photoId": "img-001",
            "type": "before_after",
            "date": "2025-11-15",
            "url": "[temporary_export_url]",
            "consentRecordId": "cons-002"
          }
        ]
      },
      "sources": ["salon_capture_with_consent"],
      "purposes": ["service_documentation"],
      "retentionUntil": "2026-11-15T00:00:00Z",
      "specialCategory": true
    },
    "consentRecords": {
      "category": "CAT-008",
      "data": {
        "consents": [
          {
            "consentId": "cons-001",
            "purpose": "health_data_processing",
            "grantedAt": "2023-01-10T09:15:00Z",
            "version": "v1.2",
            "status": "active",
            "withdrawnAt": null
          },
          {
            "consentId": "cons-002",
            "purpose": "photo_collection",
            "grantedAt": "2025-11-15T14:30:00Z",
            "version": "v2.0",
            "status": "active",
            "withdrawnAt": null
          }
        ]
      },
      "sources": ["consent_ui"],
      "purposes": ["legal_compliance"],
      "retentionUntil": "2028-11-15T00:00:00Z"
    }
  },
  "metadata": {
    "totalCategories": 6,
    "specialCategoriesIncluded": ["healthData", "photos"],
    "processingHistory": [
      {
        "date": "2023-01-10T09:00:00Z",
        "action": "account_created",
        "system": "colorgenius"
      },
      {
        "date": "2025-11-15T14:30:00Z",
        "action": "service_completed",
        "system": "colorgenius"
      }
    ],
    "thirdPartyRecipients": [
      {
        "name": "Square",
        "purpose": "payment_processing",
        "dataShared": "transaction_data"
      },
      {
        "name": "Vagaro",
        "purpose": "scheduling",
        "dataShared": "appointment_data"
      }
    ]
  }
}
```

**Response Codes:**

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Data returned |
| 202 | Accepted | Large export queued, check status endpoint |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Invalid/expired token |
| 403 | Forbidden | Not authorized to access this client |
| 404 | Not Found | Client does not exist |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Retry with exponential backoff |

### 3.2 Async Export for Large Datasets

#### POST /api/v1/clients/{clientId}/data-export/async

**Description:** Queue an async export job for clients with large datasets.

**Response (202 Accepted):**
```json
{
  "jobId": "job-uuid-456",
  "status": "queued",
  "estimatedCompletion": "2026-05-15T15:00:00Z",
  "checkStatusUrl": "/api/v1/jobs/job-uuid-456/status",
  "deliveryMethod": "email_download_link"
}
```

#### GET /api/v1/jobs/{jobId}/status

**Response:**
```json
{
  "jobId": "job-uuid-456",
  "status": "completed",
  "progress": 100,
  "startedAt": "2026-05-15T14:30:00Z",
  "completedAt": "2026-05-15T14:45:00Z",
  "resultUrl": "https://downloads.colorgenius.com/exports/export-uuid-123.zip?token=secure-token",
  "expiresAt": "2026-05-22T14:45:00Z"
}
```

### 3.3 CSV Export Format

When `format=csv` is requested, a ZIP archive containing:

```
client-export-{clientId}-{timestamp}.zip
├── manifest.json              # Index and metadata
├── client_profile.csv         # CAT-001
├── service_history.csv        # CAT-002
├── color_formulas.csv         # CAT-003
├── photos/                    # CAT-005
│   ├── img-001.jpg
│   └── img-002.jpg
├── health_data.csv            # CAT-006
├── consent_records.csv        # CAT-008
└── README.txt                 # Human-readable explanation
```

---

## 4. Data Deletion API

### 4.1 API Specification

#### POST /api/v1/clients/{clientId}/deletion-request

**Description:** Initiate a data deletion request for a client.

**Authentication:** OAuth 2.0 + elevated privileges (or client self-service)

**Request Body:**
```json
{
  "requestorType": "client|salon|admin",
  "requestorId": "uuid",
  "reason": "client_request|gdpr_article_17|ccpa_deletion|account_closure",
  "verificationMethod": "email_confirmation|phone_otp|id_verification",
  "categories": ["all"],
  "effectiveImmediately": false,
  "notifyClient": true
}
```

**Response (202 Accepted):**
```json
{
  "deletionRequestId": "del-req-789",
  "status": "pending_verification",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "verificationRequired": {
    "method": "email_confirmation",
    "emailSentTo": "j***@example.com",
    "expiresAt": "2026-05-15T20:30:00Z"
  },
  "gracePeriodDays": 30,
  "estimatedCompletion": "2026-06-14T20:30:00Z",
  "checkStatusUrl": "/api/v1/deletion-requests/del-req-789/status"
}
```

### 4.2 Deletion Verification

#### POST /api/v1/deletion-requests/{requestId}/verify

**Request Body:**
```json
{
  "verificationCode": "123456",
  "method": "email_confirmation"
}
```

**Response (200 OK):**
```json
{
  "deletionRequestId": "del-req-789",
  "status": "verified",
  "gracePeriodEnd": "2026-06-14T20:30:00Z",
  "message": "Your account deletion has been confirmed. Your data will be permanently deleted after the grace period ends. You may cancel until then."
}
```

### 4.3 Grace Period and Reversal

#### POST /api/v1/deletion-requests/{requestId}/cancel

**Description:** Cancel a pending deletion request during grace period.

**Authentication:** Original requestor or client

**Response (200 OK):**
```json
{
  "deletionRequestId": "del-req-789",
  "status": "cancelled",
  "message": "Deletion request cancelled. Your account and data are restored."
}
```

### 4.4 Deletion Status Tracking

#### GET /api/v1/deletion-requests/{requestId}/status

**Response:**
```json
{
  "deletionRequestId": "del-req-789",
  "status": "in_progress",
  "stages": [
    {
      "stage": "verification",
      "status": "completed",
      "completedAt": "2026-05-15T20:45:00Z"
    },
    {
      "stage": "grace_period",
      "status": "completed",
      "completedAt": "2026-06-14T20:30:00Z"
    },
    {
      "stage": "active_deletion",
      "status": "in_progress",
      "startedAt": "2026-06-14T20:30:00Z",
      "progress": 65
    },
    {
      "stage": "cross_system_notification",
      "status": "pending"
    },
    {
      "stage": "confirmation",
      "status": "pending"
    }
  ],
  "estimatedCompletion": "2026-06-14T22:00:00Z"
}
```

### 4.5 Cross-System Deletion Protocol

When a client deletion is confirmed, COLORgenius must propagate deletion to integrated systems:

```
Sequence Diagram:

COLORgenius          Square              Vagaro
    |                    |                   |
    |--- DELETE request ->|                  |
    |                    |-- acknowledge --> |
    |                    |                   |
    |--- DELETE request -------------------->|
    |                    |                   |-- acknowledge
    |                    |                   |
    |<-- Square confirmation                 |
    |<-------------------- Vagaro confirmation |
    |                    |                   |
    |--- Log completion                       |
```

**API Contract with Square:**
```json
{
  "endpoint": "https://connect.squareup.com/v2/customers/{customerId}",
  "method": "DELETE",
  "headers": {
    "Authorization": "Bearer {square_access_token}",
    "Square-Version": "2026-04-16"
  },
  "webhookEvents": ["customer.deleted"]
}
```

**API Contract with Vagaro:**
```json
{
  "endpoint": "https://api.vagaro.com/v1/customers/{customerId}",
  "method": "DELETE",
  "headers": {
    "Authorization": "Bearer {vagaro_access_token}"
  }
}
```

**Fallback if API deletion fails:**
1. Log failure with full context
2. Queue for retry (exponential backoff, max 5 attempts)
3. Escalate to manual process after retries exhausted
4. Document in deletion audit log

---

## 5. Consent Management Data Model

### 5.1 Consent Record Schema

```sql
CREATE TABLE consent_records (
    consent_id UUID PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(client_id),
    purpose VARCHAR(100) NOT NULL,
    purpose_category VARCHAR(50),
    consent_type VARCHAR(20) CHECK (consent_type IN ('explicit', 'implied', 'opt_in', 'opt_out')),
    status VARCHAR(20) CHECK (status IN ('active', 'withdrawn', 'expired', 'pending')),
    
    -- Consent metadata
    version VARCHAR(20) NOT NULL,
    privacy_policy_version VARCHAR(20),
    terms_version VARCHAR(20),
    
    -- Timestamps
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    device_id VARCHAR(100),
    
    -- Proof
    consent_text TEXT NOT NULL,
    consent_language VARCHAR(10),
    proof_document_url VARCHAR(500),
    
    -- Withdrawal
    withdrawal_reason TEXT,
    withdrawal_method VARCHAR(50),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_consent_client ON consent_records(client_id);
CREATE INDEX idx_consent_purpose ON consent_records(purpose);
CREATE INDEX idx_consent_status ON consent_records(status);
```

### 5.2 Purpose Registry

```sql
CREATE TABLE consent_purposes (
    purpose_id VARCHAR(50) PRIMARY KEY,
    purpose_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    legal_basis VARCHAR(50),
    requires_explicit_consent BOOLEAN DEFAULT FALSE,
    is_special_category BOOLEAN DEFAULT FALSE,
    default_retention_days INTEGER,
    
    -- UI configuration
    display_name VARCHAR(200),
    display_description TEXT,
    display_order INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed data
INSERT INTO consent_purposes (purpose_id, purpose_name, category, legal_basis, requires_explicit_consent) VALUES
('service_delivery', 'Service Delivery', 'essential', 'contract', FALSE),
('marketing_email', 'Marketing Emails', 'marketing', 'consent', FALSE),
('marketing_sms', 'Marketing SMS', 'marketing', 'consent', FALSE),
('photo_collection', 'Photo Collection', 'special', 'consent', TRUE),
('photo_sharing', 'Photo Sharing', 'special', 'consent', TRUE),
('formula_marketplace', 'Formula Marketplace', 'sharing', 'consent', TRUE),
('health_data_processing', 'Health Data Processing', 'health', 'consent', TRUE),
('analytics', 'Analytics & Improvement', 'analytics', 'legitimate_interest', FALSE),
('third_party_sharing', 'Third-Party Sharing', 'sharing', 'consent', FALSE);
```

### 5.3 Consent Versioning

```sql
CREATE TABLE consent_versions (
    version_id VARCHAR(20) PRIMARY KEY,
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
    privacy_policy_url VARCHAR(500),
    terms_of_service_url VARCHAR(500),
    changes_summary TEXT,
    requires_reconsent BOOLEAN DEFAULT FALSE,
    affected_purposes VARCHAR(50)[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5.4 Consent API Endpoints

#### GET /api/v1/clients/{clientId}/consents

**Response:**
```json
{
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "consents": [
    {
      "consentId": "cons-001",
      "purpose": {
        "id": "service_delivery",
        "name": "Service Delivery",
        "category": "essential",
        "description": "Process your data to deliver salon services",
        "isRequired": true
      },
      "status": "active",
      "grantedAt": "2023-01-10T09:00:00Z",
      "version": "v1.0",
      "canWithdraw": false
    },
    {
      "consentId": "cons-002",
      "purpose": {
        "id": "marketing_email",
        "name": "Marketing Emails",
        "category": "marketing",
        "description": "Send promotional emails about services and offers",
        "isRequired": false
      },
      "status": "active",
      "grantedAt": "2023-01-10T09:00:00Z",
      "version": "v1.0",
      "canWithdraw": true,
      "withdrawalUrl": "/api/v1/consents/cons-002/withdraw"
    },
    {
      "consentId": "cons-003",
      "purpose": {
        "id": "photo_collection",
        "name": "Photo Collection",
        "category": "special",
        "description": "Take before/after photos for service documentation",
        "isRequired": false,
        "isSpecialCategory": true
      },
      "status": "active",
      "grantedAt": "2025-11-15T14:30:00Z",
      "version": "v2.0",
      "canWithdraw": true,
      "withdrawalUrl": "/api/v1/consents/cons-003/withdraw"
    }
  ],
  "lastUpdated": "2025-11-15T14:30:00Z"
}
```

#### PUT /api/v1/clients/{clientId}/consents

**Request:**
```json
{
  "consents": [
    {
      "purposeId": "marketing_email",
      "granted": false
    },
    {
      "purposeId": "photo_collection",
      "granted": true
    }
  ],
  "version": "v2.0",
  "acknowledgedAt": "2026-05-15T14:30:00Z"
}
```

#### POST /api/v1/consents/{consentId}/withdraw

**Request:**
```json
{
  "reason": "no_longer_interested",
  "effectiveDate": "immediate"
}
```

**Response:**
```json
{
  "consentId": "cons-002",
  "status": "withdrawn",
  "withdrawnAt": "2026-05-15T14:35:00Z",
  "effect": {
    "marketingEmails": "stopped",
    "dataDeletion": "scheduled_per_retention_policy"
  }
}
```

---

## 6. Automated Retention Enforcement

### 6.1 Retention Job Scheduler

```python
# Pseudocode for retention enforcement job

class RetentionEnforcementJob:
    def __init__(self):
        self.batch_size = 1000
        self.dry_run = False
    
    def run(self):
        """Main execution method"""
        # 1. Identify expired records
        expired_records = self.identify_expired_records()
        
        # 2. Check for legal holds
        records_to_delete = self.filter_legal_holds(expired_records)
        
        # 3. Execute deletions
        for batch in chunks(records_to_delete, self.batch_size):
            self.delete_batch(batch)
        
        # 4. Generate report
        self.generate_report(records_to_delete)
    
    def identify_expired_records(self):
        query = """
        SELECT client_id, category_id, MAX(retention_date) as retention_date
        FROM client_data
        WHERE retention_date < NOW()
          AND deletion_status IS NULL
        GROUP BY client_id, category_id
        """
        return database.execute(query)
    
    def filter_legal_holds(self, records):
        """Remove records under legal hold"""
        filtered = []
        for record in records:
            if not legal_hold_service.is_on_hold(record.client_id, record.category_id):
                filtered.append(record)
        return filtered
    
    def delete_batch(self, batch):
        """Execute deletion with audit logging"""
        for record in batch:
            with transaction():
                # Soft delete first
                self.soft_delete(record)
                
                # Log deletion
                audit_log.record(
                    action='retention_deletion',
                    client_id=record.client_id,
                    category=record.category_id,
                    reason='retention_policy_expired'
                )
                
                # Queue cross-system deletion
                if record.category_id in CROSS_SYSTEM_CATEGORIES:
                    queue.publish('cross-system-deletion', {
                        'client_id': record.client_id,
                        'category': record.category_id,
                        'systems': ['square', 'vagaro']
                    })
                
                if not self.dry_run:
                    transaction.commit()
```

### 6.2 Retention Report

#### GET /api/v1/admin/retention-report

**Response:**
```json
{
  "reportDate": "2026-05-15T00:00:00Z",
  "summary": {
    "totalClients": 15000,
    "recordsExpiringThisMonth": 342,
    "recordsDeletedThisMonth": 298,
    "recordsOnLegalHold": 44
  },
  "byCategory": {
    "CAT-001": {"expiring": 120, "deleted": 98, "onHold": 22},
    "CAT-002": {"expiring": 100, "deleted": 85, "onHold": 15},
    "CAT-003": {"expiring": 80, "deleted": 75, "onHold": 5},
    "CAT-005": {"expiring": 30, "deleted": 28, "onHold": 2},
    "CAT-006": {"expiring": 12, "deleted": 12, "onHold": 0}
  },
  "crossSystemStatus": {
    "square": {"pendingDeletions": 15, "confirmed": 283, "failed": 0},
    "vagaro": {"pendingDeletions": 12, "confirmed": 286, "failed": 0}
  }
}
```

---

## 7. Audit Logging

### 7.1 Audit Event Schema

```sql
CREATE TABLE audit_log (
    audit_id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Actor
    actor_type VARCHAR(20) CHECK (actor_type IN ('client', 'salon', 'admin', 'system')),
    actor_id UUID,
    
    -- Target
    client_id UUID,
    data_category VARCHAR(50),
    
    -- Action details
    action VARCHAR(50) NOT NULL,
    request_id UUID,
    ip_address INET,
    user_agent TEXT,
    
    -- Data changes
    before_state JSONB,
    after_state JSONB,
    
    -- Context
    reason VARCHAR(100),
    legal_basis VARCHAR(50),
    consent_id UUID,
    
    -- Result
    success BOOLEAN,
    error_message TEXT,
    
    -- Integrity
    checksum VARCHAR(64)  -- HMAC for tamper detection
);

CREATE INDEX idx_audit_client ON audit_log(client_id);
CREATE INDEX idx_audit_event_type ON audit_log(event_type);
CREATE INDEX idx_audit_timestamp ON audit_log(event_timestamp);
CREATE INDEX idx_audit_actor ON audit_log(actor_type, actor_id);
```

### 7.2 Required Audit Events

| Event Type | When to Log | Data to Capture |
|-----------|-------------|-----------------|
| `data_export_requested` | Client/salon requests data export | Requestor, categories requested, format |
| `data_export_completed` | Export generation complete | Export ID, size, delivery method |
| `deletion_requested` | Deletion request initiated | Requestor, reason, verification method |
| `deletion_verified` | Deletion request verified | Verification method, timestamp |
| `deletion_executed` | Data permanently deleted | Categories deleted, cross-system status |
| `deletion_cancelled` | Deletion cancelled during grace | Cancellor, reason |
| `consent_granted` | New consent obtained | Purpose, version, method |
| `consent_withdrawn` | Consent withdrawn | Purpose, reason, effective date |
| `consent_expired` | Consent reached expiration | Purpose, expiration date |
| `retention_deletion` | Automated retention deletion | Category, retention policy applied |
| `cross_system_deletion` | Deletion propagated to Square/Vagaro | System, status, retry count |
| `legal_hold_applied` | Legal hold placed | Reason, applied_by, expiration |
| `legal_hold_removed` | Legal hold removed | Reason, removed_by |

---

## 8. Implementation Checklist

### 8.1 Phase 1: Core APIs (Weeks 1-2)

- [ ] Implement data export endpoint (`GET /data-export`)
- [ ] Implement CSV/ZIP export format
- [ ] Implement async export for large datasets
- [ ] Implement deletion request endpoint (`POST /deletion-request`)
- [ ] Implement verification flow
- [ ] Implement grace period logic
- [ ] Implement deletion execution
- [ ] Implement cancellation during grace period
- [ ] Implement status tracking endpoints

### 8.2 Phase 2: Cross-System Integration (Weeks 3-4)

- [ ] Square API integration for customer deletion
- [ ] Vagaro API integration for customer deletion
- [ ] Webhook handling for deletion confirmations
- [ ] Retry logic with exponential backoff
- [ ] Fallback manual process documentation
- [ ] Cross-system deletion audit logging

### 8.3 Phase 3: Retention Automation (Weeks 5-6)

- [ ] Retention policy configuration database
- [ ] Automated retention scanning job
- [ ] Legal hold management system
- [ ] Retention report generation
- [ ] Email notifications before deletion
- [ ] Retention policy override capability

### 8.4 Phase 4: Consent Management (Weeks 7-8)

- [ ] Consent record database schema
- [ ] Purpose registry implementation
- [ ] Consent API endpoints
- [ ] Consent versioning system
- [ ] Withdrawal processing
- [ ] Consent audit trail
- [ ] Integration with data collection points

### 8.5 Phase 5: Testing and Validation (Weeks 9-10)

- [ ] Unit tests for all APIs
- [ ] Integration tests with Square sandbox
- [ ] Integration tests with Vagaro sandbox
- [ ] Load testing for export generation
- [ ] Security testing (authorization, authentication)
- [ ] GDPR compliance validation
- [ ] CCPA compliance validation
- [ ] End-to-end deletion flow testing
- [ ] Disaster recovery testing

---

## 9. Performance Considerations

### 9.1 Export Performance

| Dataset Size | Sync Response | Async Recommended |
|-------------|---------------|-------------------|
| < 10 MB | < 5 seconds | No |
| 10-100 MB | 5-30 seconds | Yes |
| > 100 MB | N/A | Yes (background job) |

**Optimizations:**
- Stream response for large exports
- Cache common export formats
- Pre-generate reports for inactive clients
- Use read replicas for export queries

### 9.2 Deletion Performance

| Operation | Expected Duration | Notes |
|-----------|------------------|-------|
| Soft delete (single client) | < 1 second | Immediate |
| Hard delete (single client) | < 5 seconds | After grace period |
| Cross-system notification | < 30 seconds | Async, best-effort |
| Bulk retention cleanup | Hours | Background job |

**Optimizations:**
- Soft delete immediately, hard delete in background
- Queue cross-system notifications
- Batch retention cleanup operations
- Archive before deletion for legal hold review

---

## 10. Security Requirements

### 10.1 Authentication and Authorization

| Endpoint | Required Role | Additional Checks |
|----------|--------------|-----------------|
| GET /data-export | Client (self), Salon (own clients), Admin | Ownership verification |
| POST /deletion-request | Client (self), Salon (own clients), Admin | Ownership + elevated verification |
| PUT /consents | Client (self), Salon (with client permission) | Granular permission check |
| GET /retention-report | Admin only | Role-based access control |

### 10.2 Data Protection

- Encrypt exports at rest (AES-256)
- Secure download links (time-limited, signed URLs)
- Log all access to exported data
- Mask sensitive data in logs
- Rate limit export requests (prevent data scraping)

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-15 | SKINgenius Engineering | Initial specification |

**Next Review Date:** 2026-11-15

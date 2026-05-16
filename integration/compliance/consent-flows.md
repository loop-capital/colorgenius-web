# Consent Flows — UI/UX Specification

> COLORgenius Platform · GDPR/CCPA Consent Management
> Last updated: 2026-05-15

---

## Overview

This spec defines how consent is collected, stored, and managed across the COLORgenius platform — covering salon owners (business users), their clients (data subjects), and stylists.

---

## 1. Consent Types

| Consent Type | Who | When | Required |
|---|---|---|---|
| **Platform Terms** | Salon owner | Account creation | ✅ Mandatory |
| **Data Processing** | Salon owner | OAuth connection (Square/Vagaro) | ✅ Mandatory |
| **POS Data Sync** | Salon owner | First sync trigger | ✅ Mandatory |
| **Client Data Collection** | Client (via salon) | First visit / profile creation | ✅ GDPR mandatory |
| **Formula Sharing** | Client | When formula enters marketplace | ✅ Mandatory |
| **Before/After Photos** | Client | Photo upload | ✅ Mandatory |
| **Marketing Communications** | Client | Opt-in, never pre-checked | ⚡ Optional |
| **Analytics & Improvement** | Salon owner | Settings → Privacy | ⚡ Optional |

---

## 2. Salon Owner Consent Flows

### 2.1 Account Creation

```
┌─────────────────────────────────────────────────┐
│  Welcome to COLORgenius                         │
│                                                 │
│  ○ Email: [________________]                    │
│  ○ Password: [____________]                     │
│                                                 │
│  ☑ I agree to the Terms of Service              │
│  ☑ I agree to the Privacy Policy                │
│                                                 │
│  [Create Account]                               │
│                                                 │
│  By creating an account, you confirm you are    │
│  a licensed salon professional or authorized    │
│  representative of a salon business.            │
└─────────────────────────────────────────────────┘
```

- Both checkboxes must be checked (GDPR: consent to processing)
- Links open full legal text in new tab
- No pre-checked boxes for optional consents

### 2.2 POS/Scheduling Connection (OAuth)

When salon owner connects Square or Vagaro:

```
┌─────────────────────────────────────────────────┐
│  🔗 Connect Square                              │
│                                                 │
│  COLORgenius will access:                       │
│                                                 │
│  ✅ Customer names, emails, phone numbers       │
│  ✅ Appointment history                         │
│  ✅ Transaction records                         │
│  ✅ Product inventory                           │
│                                                 │
│  ❌ We will NOT access:                         │
│     • Payment card details (handled by Square)  │
│     • Bank account information                  │
│     • Refund history                            │
│                                                 │
│  Data is encrypted in transit and at rest.      │
│  You can disconnect at any time.                │
│                                                 │
│  ☑ I authorize COLORgenius to sync my           │
│    salon data as described above                │
│                                                 │
│  [Connect Square]  [Cancel]                     │
│                                                 │
│  View our Data Processing Agreement →           │
└─────────────────────────────────────────────────┘
```

**Key UX rules:**
- Explicitly list what IS and IS NOT accessed
- Checkbox required before OAuth redirect
- "Disconnect anytime" reassurance
- Link to DPA prominently

### 2.3 Settings → Privacy Dashboard

```
┌─────────────────────────────────────────────────┐
│  ⚙️ Privacy & Data Settings                     │
│                                                 │
│  Connected Services                             │
│  ├─ Square ● Connected (syncing)  [Disconnect]  │
│  └─ Vagaro ○ Not connected       [Connect]      │
│                                                 │
│  Data Retention                                 │
│  ├─ Keep client data for: [2 years ▾]           │
│  └─ Auto-delete inactive clients: ☑             │
│                                                 │
│  Consent Preferences                            │
│  ├─ Share anonymized analytics: ☐               │
│  ├─ Receive product updates: ☑                  │
│  └─ Participate in beta features: ☐             │
│                                                 │
│  Data Export                                    │
│  [Export All My Data] (JSON, ready in 24h)      │
│                                                 │
│  Delete Account                                 │
│  [Request Account Deletion]                     │
│  ⚠️ This will delete all data permanently       │
│  after 30-day grace period                      │
└─────────────────────────────────────────────────┘
```

---

## 3. Client Consent Flows

Salon owners collect consent from their clients on behalf of COLORgenius. We provide the tools; the salon is the data controller.

### 3.1 Client Profile Creation (Salon-Initiated)

When a stylist creates a client profile in COLORgenius:

```
┌─────────────────────────────────────────────────┐
│  👤 New Client Profile                          │
│                                                 │
│  Name: [________________]                       │
│  Email: [_______________]                       │
│  Phone: [_______________]                       │
│                                                 │
│  ─── Consent ────────────────────────────────   │
│                                                 │
│  ☑ I consent to Pleij Salon storing my          │
│    hair color history and formula data          │
│    to improve my color services                 │
│                                                 │
│  ☐ I consent to my formula being shared         │
│    anonymously in the COLORgenius community     │
│    (without my name or personal info)           │
│                                                 │
│  ☐ I consent to receiving appointment           │
│    reminders and color maintenance tips         │
│    via email or SMS                             │
│                                                 │
│  [Save Profile]                                 │
│                                                 │
│  View Pleij Salon's Privacy Policy →            │
└─────────────────────────────────────────────────┘
```

**Key rules:**
- First consent (hair color history) is required for profile creation
- Formula sharing and marketing are optional, unchecked by default
- Client can revoke any consent later via client portal

### 3.2 Before/After Photo Consent

```
┌─────────────────────────────────────────────────┐
│  📸 Photo Consent                               │
│                                                 │
│  Your stylist would like to take a before/      │
│  after photo of your color service.             │
│                                                 │
│  ☑ I consent to my photo being taken and        │
│    stored in my client profile                  │
│                                                 │
│  ☐ I consent to my photo being shared           │
│    in the salon's portfolio or social media     │
│                                                 │
│  ☐ I consent to my photo being used in          │
│    the COLORgenius community (anonymized)       │
│                                                 │
│  You can revoke photo consent at any time.      │
│  Photos will be deleted within 30 days of       │
│  revocation.                                    │
│                                                 │
│  [Agree]  [No Photos]                           │
└─────────────────────────────────────────────────┘
```

### 3.3 Formula Marketplace Consent

When a formula is nominated for the marketplace:

```
┌─────────────────────────────────────────────────┐
│  🎨 Share This Formula?                         │
│                                                 │
│  Formula: 7/1 Ash Blonde + 20vol               │
│  Client: Jane D. (anonymized)                  │
│                                                 │
│  Before this formula is shared, we need         │
│  client consent. A consent request has been     │
│  sent to Jane via email/SMS.                    │
│                                                 │
│  Status: ⏳ Pending client consent              │
│                                                 │
│  Once approved, the formula will be shared:     │
│  • Without client name or personal info         │
│  • With before/after photos (if consented)      │
│  • With your attribution as the stylist         │
│                                                 │
│  [Cancel Request]  [Resend Consent Link]        │
└─────────────────────────────────────────────────┘
```

---

## 4. Consent Storage Schema

```typescript
interface ConsentRecord {
  id: string;
  entityType: 'salon_owner' | 'client' | 'stylist';
  entityId: string;
  consentType: ConsentType;
  granted: boolean;
  grantedAt: string; // ISO 8601
  revokedAt?: string;
  ipAddress?: string; // for audit trail
  userAgent?: string; // for audit trail
  consentVersion: string; // version of the consent text shown
  consentText: string; // exact text the user agreed to
  method: 'checkbox' | 'click' | 'verbal_confirmed_by_stylist';
}

type ConsentType =
  | 'platform_terms'
  | 'data_processing'
  | 'pos_data_sync'
  | 'client_data_collection'
  | 'formula_sharing'
  | 'photo_before_after'
  | 'photo_portfolio'
  | 'photo_community'
  | 'marketing_email'
  | 'marketing_sms'
  | 'analytics_improvement';
```

---

## 5. Consent Revocation Flow

### Client Revokes via Client Portal

1. Client clicks "Manage My Data" in portal
2. Sees all consents with toggle switches
3. Toggles off a consent
4. Confirmation dialog: "Revoking this consent will [effect]. Continue?"
5. System:
   - Updates consent record (sets `revokedAt`)
   - Triggers downstream actions:
     - `client_data_collection` revoked → anonymize client data
     - `formula_sharing` revoked → remove formula from marketplace
     - `photo_*` revoked → delete photos within 30 days
   - Logs revocation for audit trail
   - Sends confirmation to client

### Salon Owner Disconnects POS

1. Owner clicks "Disconnect" next to Square/Vagaro
2. Confirmation: "This will stop syncing new data. Previously synced data will be retained unless you delete it."
3. System:
   - Revokes OAuth token
   - Stops webhook listeners
   - Retains synced data (owner controls deletion separately)
   - Logs disconnect event

---

## 6. UI Component Library

### ConsentCheckbox

```tsx
interface ConsentCheckboxProps {
  consentType: ConsentType;
  required: boolean;
  label: string;
  description?: string;
  privacyPolicyUrl?: string;
  onChange: (granted: boolean) => void;
  value: boolean;
  disabled?: boolean;
}

// Usage:
<ConsentCheckbox
  consentType="client_data_collection"
  required={true}
  label="I consent to my hair color history being stored"
  description="This helps your stylist provide better, more consistent color services."
  privacyPolicyUrl="/privacy"
  onChange={handleConsentChange}
  value={consents.client_data_collection}
/>
```

### ConsentDashboard

```tsx
interface ConsentDashboardProps {
  entityType: 'salon_owner' | 'client';
  entityId: string;
  consents: ConsentRecord[];
  onRevoke: (consentId: string) => void;
  onExport: () => void;
  onDeleteAccount: () => void;
}
```

---

## 7. Audit Trail Requirements

Every consent action must be logged:

| Field | Description |
|-------|-------------|
| `timestamp` | When the action occurred |
| `entityType` | Who (salon, client, stylist) |
| `entityId` | Unique ID |
| `action` | `granted` or `revoked` |
| `consentType` | Which consent |
| `consentVersion` | Version of legal text shown |
| `ipAddress` | IP at time of action |
| `userAgent` | Browser/device info |
| `method` | How consent was collected |

Audit logs must be:
- Immutable (append-only)
- Retained for **6 years** (GDPR) or **3 years** (CCPA), whichever is longer
- Accessible for regulatory inspection
- Included in data export requests

---

## 8. Implementation Checklist

- [ ] Consent checkbox component (reusable, accessible)
- [ ] Consent storage table in Supabase
- [ ] Consent API endpoints (GET, POST revoke)
- [ ] OAuth connection consent gate (block sync until consented)
- [ ] Client portal consent management page
- [ ] Salon settings privacy dashboard
- [ ] Consent version tracking (update legal text, track who agreed to what)
- [ ] Automated data deletion on revocation
- [ ] Audit log system
- [ ] Email/SMS consent request flow (for marketplace formula sharing)
- [ ] Data export includes consent history
- [ ] 30-day grace period for account deletion

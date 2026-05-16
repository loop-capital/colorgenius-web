# CCPA/CPRA Compliance Checklist and Implementation Guide

## COLORgenius Platform — Salon POS Integration

**Document Version:** 1.0  
**Last Updated:** 2026-05-15  
**Applies To:** COLORgenius platform processing California salon client data via Square/Vagaro integrations  
**Legal Disclaimer:** This document provides general guidance on CCPA/CPRA compliance. It does not constitute legal advice. Consult a qualified attorney for legal opinions specific to your situation.

---

## 1. Understanding CCPA/CPRA Applicability

### 1.1 Does CCPA/CPRA Apply to COLORgenius?

**Yes**, CCPA/CPRA applies to COLORgenius if it meets ANY of the following thresholds (as a "business"):
- Gross annual revenues exceed $25 million
- Buys, sells, or shares personal information of 100,000+ California consumers/households/devices annually
- Derives 50%+ of annual revenue from selling or sharing California consumers' personal information

**Additionally, individual salons using COLORgenius may be subject to CCPA/CPRA if they meet these thresholds independently.**

### 1.2 Key Definitions

| Term | CCPA/CPRA Definition | COLORgenius Context |
|------|---------------------|---------------------|
| **Business** | Entity that determines purposes and means of processing | COLORgenius (for platform data); Individual salons (for their client data) |
| **Consumer** | California resident | Salon clients residing in California |
| **Personal Information (PI)** | Information that identifies, relates to, or could reasonably be linked with a consumer or household | Client names, contact info, service history, color formulas, photos, location data |
| **Sensitive Personal Information (SPI)** | SSN, financial account info, precise geolocation, racial/ethnic origin, biometric data, health data, sex life/orientation | Health data (allergies, pregnancy), before/after photos (potentially biometric) |
| **Sell** | Sharing PI for monetary or other valuable consideration | Formula marketplace sharing (if compensated) |
| **Share** | Transferring PI for cross-context behavioral advertising | Analytics, advertising integrations |
| **Service Provider** | Processes PI on behalf of a business | COLORgenius acts as service provider for salon client data |

---

## 2. Consumer Rights Under CCPA/CPRA

### 2.1 Right to Know (Right to Disclosure)

**What:** Consumers can request disclosure of personal information collected, sold, shared, or disclosed.

**CCPA Requirements:**

| Disclosure Type | Timeline | Content |
|----------------|----------|---------|
| **Categories of PI** (last 12 months) | Within 45 days (extendable to 90) | Categories collected, sources, business/commercial purposes, categories of third parties |
| **Specific Pieces of PI** | Within 45 days | Actual data collected about the consumer |
| **Sold/Shared PI** | Within 45 days | Categories sold/shared, categories of recipients |
| **Disclosed for Business Purposes** | Within 45 days | Categories disclosed, categories of recipients |

**COLORgenius Implementation:**

```
API Endpoint: GET /api/v1/clients/{clientId}/privacy-report

Response Format:
{
  "consumer": {
    "requestId": "uuid",
    "requestDate": "2026-05-15T00:00:00Z",
    "disclosurePeriod": "2025-05-15 to 2026-05-15"
  },
  "categoriesCollected": [
    {
      "category": "Identifiers",
      "examples": ["Name", "Phone number", "Email"],
      "sources": ["Direct from consumer", "Square integration"],
      "purposes": ["Service delivery", "Account management"],
      "retention": "2 years from last service"
    },
    {
      "category": "Commercial Information",
      "examples": ["Service history", "Color formulas", "Purchase records"],
      "sources": ["Direct from salon"],
      "purposes": ["Service delivery", "Formula management"]
    },
    {
      "category": "Biometric Information",
      "examples": ["Before/after photos"],
      "sources": ["Direct from salon"],
      "purposes": ["Service documentation"],
      "conditions": "Collected only with explicit consent"
    }
  ],
  "sellingAndSharing": {
    "sold": false,
    "shared": false,
    "recipients": []
  },
  "businessPurposeDisclosures": [
    {
      "category": "Service Providers",
      "recipients": ["Square (payment processing)", "Vagaro (scheduling)"],
      "purpose": "Payment processing and appointment scheduling"
    }
  ]
}
```

**UI Requirement:** "Privacy Report" or "My Data" section in client portal with one-click request.

### 2.2 Right to Delete

**What:** Consumers can request deletion of their personal information.

**CCPA Requirements:**
- Timeline: Within 45 days (extendable to 90 with notice)
- Must delete from all systems, including service provider systems
- Must direct service providers to delete

**Exceptions (data retained despite deletion request):**

| Exception | Application to COLORgenius |
|-----------|---------------------------|
| Complete transaction | Service records needed for warranty/returns |
| Security/fraud prevention | Fraud detection records |
| Debug/repair errors | Error logs (anonymized) |
| Exercise free speech | User-generated content (if applicable) |
| Legal obligation | Tax records, litigation holds |
| Internal uses aligned with consumer context | Internal analytics (anonymized) |

**COLORgenius Implementation:**

```
API Endpoint: DELETE /api/v1/clients/{clientId}/account

Deletion Process:
1. Consumer requests deletion (authenticated + email verification)
2. System identifies all PI across systems
3. 15-day verification period (consumer can cancel)
4. After verification: Delete from active databases
5. Notify Square and Vagaro to delete synced data
6. Purge from backups per retention schedule
7. Confirmation email to consumer
8. Completion within 45 days of verified request

API Endpoint for Salons: POST /api/v1/salons/{salonId}/client-deletion-request
- Salon can initiate on behalf of client (with client confirmation)
- Same process as consumer-initiated
```

**UI Requirement:** "Delete My Account" with clear explanation of what will/won't be deleted.

### 2.3 Right to Correct

**CPRA Addition:** Consumers can request correction of inaccurate personal information.

**COLORgenius Implementation:**
- Same as GDPR rectification (Article 16)
- Self-service editing in client portal
- Audit trail of corrections
- Timeline: Within 45 days

### 2.4 Right to Opt-Out of Sale/Sharing

**What:** Consumers can opt-out of the sale or sharing of their personal information.

**"Sale" Analysis for COLORgenius:**

| Activity | Is It a "Sale"? | Mitigation |
|----------|----------------|-----------|
| Sharing color formulas in marketplace (compensated) | **Likely YES** | Opt-in required; treat as sale for compliance |
| Sharing data with Square for payment processing | **NO** | Service provider exemption |
| Sharing data with Vagaro for scheduling | **NO** | Service provider exemption |
| Analytics data sharing (aggregated, anonymized) | **NO** | Not personal information |
| Sharing with marketing partners | **YES** (if valuable consideration) | Opt-out required or discontinue |

**"Sharing" Analysis:**

| Activity | Is It "Sharing"? | Mitigation |
|----------|----------------|-----------|
| Cross-context behavioral advertising | **Likely YES** if applicable | Opt-out link required |
| Standard service delivery | **NO** | Business purpose |

**COLORgenius Implementation:**

```
1. "Do Not Sell or Share My Personal Information" Link
   - Prominent placement: Footer of all pages, checkout flow
   - One-click toggle (no account required)
   - Immediate effect upon opt-out

2. Opt-Out Preference Signal (Global Privacy Control)
   - Honor browser-based opt-out signals (GPC, DNT)
   - Automatic opt-out if GPC signal detected
   - Document in privacy policy

3. API Endpoint: POST /api/v1/privacy/opt-out
   {
     "consumerId": "uuid",
     "optOutCategories": ["sale", "sharing", "targeted_advertising"],
     "effectiveDate": "immediate"
   }

4. Internal Enforcement:
   - Flag consumer record as "opted-out"
   - Block any sale/sharing activities for that consumer
   - Audit log of all opt-out requests and enforcement
   - Quarterly compliance audit
```

**UI Requirement:** Clear, conspicuous "Do Not Sell or Share My Personal Information" link in footer and settings.

### 2.5 Right to Limit Use of Sensitive Personal Information

**CPRA Addition:** Consumers can limit use and disclosure of SPI to what is necessary to perform services.

**SPI in COLORgenius Context:**

| SPI Category | Data | Required for Service? |
|--------------|------|----------------------|
| Health information | Allergies, pregnancy status | Only if health-sensitive services |
| Biometric information | Before/after photos | No (optional, with consent) |
| Precise geolocation | Salon location | Yes (for service delivery) |

**COLORgenius Implementation:**

```
"Limit Use of My Sensitive Personal Information" Option:

- Available in client privacy settings
- Allows consumer to restrict SPI use to "necessary services only"
- If selected:
  - Health data used only for allergy warnings during service
  - Photos not collected or deleted if existing
  - Location data used only for appointment (not marketing)
  - SPI not shared with any third parties beyond service providers

API: POST /api/v1/privacy/limit-spi
```

### 2.6 Right to Non-Discrimination

**What:** Businesses cannot discriminate against consumers for exercising CCPA rights.

**Prohibited Actions:**
- Denying goods or services
- Charging different prices or rates
- Providing different level or quality of goods/services
- Suggesting any of the above

**Permitted (with conditions):**
- Financial incentives for data collection (must be reasonably related to value of data)
- Different service levels if directly related to data value

**COLORgenius Implementation:**
- No differentiation in service quality based on privacy choices
- If offering incentives for data sharing (e.g., loyalty points for marketing consent), must:
  - Calculate reasonable value of data
  - Obtain explicit opt-in
  - Allow opt-out of incentive without service degradation
  - Document value calculation methodology

---

## 3. Business Obligations

### 3.1 Notice at Collection

**Requirement:** Provide notice at or before collecting personal information.

**COLORgenius Notice at Collection:**

```
Required Elements:
1. Categories of PI collected
2. Purposes for which each category will be used
3. Whether PI is sold or shared (and categories if so)
4. Retention periods (or criteria for determining retention)
5. Link to full privacy policy
6. For SPI: Clear notice of collection and purpose

Implementation:
- Display in client onboarding flow (first appointment booking)
- Available in client portal at all times
- Salon staff can provide printed version
- Acknowledgment required before proceeding (checkbox)
```

**Template Notice:** See `privacy-policy-template.md` for complete notice text.

### 3.2 Privacy Policy Requirements

**CCPA/CPRA Required Disclosures:**

| Requirement | Implementation |
|-------------|---------------|
| Categories of PI collected (last 12 months) | Listed in privacy policy |
| Categories of sources | Listed |
| Business/commercial purposes | Listed |
| Categories of third parties shared with | Listed |
| Categories of PI sold/shared | Listed or "We do not sell/share" |
| Consumer rights and how to exercise | Step-by-step instructions |
| Designated methods for submitting requests | Web form, email, phone |
| Response timeline | 45 days (+45 day extension) |
| Verification process | Described |
| Financial incentive programs | Disclosed if applicable |
| Opt-out rights | Prominent disclosure |
| SPI handling | Disclosed if collected |
| Retention practices | Described |
| Last updated date | Displayed |

### 3.3 Service Provider Contracts

**Requirement:** Written contracts prohibiting service providers from retaining, using, or disclosing PI for purposes outside the direct business relationship.

**COLORgenius Service Provider List:**

| Service Provider | Service | Data Shared | Contract Status |
|-----------------|---------|-------------|-----------------|
| Square, Inc. | Payment processing | Payment data, transaction history | DPA executed |
| Vagaro, Inc. | Appointment scheduling | Contact info, appointment data | DPA required |
| [Cloud provider] | Hosting | All platform data | DPA required |
| [Email service] | Communications | Email addresses | DPA required |
| [Analytics] | Platform analytics | Usage data (anonymized) | Data minimization contract |

**Required Contract Terms:**
- Specific business purpose for processing
- Prohibition on selling/sharing PI
- Prohibition on using PI outside contract purpose
- Obligation to delete/return PI upon contract termination
- Certification of understanding and compliance
- Sub-processor restrictions

### 3.4 Data Minimization and Retention

**CPRA Requirement:** Collect only PI that is relevant and limited to the purposes disclosed.

**COLORgenius Retention Policy:**

| Data Category | Retention Period | Rationale |
|--------------|-----------------|-----------|
| Client contact information | 2 years after last service | Service continuity, re-engagement |
| Service history | 2 years after last service | Reference for repeat services |
| Color formulas | 2 years after last service | Core platform function |
| Before/after photos | 1 year after last service or upon consent withdrawal | Documentation |
| Payment records | 7 years (tax/legal obligation) | IRS requirement |
| Health data (allergies) | Duration of service relationship | Safety |
| Appointment data | 2 years | Business analytics |
| Deleted account data | 30-day grace + backup purge | Operational needs |

**Automated Enforcement:**
- Automated deletion after retention period
- Email notification before deletion
- Option to extend (with re-consent)

---

## 4. Request Handling Procedures

### 4.1 Request Intake

| Method | Implementation |
|--------|---------------|
| **Web Form** | `/privacy/requests` — authenticated and unauthenticated options |
| **Email** | privacy@colorgenius.com |
| **Phone** | 1-800-COLOR-PI (toll-free) |
| **Authorized Agent** | Support via web form with power of attorney |

### 4.2 Verification Requirements

| Request Type | Verification Level |
|-------------|-------------------|
| Categories of PI | Reasonable (email confirmation) |
| Specific pieces of PI | High (government ID + account authentication) |
| Deletion | High (account authentication + email confirmation) |
| Correction | Reasonable (account authentication) |
| Opt-out | Minimal (email or browser signal) |

### 4.3 Response Timeline

| Step | Timeline |
|------|----------|
| Acknowledge receipt | Within 10 business days |
| Request additional verification (if needed) | Within 10 business days |
| Complete request | Within 45 calendar days |
| Extension (if necessary) | Up to 90 days total with notice |
| Denial with explanation | Within timeframe with specific reason |

### 4.4 Record Keeping

Maintain records of:
- All requests received (date, type, method)
- Verification steps taken
- Response provided
- Timeline met or reason for extension
- Appeals and resolutions

**Retention:** 24 months minimum

---

## 5. Employee Training

### 5.1 Required Training Topics

| Topic | Audience | Frequency |
|-------|----------|-----------|
| CCPA/CPRA basics | All employees | Annual |
| Consumer rights handling | Customer support | Quarterly |
| Request verification | Customer support, legal | Quarterly |
| Privacy policy content | All customer-facing | Annual |
| Opt-out procedures | Engineering, marketing | Annual |
| Incident response | Security, legal | Semi-annual |

### 5.2 Training Materials

- CCPA/CPRA overview presentation
- Mock request handling scenarios
- Escalation procedures
- Role-specific checklists

---

## 6. Compliance Audit Schedule

### 6.1 Internal Audits

| Area | Frequency | Responsible |
|------|-----------|-------------|
| Data inventory accuracy | Quarterly | Data Protection Officer |
| Privacy policy accuracy | Quarterly | Legal/Compliance |
| Request handling procedures | Quarterly | Customer Support Lead |
| Service provider contracts | Annual | Legal |
| Opt-out mechanism functionality | Monthly | Engineering |
| Retention policy enforcement | Monthly | Engineering |
| Employee training records | Annual | HR/Compliance |

### 6.2 External Audits

- Annual third-party security audit (SOC 2 Type II)
- Biennial privacy compliance assessment
- Ad-hoc audits following material changes

---

## 7. Penalties and Enforcement

### 7.1 Regulatory Penalties

| Violation | Penalty |
|-----------|---------|
| Non-intentional violations | Up to $2,500 per violation |
| Intentional violations | Up to $7,500 per violation |
| Violations involving minors | Up to $7,500 per violation |
| Cure period | 30 days (if provided by AG) |

### 7.2 Private Right of Action

- **Data breaches only**
- Consumers can sue for statutory damages ($100-$750 per consumer per incident) or actual damages
- Requires failure to maintain reasonable security
- 30-day cure period applies

**COLORgenius Risk Mitigation:**
- Maintain reasonable security measures (encryption, access controls)
- Document security practices
- Cyber insurance coverage
- Incident response plan

---

## 8. Comparison: CCPA/CPRA vs. GDPR

| Aspect | GDPR | CCPA/CPRA |
|--------|------|-----------|
| **Scope** | All EU residents | California residents only |
| **Applies to** | Any processing of personal data | Businesses meeting thresholds |
| **Definition of personal data** | Broad (any identifiable person) | Broad (identifies, relates to, or could reasonably be linked) |
| **Sensitive data** | Special categories (explicit consent) | SPI (limit use/disclosure) |
| **Right to know** | Yes (access) | Yes (categories + specific pieces) |
| **Right to delete** | Yes (with exceptions) | Yes (with exceptions) |
| **Right to correct** | Yes | Yes (CPRA addition) |
| **Right to portability** | Yes | Limited (specific pieces, 12 months) |
| **Opt-out of sale** | N/A (consent-based) | Yes (prominent link required) |
| **Opt-in for minors** | Yes (under 16) | Yes (under 16 for sale) |
| **Financial incentives** | Permitted with conditions | Permitted with conditions |
| **Enforcement** | Supervisory authorities | CA Attorney General + CPPA |
| **Penalties** | Up to 4% global turnover or €20M | Up to $7,500 per violation |
| **Private right of action** | Limited | Data breaches only |

**Key Differences for Implementation:**
- CCPA has explicit "sale" and "sharing" concepts; GDPR is consent-based
- CCPA requires prominent opt-out links; GDPR requires opt-in for most processing
- CCPA has 30-day cure period; GDPR does not
- CCPA thresholds mean smaller salons may not be subject to CCPA

---

## 9. Implementation Checklist

### 9.1 Pre-Launch Requirements

- [ ] **Privacy Policy:** CCPA/CPRA-compliant privacy policy published
- [ ] **Notice at Collection:** Implemented at all collection points
- [ ] **Consumer Rights:** Web form, email, and phone intake operational
- [ ] **Opt-Out Link:** "Do Not Sell or Share My Personal Information" on all pages
- [ ] **GPC Support:** Browser opt-out signals honored
- [ ] **Service Provider Contracts:** All contracts include CCPA/CPRA required provisions
- [ ] **Verification Procedures:** Documented and implemented
- [ ] **Retention Schedule:** Defined and automated
- [ ] **Employee Training:** Completed for all relevant staff
- [ ] **Request Tracking:** System for logging and managing requests

### 9.2 Ongoing Compliance

- [ ] **Quarterly Reviews:** Privacy policy and data inventory updates
- [ ] **Monthly Opt-Out Testing:** Verify mechanisms function correctly
- [ ] **Annual Employee Training:** Refresh CCPA/CPRA knowledge
- [ ] **Annual Service Provider Audit:** Verify compliance
- [ ] **Biennial External Assessment:** Third-party compliance review
- [ ] **Request Metrics:** Track volume, types, and response times
- [ ] **Cure Period Readiness:** 30-day response capability maintained

---

## 10. Salon Owner CCPA/CPRA Guide

### 10.1 Are Individual Salons Subject to CCPA/CPRA?

**Salons must independently assess if they meet thresholds:**
- Annual gross revenues > $25 million? **→ Subject to CCPA**
- Buy/sell/share PI of 100,000+ CA consumers? **→ Subject to CCPA**
- 50%+ revenue from selling PI? **→ Subject to CCPA**
- **Most individual salons will NOT meet these thresholds**

### 10.2 What Salon Owners Must Do

Even if not directly subject to CCPA/CPRA:

1. **Understand Platform Practices:** Review COLORgenius privacy policy
2. **Client Communication:** Be prepared to answer basic privacy questions
3. **Data Handling:** Follow COLORgenius security protocols
4. **Breach Reporting:** Report suspected breaches to COLORgenius within 24 hours
5. **Record Keeping:** Maintain client service records per platform retention policy

### 10.3 What COLORgenius Handles

- Platform-level privacy policy and notices
- Technical implementation of consumer rights
- Service provider management
- Cross-border compliance (GDPR/CCPA overlap)
- Security measures and breach response

---

## Appendix A: CCPA/CPRA Reference Links

- Full CCPA Text (as amended by CPRA): https://oag.ca.gov/privacy/ccpa
- CPRA Regulations: https://cppa.ca.gov/regulations/
- California Attorney General CCPA Guide: https://oag.ca.gov/privacy/ccpa
- CPPA (California Privacy Protection Agency): https://cppa.ca.gov/
- Global Privacy Control: https://globalprivacycontrol.org/

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-15 | SKINgenius Compliance Team | Initial document |

**Next Review Date:** 2026-11-15

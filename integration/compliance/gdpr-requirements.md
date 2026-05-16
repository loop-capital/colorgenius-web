# GDPR Compliance Checklist and Implementation Guide

## COLORgenius Platform — Salon POS Integration

**Document Version:** 1.0  
**Last Updated:** 2026-05-15  
**Applies To:** COLORgenius platform processing EU salon client data via Square/Vagaro integrations  
**Legal Disclaimer:** This document provides general guidance on GDPR compliance. It does not constitute legal advice. Consult a qualified attorney for legal opinions specific to your situation.

---

## 1. Understanding GDPR Applicability

### 1.1 Does GDPR Apply to COLORgenius?

**Yes**, GDPR applies if:
- Your salon clients (data subjects) are located in the EU/EEA
- You process their personal data in any way
- You offer goods or services to EU residents, or monitor their behavior

### 1.2 Roles Under GDPR

| Role | Entity | Responsibility |
|------|--------|--------------|
| **Data Controller** | Individual Salon Owner | Determines purposes and means of processing client data |
| **Data Processor** | COLORgenius (Platform) | Processes data on behalf of salons per their instructions |
| **Sub-Processor** | Square, Vagaro | Additional processors that handle data for payment/scheduling |

**Key Point:** COLORgenius is a processor for salon client data but may be a controller for its own platform account data.

---

## 2. Lawful Basis for Processing

### 2.1 Article 6 Lawful Bases Available

For salon client data processed through COLORgenius:

| Basis | Applicability | Implementation |
|-------|--------------|----------------|
| **Contract** (Art. 6(1)(b)) | Processing necessary to deliver color services the client requested | Primary basis for appointment scheduling, service history |
| **Legitimate Interest** (Art. 6(1)(f)) | Platform improvements, fraud prevention, analytics | Must balance against client rights; document assessment |
| **Consent** (Art. 6(1)(a)) | Marketing communications, formula sharing in marketplace | Must be freely given, specific, informed, unambiguous |
| **Legal Obligation** (Art. 6(1)(c)) | Tax records, regulatory requirements | Limited to specific statutory requirements |

### 2.2 Special Category Data (Article 9)

Salon data that may trigger Article 9 (special categories):

| Data Type | Category | Lawful Basis Required |
|-----------|----------|----------------------|
| Allergy information | Health data | Explicit consent OR substantial public interest (if medical necessity proven) |
| Pregnancy status | Health data | Explicit consent |
| Skin conditions (psoriasis, eczema) | Health data | Explicit consent |
| Before/after photos | Biometric-adjacent | Explicit consent; may be biometric data if used for identification |

### 2.3 Implementation: Lawful Basis Documentation

```
For each data processing activity, document:
1. Purpose of processing
2. Lawful basis claimed
3. Why this basis is appropriate
4. How the basis is communicated to data subjects
5. Review date for ongoing validity
```

**COLORgenius Platform Requirement:** Implement a "Processing Activity Register" in the admin dashboard where salon owners can document their lawful bases.

---

## 3. Data Minimization and Purpose Limitation

### 3.1 Data Minimization Principle (Article 5(1)(c))

**Rule:** Collect only what is necessary for the specific purpose.

**COLORgenius Implementation:**

| Data Element | Necessary? | Collection Point |
|--------------|-----------|------------------|
| Client name | Yes | Account creation |
| Phone number | Yes | Appointment confirmation |
| Email address | Yes | Account recovery, receipts |
| Hair color history | Yes | Core platform function |
| Formula details | Yes | Core platform function |
| Payment card data | No (handled by Square/Vagaro) | Excluded from COLORgenius storage |
| Home address | Optional | Only if delivery services offered |
| Date of birth | Conditional | Only if age-restricted services |
| Allergy information | Conditional | Only if health-sensitive services |
| Before/after photos | Optional | Explicit consent required |

### 3.2 Purpose Limitation (Article 5(1)(b))

**Rule:** Data collected for one purpose cannot be used for incompatible purposes.

**COLORgenius Requirements:**
- Hair color history → Service delivery only
- Formula data → Client record + marketplace sharing (only with explicit consent)
- Appointment data → Scheduling only
- Analytics data → Must be anonymized/aggregated

---

## 4. Data Subject Rights Implementation

### 4.1 Right to Access (Article 15)

**What:** Data subjects can request copies of their personal data.

**COLORgenius Implementation:**
```
API Endpoint: GET /api/v1/clients/{clientId}/data-export
- Returns all personal data stored about the client
- Includes: profile data, service history, formulas, appointments, photos
- Format: Structured, commonly used, machine-readable (JSON/CSV)
- Timeline: Within 30 days of request
- Cost: Free for first request; reasonable fee for excessive requests
```

**UI Requirement:** "Download My Data" button in client portal.

### 4.2 Right to Rectification (Article 16)

**What:** Data subjects can correct inaccurate data.

**COLORgenius Implementation:**
```
API Endpoints:
- PUT /api/v1/clients/{clientId}/profile
- PUT /api/v1/clients/{clientId}/preferences
- Admin override: Salon staff can update service records with audit trail
```

**UI Requirement:** Self-service profile editing in client portal.

### 4.3 Right to Erasure ("Right to be Forgotten") (Article 17)

**What:** Data subjects can request deletion of their personal data.

**COLORgenius Implementation:**
```
API Endpoint: DELETE /api/v1/clients/{clientId}/account

Deletion Process:
1. Client or salon initiates deletion request
2. System verifies identity (email confirmation + authentication)
3. 30-day grace period (reversible deletion)
4. After grace period: Permanent deletion from active databases
5. Backups purged per retention schedule (see Section 8)
6. Notification sent to Square/Vagaro to delete synced data
7. Confirmation email sent to client

Exceptions (data retained despite erasure request):
- Tax/audit records (legal obligation, Art. 17(3)(b))
- Anonymized analytics data (no longer personal data)
```

**UI Requirement:** "Delete My Account" button with confirmation flow and consequences explanation.

### 4.4 Right to Data Portability (Article 20)

**What:** Data subjects can receive their data in a structured, machine-readable format and transfer it.

**COLORgenius Implementation:**
```
API Endpoint: GET /api/v1/clients/{clientId}/data-export?format=standard

Standard Format:
- JSON schema for structured data
- CSV for tabular data (appointments, services)
- ZIP archive for photos
- Includes metadata (data categories, processing purposes, retention periods)

Machine-Readable Requirement:
- Follow industry standards (schema.org/HealthAndBeautyBusiness where applicable)
- Include processing history and data source information
```

### 4.5 Right to Object (Article 21)

**What:** Data subjects can object to processing based on legitimate interests or for direct marketing.

**COLORgenius Implementation:**
```
For Marketing:
- One-click unsubscribe in all emails
- Opt-out preference center in client portal
- Immediate cessation of marketing communications

For Legitimate Interests Processing:
- Objection form in client portal
- Automated review workflow
- Human review for complex cases
- Decision communicated within 30 days
```

### 4.6 Right to Restriction of Processing (Article 18)

**What:** Data subjects can request limitation of processing in specific circumstances.

**COLORgenius Implementation:**
```
Scenarios Triggering Restriction:
- Client contests accuracy of data (processing restricted during verification)
- Processing is unlawful but client opposes erasure
- Controller no longer needs data but client needs it for legal claims
- Client has objected to processing (restricted during objection review)

Technical Implementation:
- Flag record as "restricted" in database
- Prevent all processing except storage and legal claims support
- Clear audit trail of restriction and lifting
```

---

## 5. Data Processing Agreements (DPAs)

### 5.1 DPA with Square

Square provides a standard DPA at: https://squareup.com/us/en/legal/general/privacy-no-account  
**Required Actions:**
1. Review Square's DPA for adequacy
2. Ensure it covers: data categories, processing purposes, sub-processor list, security measures, breach notification, audit rights
3. Document acceptance in COLORgenius compliance records
4. Monitor Square's DPA updates (notify salons of material changes)

### 5.2 DPA with Vagaro

Vagaro's DPA should be requested from: privacy@vagaro.com or via their business support.  
**Required Actions:**
1. Obtain signed/executed DPA from Vagaro
2. Verify coverage of all data categories synced from COLORgenius
3. Ensure onward transfer protections if Vagaro uses sub-processors
4. Document in compliance register

### 5.3 DPA Template for COLORgenius (Processor → Salon)

See `dpa-templates.md` for a complete DPA template that COLORgenius should provide to salon owners.

---

## 6. Cross-Border Data Transfers (EU → US)

### 6.1 Legal Mechanisms for Transfer

| Mechanism | Applicability | COLORgenius Action |
|-----------|--------------|-------------------|
| **Adequacy Decision** | Only if US receives adequacy (currently partial via EU-US Data Privacy Framework) | Monitor adequacy status; not fully reliable for all transfers |
| **Standard Contractual Clauses (SCCs)** | Most common mechanism | Implement EU Commission SCCs for transfers to Square/Vagaro |
| **Binding Corporate Rules** | For intra-group transfers | Not applicable unless COLORgenius has EU subsidiaries |
| **Derogations** | Specific situations only | Backup mechanism only |

### 6.2 Standard Contractual Clauses Implementation

**Required Actions:**
1. Use EU Commission's 2021 SCCs (updated version)
2. Module Two: Controller → Processor (Salon → COLORgenius)
3. Module Three: Processor → Processor (COLORgenius → Square/Vagaro)
4. Conduct Transfer Impact Assessment (TIA) for each recipient
5. Document supplementary measures if needed (encryption, pseudonymization)

### 6.3 Transfer Impact Assessment (TIA)

```
TIA Template for Square/Vagaro:
1. Describe the transfer (data categories, purposes, recipients)
2. Review laws and practices in destination country
3. Assess necessity and proportionality of transfer
4. Identify and adopt supplementary measures
5. Re-evaluate at least annually or upon legal changes
6. Document and make available to supervisory authority upon request
```

---

## 7. Data Breach Notification

### 7.1 Article 33 — Notification to Supervisory Authority

| Requirement | Details |
|-------------|---------|
| **Timeline** | Without undue delay and, where feasible, within 72 hours of becoming aware |
| **Content** | Nature of breach, categories and approximate number of data subjects, likely consequences, measures taken/proposed |
| **Method** | Through supervisory authority's online form (varies by EU member state) |
| **Exception** | If breach is unlikely to result in risk to rights and freedoms |

### 7.2 Article 34 — Communication to Data Subjects

| Requirement | Details |
|-------------|---------|
| **Trigger** | High risk to rights and freedoms |
| **Timeline** | Without undue delay |
| **Content** | Clear language description, contact details for more information, measures taken, steps data subjects can take |
| **Method** | Direct communication (email/SMS) unless disproportionate effort |

### 7.3 COLORgenius Breach Response Plan

```
Phase 1: Detection and Assessment (0-24 hours)
- Automated monitoring alerts (unusual access patterns, failed authentication spikes)
- Incident response team activation
- Initial severity assessment
- Containment measures (isolate affected systems)

Phase 2: Investigation (24-48 hours)
- Forensic analysis to determine scope
- Identify affected data subjects and data categories
- Assess risk level (likelihood × severity of harm)
- Determine if notification threshold met

Phase 3: Notification (if required, within 72 hours)
- Draft supervisory authority notification
- Draft client communication (if high risk)
- Notify affected salons
- Coordinate with Square/Vagaro if their systems affected

Phase 4: Remediation and Follow-up
- Fix vulnerability
- Implement additional safeguards
- Document lessons learned
- Update risk register
```

---

## 8. Data Protection Impact Assessment (DPIA)

### 8.1 When a DPIA is Required (Article 35)

COLORgenius must conduct a DPIA for:
- **Systematic and extensive profiling** with significant effects (not currently applicable)
- **Large-scale processing of special category data** (health data, biometric data — APPLICABLE for allergy/pregnancy data and photos)
- **Systematic monitoring of publicly accessible area** (not applicable)
- **High-risk processing** as determined by supervisory authority guidelines

### 8.2 DPIA Template for COLORgenius

```markdown
## DPIA: Salon Client Data Processing via COLORgenius Platform

### 1. Description of Processing
- Nature: Collection, storage, analysis of salon client data
- Scope: All EU salon clients using integrated POS/scheduling
- Context: Salon services delivery, color formula management
- Purposes: Service delivery, record-keeping, optional marketplace sharing

### 2. Necessity and Proportionality Assessment
- Is processing necessary for the stated purposes? [Yes/No + justification]
- Is the scope limited to what is necessary? [Assessment]
- Are less intrusive alternatives available? [Analysis]

### 3. Risk Assessment
| Risk | Likelihood | Severity | Overall | Mitigation |
|------|-----------|----------|---------|------------|
| Unauthorized access to client health data | Medium | High | High | Encryption, access controls, audit logs |
| Data breach exposing color formulas | Medium | Medium | Medium | Encryption, network segmentation |
| Misuse of before/after photos | Low | High | Medium | Explicit consent, watermarking, access controls |
| Cross-border transfer risks | Medium | Medium | Medium | SCCs, TIA, supplementary measures |

### 4. Measures to Address Risks
- Technical: Encryption at rest and in transit, pseudonymization where possible
- Organizational: Staff training, access controls, incident response plan
- Legal: DPAs, SCCs, clear privacy notices

### 5. Residual Risk
- Assessment after mitigation measures
- Acceptance criteria and sign-off

### 6. Review Schedule
- Re-assess: Annually or upon significant change
```

---

## 9. Privacy by Design and Default

### 9.1 Article 25 Requirements

**Privacy by Design:**
- Data protection embedded into platform development lifecycle
- Privacy considerations in architecture decisions
- Data minimization as default configuration

**Privacy by Default:**
- New salon accounts: Minimum data collection settings
- Features requiring additional data: Opt-in, not pre-enabled
- Data sharing: Disabled by default, explicit enablement required
- Retention: Shortest necessary period as default

### 9.2 COLORgenius Implementation Checklist

```
[ ] Default data retention: 2 years (configurable by salon)
[ ] Marketing consent: Unchecked by default
[ ] Photo sharing: Disabled by default
[ ] Analytics: Anonymized by default
[ ] Data export: Self-service available
[ ] Account deletion: Self-service available
[ ] Granular consent: Separate toggles for each purpose
[ ] Data minimization prompts: Warn when collecting beyond minimum
```

---

## 10. Records of Processing Activities (Article 30)

### 10.1 COLORgenius Must Maintain Records

As a processor (and potentially controller for platform data):

| Required Information | COLORgenius Entry |
|---------------------|-------------------|
| Name and contact details of processor/controller | COLORgenius, Inc. [contact] |
| Categories of processing | Salon client data management, color formula storage, appointment scheduling |
| Categories of data subjects | Salon clients (EU residents) |
| Categories of personal data | Contact info, service history, color formulas, photos, health data (conditional) |
| Categories of recipients | Salon owners, Square (payments), Vagaro (scheduling) |
| Transfers to third countries | US (Square HQ), identify Vagaro's jurisdiction |
| Deletion time limits | Per salon configuration (default 2 years post-last service) |
| Security measures | Encryption (AES-256), access controls, audit logging |

### 10.2 Salon Owner Records

Each salon must maintain their own Article 30 record. COLORgenius should provide a template.

---

## 11. Appointment of EU Representative (Article 27)

### 11.1 Requirement

If COLORgenius is not established in the EU but offers services to EU residents, it must appoint an EU representative.

### 11.2 Implementation

```
Action Required:
- Appoint EU-based representative (legal service firm)
- Include representative contact in privacy policy
- Make representative available to supervisory authorities and data subjects
- Grant representative mandate to receive legal documents

Exceptions (if applicable):
- Processing is occasional
- Does not include large-scale processing of special categories
- Low risk to rights and freedoms
[Legal review required to determine if exception applies]
```

---

## 12. Compliance Checklist Summary

### 12.1 Immediate Actions (Required Before EU Launch)

- [ ] **DPIA Conducted:** Complete DPIA for special category data processing
- [ ] **Privacy Policy:** Finalize and publish GDPR-compliant privacy policy
- [ ] **DPAs Executed:** Signed DPAs with Square and Vagaro
- [ ] **SCCs Implemented:** Standard Contractual Clauses for EU-US transfers
- [ ] **Data Subject Rights:** Implement access, rectification, erasure, portability
- [ ] **Consent Management:** Build granular consent UI for clients
- [ ] **Breach Response Plan:** Document and test incident response procedures
- [ ] **EU Representative:** Appoint (if required)
- [ ] **Article 30 Records:** Create and maintain processing records
- [ ] **Staff Training:** Train support team on GDPR requirements

### 12.2 Ongoing Compliance

- [ ] **Quarterly Reviews:** Assess processing activities and lawful bases
- [ ] **Annual DPIA Review:** Update DPIA based on system changes
- [ ] **DPA Monitoring:** Review processor DPAs for updates
- [ ] **Breach Testing:** Tabletop exercise annually
- [ ] **Consent Audits:** Verify consent records are complete and valid
- [ ] **Data Retention Enforcement:** Automated deletion of expired data
- [ ] **Supervisory Authority Registration:** Register with relevant EU authorities if required

---

## 13. Salon Owner Guidance

### 13.1 What Salon Owners Must Do

1. **Provide Privacy Notice:** Display or provide privacy notice to clients before first data collection
2. **Obtain Valid Consent:** For special category data and marketing
3. **Respond to Client Requests:** Forward access/erasure requests to COLORgenius within 5 days
4. **Maintain Records:** Keep Article 30 processing records
5. **Train Staff:** Ensure employees understand data protection obligations
6. **Report Breaches:** Notify COLORgenius within 24 hours of suspected breach

### 13.2 What COLORgenius Handles for Salons

- Platform security and encryption
- Processor obligations under Article 28
- Sub-processor management (Square/Vagaro)
- Technical implementation of data subject rights
- Cross-border transfer mechanisms
- Breach notification to authorities (as processor, if responsible)

---

## Appendix A: GDPR Reference Links

- Full GDPR Text: https://gdpr.eu/tag/chapter-1/
- Article 30 Records Template: https://gdpr.eu/article-30-records-of-processing-activities/
- DPIA Template: https://gdpr.eu/data-protection-impact-assessment-template/
- SCCs (2021): https://commission.europa.eu/publications/standard-contractual-clauses-international-transfers_en
- EU Data Protection Board Guidelines: https://edpb.europa.eu/our-work-tools/general-guidance/guidelines_en

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-15 | SKINgenius Compliance Team | Initial document |

**Next Review Date:** 2026-11-15

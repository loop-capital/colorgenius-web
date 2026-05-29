# COLORgenius Formula Enhancement Design

## Status: DRAFT — Pending Review
## Created: 2026-05-28
## Author: Che (Master Orchestrator)
## Reviewers: Pending (colorgenius-architect, colorgenius-dev, Jason)

---

## 1. PROBLEM STATEMENT

### Current Limitations
1. AI-generated formulas cannot be modified after generation — stylists must accept AI output or start over
2. Manual formula entry exists but is hidden inside wizard flow — not discoverable
3. No way for experienced stylists to create formulas from scratch with full control
4. All formula types (AI/manual) already support weighing, but UX doesn't make this clear

### User Impact
- Stylists with strong preferences must fight the AI instead of collaborating with it
- New stylists don't know they can build formulas manually
- Color Bar weighing mode exists but feels disconnected from formula creation

---

## 2. DESIGN PRINCIPLES

1. **AI is a collaborator, not a replacement** — every AI formula should be editable
2. **Manual creation is a first-class citizen** — not a hidden fallback
3. **Web-mobile parity** — features identical across platforms
4. **Progressive disclosure** — simple by default, powerful when needed

---

## 3. FEATURES

### Feature 1: "My Formula" Button (Manual Creation)

**Placement:** Step 5 (Review & Generate) next to "Generate Formula"

**Mobile Design:**
- Outline button style (purple border, purple text, no fill)
- Text: "My Formula" (shorter than "Formulate Manually")
- Positioned secondary to "Generate Formula" (left or below)

**Web Design:**
- Outline button style (consistent with mobile)
- Text: "My Formula" or "Custom Formula"

**Behavior:**
- Opens empty Step 6 (Review) with manual entry form
- OR opens inline form within Step 5 (TBD — see open questions)
- All fields: Brand, Shade, Product, Grams, Developer, Processing Time, Notes
- Can add multiple products (multi-step formula)
- Save → goes to Step 6 Review with full results

---

### Feature 2: "Edit Formula" (Modify AI Results)

**Placement:** Step 6 (Review Results) after AI generates formula

**Mobile Design:**
- Full-screen modal (not inline — too cramped on mobile)
- Title: "Edit Formula"
- Each step editable with form fields
- "Add Step" / "Remove Step" buttons
- "Cancel" / "Save Changes" actions

**Web Design:**
- Modal or slide-out panel (responsive)
- Same fields as mobile

**Fields Editable:**
| Field | Type | Validation |
|-------|------|------------|
| Brand | Dropdown | Required |
| Shade Code | Text | Required |
| Product Name | Text | Optional |
| Grams | Number | > 0 |
| Developer Volume | Segmented (10/20/30/40vol) | Required |
| Processing Time | Time picker | > 0 |
| Notes | Text area | Optional |

**Behavior:**
- Save → replaces AI result with edited version
- Shows "Edited" badge on saved formula
- Full audit trail (original AI + edits)

---

### Feature 3: Color Bar iPad Mode

**Decision:** Same app, different mode (not separate app)
- Detects iPad + "color_bar_mode" config
- Simplified terminal UI (big text, minimal chrome)

**Screens:**
1. **Formula Receiver** — shows incoming formula from stylist phone
2. **Weighing Guide** — step-by-step with target weights
3. **Scale Connection** — Bluetooth pairing with Acaia
4. **Cost Summary** — auto-calculates based on salon pricing rules
5. **Send to Square** — pushes to POS register

**Data Flow:**
```
Stylist Phone → Cloud/Saved Formula → iPad fetches → Bluetooth Scale → Square API
```

---

## 4. SQUARE INTEGRATION

### Pricing Rules (Already Built)
- Salon admin sets product costs
- "Your Markup" field adds salon margin
- Pulls from Square catalog when available

### Square API Flow
```
1. Formula completed → COLORgenius calculates cost
2. Cost = Σ(product_grams × unit_cost) + markup
3. POST to Square Register API (v2/locations/{id}/transactions)
4. Transaction appears on client's ticket
```

**Supported Setups:**
- **Salon with Square Terminal:** Separate device → API push
- **Independent stylist (booth):** iPad + Square Reader (dual purpose)

---

## 5. ACAIA SCALE INTEGRATION

### Acaia BLE Protocol (Confirmed via Gemini Research)

**Service UUID:** `0000a8a0-0000-1000-8000-00805f9b34fb` (0xA8A0)
**Read/Notify Characteristic:** `00002a80-0000-1000-8000-00805f9b34fb` (0x2A80)
**Write Characteristic:** Same service, writable endpoint

**Packet Structure:**
- **Header:** `0xEF 0xDD` (commands) or `0xEE 0xDD` (events/weight data)
- **Message Type:** Byte 2 (e.g., `0x0B` handshake, `0x0A` weight event, `0x04` tare)
- **Payload:** Bytes 3-N-2
- **Checksum:** Bytes N-1, N

**Required Initialization Handshake:**
```
Write to characteristic immediately after connect:
- Header: 0xEF 0xDD
- Type: 0x0B (handshake)
- Payload: "012345678901234" (magic auth string)
- Checksum: calculated
```
**Without this handshake, scale ignores all commands and stops sending data.**

**Weight Data Decoding (0xEE 0xDD, type 0x0A):**
- Raw weight: 2-4 byte integer in payload
- Unit indicator byte: grams vs ounces
- Scaling factor: divide by 10 or 100 (model dependent)
- Sign bit: positive/negative weight

**Control Commands:**
| Command | ID | Description |
|---------|-----|-------------|
| Tare | 0x04 | Reset weight to zero |
| Start Timer | 0x00 | Start built-in timer |
| Stop Timer | 0x00 | Stop timer |
| Reset Timer | 0x00 | Reset timer |
| Heartbeat | 0x00 | Keep-alive (required every few seconds) |

**Auto-Detection Requirement:**
- Scale powers down after ~5 minutes idle
- iPad must auto-reconnect and re-handshake on wake
- Heartbeat required every few seconds to prevent sleep

**Open Source References:**
- `lucapinello/pyacaia` (Python/Bleak)
- `bpowers/btscale` (JavaScript/Chrome BLE)
- `esp-arduino-ble-scales` (C++/ESP32)

**Integration Complexity: MEDIUM-HIGH**
- BLE connection management
- Packet framing/parsing
- Checksum calculation
- Heartbeat management
- Auto-reconnect logic

---

## 6. API CHANGES

### New Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/formulas/:id/edit` | PUT | Save edited formula |
| `/api/pricing/calculate` | POST | Calculate formula cost |
| `/api/square/transaction` | POST | Push to Square |
| `/api/devices/register` | POST | Register Color Bar iPad |
| `/api/devices/formulas` | GET | Fetch pending formulas |

### Schema Changes
- `formulas` table: add `edited_from_ai` boolean, `original_formula_id` UUID
- `formula_steps` table: no changes
- New: `color_bar_devices` table (iPad registration)
- New: `formula_transactions` table (Square sync log)

---

## 7. OPEN QUESTIONS

1. **"My Formula" placement:** Should it open inline in Step 5 or navigate to Step 6 empty?
2. **Edit Formula persistence:** Save as new formula or overwrite original?
3. **Audit trail:** How long to keep original AI + edits? Forever? 90 days?
4. **Color Bar mode entry:** How does stylist activate iPad mode? Settings toggle? QR code?
5. **Multi-iPad support:** Can a salon have multiple Color Bar stations?
6. **Offline weighing:** Does scale integration work without internet?
7. **Square API version:** v2 (current) or v2.1 (newer)?
8. **Error handling:** What happens if Square push fails? Retry? Queue?
9. **Cost display:** Show client the cost, or stylists only?
10. **Apple approval risk:** Does "Color Bar mode" trigger extra review scrutiny?

---

## 8. ACCEPTANCE CRITERIA

### My Formula Button
- [ ] Visible on Step 5 (mobile and web)
- [ ] Opens manual formula form
- [ ] Can add multiple products
- [ ] Saves to "My Formulas" library
- [ ] Shows in History screen

### Edit Formula
- [ ] Button appears on all AI-generated results
- [ ] Opens modal with all fields editable
- [ ] Can add/remove steps
- [ ] Save replaces result
- [ ] Shows "Edited" badge

### Color Bar iPad
- [ ] iPad detects Color Bar mode
- [ ] Receives formula from cloud
- [ ] Connects to Acaia scale via Bluetooth
- [ ] Step-by-step weighing guide
- [ ] Auto-calculates cost
- [ ] Pushes to Square Register
- [ ] Shows confirmation on client ticket

---

## 9. RISK ANALYSIS

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Apple rejects Color Bar mode | Medium | High | Position as "Salon Tools" not "POS replacement" |
| Square API changes | Low | Medium | Use stable v2 endpoints |
| Acaia scale API undocumented | Medium | High | Use reverse-engineered protocol (already done) |
| Bluetooth reliability | Medium | Medium | Fallback to manual weight entry |
| Cost calculation disputes | Medium | Medium | Clear audit trail, admin override |

---

## 10. TIMELINE

### Phase 1 (Pre-Expo): My Formula + Edit Formula
- Duration: 2-3 days
- Scope: Features 1 & 2 only
- Mobile + Web

### Phase 2 (Post-Expo v1.1): Color Bar iPad
- Duration: 1-2 weeks
- Scope: Feature 3
- Requires: iPad hardware, Acaia scale, Square Terminal

---

## 11. TECHNICAL NOTES

### Mobile Stack
- React Native 0.76
- Expo SDK 52
- `react-native-ble-plx` for Bluetooth
- `react-native-square-pos` for Square (if available)

### Web Stack
- Next.js 14
- Same API endpoints
- Modal component: `framer-motion` for animations

### Shared
- Prisma schema changes
- Supabase for data
- Zod validation for API inputs

---

## REVIEW CHECKLIST

- [ ] Architect reviewed for technical gaps
- [ ] Dev reviewed for implementation feasibility
- [ ] Jason approved design and scope
- [ ] LESSONS-LEARNED.md checked for relevant anti-patterns
- [ ] All open questions answered or deferred

---

*Next step: Spawn colorgenius-architect for design review*

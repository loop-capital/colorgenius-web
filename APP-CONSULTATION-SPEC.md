# ColorGenius — AI In-App Consultation Spec

## Overview
ColorGenius performs the color consultation directly with the client via the app (phone or iPad), then delivers a structured summary to the stylist.

---

## User Flow

### 1. Handoff
- Stylist opens ColorGenius app
- Selects "New Consultation" + client name
- Hands device to client
- **ColorGenius Intro:** "Hi, I'm ColorGenius. I'll be helping with your color consultation today. I have a few questions to make sure you get the best results. This will take about 3 minutes."

### 2. AI-Guided Conversation
ColorGenius asks questions conversationally, not form-style:

| Topic | AI Prompt | Client Response |
|-------|-----------|-----------------|
| **Hair History** | "Is this your first time coloring, or have you colored before?" | Natural / Color treated / Chemically treated |
| **Current Color** | "Do you have any permanent color in your hair right now?" | Yes/No + how long ago |
| **Gray** | "Are you looking to cover any gray?" | Percentage or "No" |
| **Previous Treatments** | "In the last year, have you had any Brazilian keratin, henna, or stripped your color?" | Multi-select + when |
| **Goals** | "Are you staying close to your current color or making a big change?" | Stick / Adjust / Radical change |
| **Hair Issues** | "Any concerns I should know about — breakage, thinning, scalp issues?" | Multi-select + describe |
| **Allergies** | "Any allergies to hair products, especially PPD or ammonia?" | Yes/No + details |
| **Health** | "Any health conditions or medications that might affect your color?" | List or "None" |
| **Timeline** | "Any events coming up we should plan around?" | Date/event |

### 3. Photo Capture (Optional)
- "Can I see your current hair? Take a quick front selfie in natural light."
- "Now a shot from the back if you can."
- "Have an inspiration photo saved?"

### 4. AI Analysis
ColorGenius processes responses against knowledge base:
- Flags contraindications (henna 3 months ago, recent keratin, alopecia)
- Suggests pre-service requirements (Malibu, wait longer, strand test)
- Notes medical considerations (thyroid = 5-10vol, cancer = ammonia-free, etc.)

### 5. Summary to Stylist
ColorGenius returns device with structured report:

```
━━━━━━━━━━━━━━━━━━━━━
  CONSULTATION SUMMARY
  [Client Name]
━━━━━━━━━━━━━━━━━━━━━

HAIR HISTORY
• Virgin / Color treated / Chemically treated
• Last color: [date or "unknown"]
• Previous treatments: [keratin/henna/etc. + dates]

CURRENT STATE
• Gray coverage needed: [% or none]
• Existing permanent color: [yes/no]
• Known allergies: [list or none]

HAIR CONDITION
• Texture: [fine/medium/coarse]
• Extensions: [yes/no]
• Challenges: [breakage/thinning/scalp/etc.]

HEALTH FLAGS
• Conditions: [thyroid/cancer/etc.]
• Medications: [list]
• Stylist should: [specific precautions]

RECOMMENDED APPROACH
⚠️ Requires: [strand test / Malibu / 48hr wait]
💡 Suggested formula direction: [warm/cool/neutral]
⏱️ Time estimate: [X hours]

PHOTOS ATTACHED
[thumbnails]

━━━━━━━━━━━━━━━━━━━━━
STYLIST NOTES
[free text field for colorist]
```

---

## AI Personality

**Tone:** Warm, professional, knowledgeable but not clinical
**Voice:** Helpful assistant, not interrogator
**Pacing:** Conversational, allows backtracking
**Safety:** Escalates to human for serious contraindications

**Example Interactions:**
- Client mentions henna 2 months ago → "Henna can react with professional color. I'll flag this for your stylist — they may want to do a strand test first."
- Client has thyroid condition → "Thanks for letting me know. Thyroid conditions can affect how color processes, so your stylist will adjust accordingly."
- Unclear answer → "Let me rephrase — are we talking a little gray around the temples, or more like 50%?"

---

## Technical Requirements

### Frontend
- Voice + text input options
- Camera integration (front/back)
- Progress indicator
- "Start over" option
- "Get stylist" emergency button

### Backend
- Structured data capture
- Flag system for contraindications
- Knowledge base integration
- Summary generation
- Photo storage/attachment

### Integration
- Stylist dashboard view
- Client history storage
- Export to salon management systems

---

## Safety & Liability

- Clear disclaimer: "ColorGenius assists your stylist; final decisions are theirs"
- Escalation triggers: recent henna, cancer treatment, severe allergies, alopecia
- Requires stylist acknowledgment before service proceeds

---

*Spec Version: 1.0*
*Last Updated: 2026-04-17*
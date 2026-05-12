# ADR-006: Appointment Book Integration — Square Appointments

**Date:** 2026-05-03  
**Status:** Accepted

## Context

ColorGenius needs to integrate with salon appointment booking systems so stylists can see upcoming clients and link formulations to appointments. Key intel:

- **Vish (competitor) is NOT Square-compatible** — this is our competitive edge
- Square Appointments has a large US market share
- Square has `ListBookings` API + webhooks for appointment events
- Salons need to see bookings alongside color formulations for workflow efficiency

## Decision

Integrate **Square Appointments** as the primary (and initially only) booking platform.

## Approach

1. **OAuth2 connection** — reuse Square OAuth from inventory integration (ADR-005)
2. **Sync bookings** — pull via `ListBookings` API every 15 minutes
3. **Display in dashboard** — upcoming appointments shown alongside formulation tools
4. **Workflow bridge** — when appointment is marked complete → link to formulation workflow with client history pre-loaded

## Data Model

```prisma
model AppointmentBooking {
  id           String   @id @default(cuid())
  externalId   String   @unique           // Square booking ID
  clientId     String?                    // Links to our Client model
  serviceType  String                     // FULL_COLOR, HIGHLIGHTS, BALAYAGE, etc.
  scheduledAt  DateTime                   // Appointment time
  completedAt  DateTime?                  // When marked done
  stylistName  String?                    // Assigned stylist
  source       String   @default("SQUARE") // Future: FRESHA, VAGARO, MANUAL
  status       String   @default("SCHEDULED") // SCHEDULED, CONFIRMED, COMPLETED, CANCELLED
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Integration Flow

1. Stylist connects Square account via OAuth2
2. Tokens stored in `SquareConnection` table (shared with inventory integration)
3. Background service fetches upcoming bookings every 15 min
4. Bookings displayed in ColorGenius dashboard
5. Stylist clicks a booking → sees client history → creates formulation
6. Completed appointment → formulation auto-linked to client record

## Competitive Advantage

- Vish salons cannot use Square — they're locked out of this integration
- ColorGenius salons get: Square booking + color intelligence + auto-ordering in one platform
- Zero switching cost for Square salons — we add value on top of existing workflow

## Out of Scope (Future)

- Multi-platform support (Fresha, Vagaro, Boulevard)
- Two-way sync (push bookings TO Square)
- Automated appointment reminders
- Client self-booking via ColorGenius

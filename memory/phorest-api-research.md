# Phorest API Research

> Researched: May 27, 2026
> Source: https://developer.phorest.com/llms.txt

## Authentication
- Basic auth: `global/email:password`
- US server available (must set explicitly, EU is default)
- Credentials from Phorest Support: https://support.phorest.com/hc/en-us/requests/new

## Key Endpoints for COLORgenius

### Clients
- `GET /business/{businessId}/client` — List clients (filter by email, phone, name, updated_at)
- `GET /business/{businessId}/client/{clientId}` — Get client
- `POST /business/{businessId}/client` — Create client
- `PUT /business/{businessId}/client/{clientId}` — Update client
- `GET /business/{businessId}/client/{clientId}/service-history` — Service histories

### Appointments
- `GET /business/{businessId}/branch/{branchId}/appointment` — List (max 1 month range)
- `GET /business/{businessId}/branch/{branchId}/appointment/{appointmentId}` — Get
- `PUT /business/{businessId}/branch/{branchId}/appointment/{appointmentId}` — Update
- Filter by: date, updated_at, staff_id, client_id
- Can include canceled, deleted, archived appointments

### Services
- `GET /business/{businessId}/branch/{branchId}/service` — List branch services
- `GET /business/{businessId}/branch/{branchId}/service/{serviceId}` — Get

### Products
- `GET /business/{businessId}/branch/{branchId}/product` — List products
- Filter by: type, updated_at, name, barcode
- Can include archived, low stock, out of stock

### Branches
- `GET /business/{businessId}/branch` — List branches

### Purchases
- `POST /business/{businessId}/branch/{branchId}/purchase` — Create purchase
- Supports: appointments, products, courses, vouchers
- Tax rounding: HALF UP to cent
- Payment: supports overpayment (change returned)

## Limitations
- No webhooks — must poll (use updated_at filter)
- No payment API (no card processing)
- Paginated responses (page 0-indexed, size param)
- Max 1 month date range on appointments

## Integration Notes
- Reference: Vagaro integration at `integration/vagaro/` (3,055 lines, 10 modules)
- Auth: Basic auth (different from Vagaro OAuth)
- Polling strategy: use updated_at timestamps for sync
- Need: businessId, branchId, credentials from salon

# Phase 2 — System Design Review

## Completed Design Artifacts

- `system-architecture.md`
- `erd.md`
- `api-design.md`
- `security-architecture.md`
- `ui-wireframes.md`

## Architecture Decisions

- Next.js frontend deployed separately from Express backend
- Supabase PostgreSQL and Authentication as central infrastructure
- Tesseract.js for browser-side OCR
- Leaflet and OpenStreetMap for mapping
- PayMongo sandbox for online payments
- Server-side payment and webhook verification
- Row Level Security and backend authorization
- Fixed-rate-per-session pricing
- Historical rate snapshot in each session
- Secure, server-generated QR references

## Database Structure

The initial design contains 11 entities:

- profiles
- vehicles
- parking_locations
- parking_zones
- parking_rates
- attendant_assignments
- parking_sessions
- transactions
- receipts
- notifications
- audit_logs

Before implementation, migration and policy details will be reviewed again.

## Implementation Readiness

Phase 3 may begin after approval of:

- Frontend and backend separation
- API endpoint naming
- Role and permission model
- 11-entity initial schema
- Partial unique active-session rule
- QR, payment, OCR, map, and security approaches

No database migrations or application code have been created in this phase.

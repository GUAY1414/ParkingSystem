# Security Architecture

## 1. Authentication

Supabase Auth provides identity and login sessions.

The backend validates bearer tokens on protected endpoints. It does not accept role claims supplied by the frontend as authoritative identity.

The backend obtains the current user profile and role from the database for authorization decisions.

## 2. Authorization

Supported roles:

- `DRIVER`
- `PARKING_ATTENDANT`
- `PARKING_ADMINISTRATOR`
- `SYSTEM_ADMINISTRATOR`

The backend applies middleware such as:

- `requireAuth`
- `requireRole`
- `requireZoneAssignment`
- `requireResourceOwnership`
- `requireVerifiedPaymentProviderEvent`

Frontend route checks are presentation-only and cannot replace server authorization.

## 3. Row Level Security

Supabase RLS policies shall ensure that:

- Drivers read and update only permitted profile fields.
- Drivers manage only their vehicles and receipts.
- Attendants retrieve only assigned locations and zones.
- Parking administrators manage parking and report entities.
- System administrators manage user roles and technical settings.
- Direct anonymous data access is denied.

The service-role key shall not appear in Next.js or browser code.

## 4. Input Security

All request bodies, query parameters, and route parameters shall be validated.

Additional controls:

- Plate normalization and character allowlists
- Numeric amount validation
- Coordinate range validation
- Maximum field lengths
- Email format validation
- UUID validation
- Provider identifiers stored as opaque values

## 5. Payment Security

- Never trust frontend payment callbacks.
- Verify webhook signatures.
- Verify provider status with server-side API calls when needed.
- Use idempotency keys or unique provider references.
- Prevent duplicate receipt and payment confirmation.
- Store exact and expected amounts.
- Review discrepancies.
- Never expose provider secrets in frontend code.

## 6. QR Security

QR codes shall contain only an unpredictable server-side reference.

The backend shall verify:

- Reference existence
- Session status
- Attendant authentication
- Attendant zone assignment
- Session and endpoint authorization

## 7. Secrets Management

Local development variables shall use `.env.local` or `.env` files excluded by `.gitignore`.

Never commit:

- Supabase service-role keys
- Database passwords
- PayMongo secret keys
- PayMongo webhook secrets
- Resend API keys
- JWT secrets

## 8. Audit Logging

Audited events include:

- Role changes
- Location changes
- Zone changes
- Rate changes
- Attendant assignments
- Session creation and closure
- Payment confirmation
- Cash discrepancy records
- QR retrieval
- Account status changes

Audit logs store the actor, action, entity, timestamp, and permitted metadata. They do not store unnecessary sensitive payloads.

## 9. Camera and Privacy

- Camera permission is requested only for the camera workflow.
- OCR processing is local in the browser initially.
- Temporary image URLs are revoked after processing.
- Images are retained only if a future explicitly approved requirement requires it.
- Storage permissions shall be role- and ownership-limited.

## 10. Production Caution

The free-tier prototype is not a substitute for a production security review. Real personal, parking, and financial data require stronger controls, legal review, compliance review, monitoring, backups, incident response, and provider account approval.

# Account Provisioning

## Combination Model

### Driver

- Publicly registers through `/register`.
- Public registration never accepts role or administrator selection.
- Profile trigger creates a `DRIVER` profile.

### Parking Attendant

- Parking Administrator sends an invitation or provisions the account through the authorized role endpoint.
- Account receives `PARKING_ATTENDANT` only after backend authorization.
- Invitation and role assignment are audit logged.

### Parking Administrator

- System Administrator sends an invitation.
- Account receives `PARKING_ADMINISTRATOR` only after backend authorization.
- Invitation and role assignment are audit logged.

### System Administrator

- Initial system administrator is configured securely outside public registration.
- No shared default credentials are stored or deployed.

## Security Rules

- Frontend role checks are presentation-only.
- Express middleware validates role server-side.
- Supabase RLS provides database-level protection.
- Role changes require authorization and create audit logs.
- Password setup uses Supabase secure password/invitation flows.

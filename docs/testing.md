# Testing Procedures

## Authentication

1. Register a fictional driver.
2. Confirm a `profiles` row is created with role `DRIVER`.
3. Sign out and sign in.
4. Confirm protected routes require an access token.

## Vehicles

1. Register `AGF112` through manual entry.
2. Confirm the row appears in Supabase.
3. Open `/vehicles`.
4. Confirm the owner ID matches the test user.
5. Attempt duplicate registration and confirm a conflict.

## Parking Data

1. Run the controlled seed in Supabase.
2. Verify 3 locations, 4 zones, and 4 active rates.
3. Open `/map`.
4. Confirm the three database location markers appear.

## Sessions

1. Assign a test attendant to a zone.
2. Create a session for a registered vehicle.
3. Confirm the active-session partial unique constraint prevents duplicates.
4. Verify the secure QR reference through `/api/qr/session/:reference`.

## Cash Payment

1. Record exact fixed cash amount.
2. Confirm transaction status is `CONFIRMED`.
3. Confirm session closes and receipt is created.
4. Record a mismatched amount.
5. Confirm discrepancy status is `AMOUNT_MISMATCH`.

## Security

1. Call protected API endpoints without a token.
2. Confirm `401 UNAUTHORIZED`.
3. Sign in as driver and call attendant endpoint.
4. Confirm `403 FORBIDDEN`.
5. Verify browser code contains no service-role key.

## Builds

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Backend:

```powershell
cd backend
npm run build
npm test
```

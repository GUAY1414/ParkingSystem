# Database Seeds

`controlled_parking_seed.sql` creates demonstration parking locations.

`node scripts/seed-demo-accounts.ts` creates development-only accounts for each system role. The script:

- Refuses to run in production.
- Generates a unique strong password for each account.
- Saves credentials outside Git in `database/seeds/.demo-credentials.json`.
- Assigns the correct role through the profiles table.
- Records demo account provisioning in audit logs.

Delete the credentials file after testing and rotate passwords when moving to a shared environment.

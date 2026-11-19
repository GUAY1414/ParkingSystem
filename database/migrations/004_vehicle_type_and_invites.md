# Migration 004 — Vehicle Revision and Account Provisioning

## Vehicle fields

Apply:

```sql
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_type text;

UPDATE vehicles
SET vehicle_type = make
WHERE vehicle_type IS NULL
  AND make IS NOT NULL;

ALTER TABLE vehicles DROP COLUMN IF EXISTS model;

ALTER TABLE vehicles
ADD CONSTRAINT vehicles_vehicle_type_check
CHECK (vehicle_type IS NULL OR vehicle_type IN (
  'Motorcycle', 'Sedan', 'SUV', 'Van', 'Pickup Truck'
));
```

## Account invitations

Account invitations use Supabase Auth Admin APIs from the backend. Do not create public role selectors.

- System Administrator invites Parking Administrator.
- Parking Administrator invites Parking Attendant.
- Driver self-registers publicly.
- Role changes create audit-log records.

`/api/roles/admins`

- Requires `SYSTEM_ADMINISTRATOR`

`/api/roles/attendants`

- Requires `PARKING_ADMINISTRATOR`

`/api/roles/users/:userId/role`

- Requires `SYSTEM_ADMINISTRATOR`

# Entity Relationship Design

## 1. Initial Entities

1. `profiles`
2. `vehicles`
3. `parking_locations`
4. `parking_zones`
5. `parking_rates`
6. `attendant_assignments`
7. `parking_sessions`
8. `transactions`
9. `receipts`
10. `notifications`
11. `audit_logs`

## 2. ERD

```mermaid
erDiagram
    profiles ||--o{ vehicles : owns
    profiles ||--o{ attendant_assignments : receives
    profiles ||--o{ parking_sessions : operates
    profiles ||--o{ audit_logs : performs

    parking_locations ||--o{ parking_zones : contains
    parking_locations ||--o{ attendant_assignments : assigned

    parking_zones ||--o{ parking_rates : has_history
    parking_zones ||--o{ attendant_assignments : assigned
    parking_zones ||--o{ parking_sessions : hosts

    vehicles ||--o{ parking_sessions : parks

    parking_sessions ||--o| transactions : paid_by
    parking_sessions ||--o| receipts : generates
    parking_sessions ||--o{ notifications : notifies

    profiles {
        uuid id PK
        text email
        text first_name
        text last_name
        text role
        text status
        timestamptz created_at
    }

    vehicles {
        uuid id PK
        uuid owner_id FK
        text plate_number
        text make
        text model
        text color
        text status
    }

    parking_locations {
        uuid id PK
        text name
        text address
        numeric latitude
        numeric longitude
        text status
    }

    parking_zones {
        uuid id PK
        uuid location_id FK
        text name
        integer capacity
        integer occupancy
        text status
        timestamptz updated_at
    }

    parking_rates {
        uuid id PK
        uuid zone_id FK
        integer amount_centavos
        timestamptz effective_from
        timestamptz effective_to
        text status
    }

    attendant_assignments {
        uuid id PK
        uuid attendant_id FK
        uuid location_id FK
        uuid zone_id FK
        timestamptz assigned_at
        text status
    }

    parking_sessions {
        uuid id PK
        text qr_reference
        uuid vehicle_id FK
        uuid zone_id FK
        uuid attendant_id FK
        integer snapshot_rate_centavos
        timestamptz start_time
        timestamptz end_time
        text status
    }

    transactions {
        uuid id PK
        uuid session_id FK
        text reference
        text payment_method
        text provider
        integer amount_centavos
        integer expected_amount_centavos
        text status
        text discrepancy_status
        timestamptz paid_at
    }

    receipts {
        uuid id PK
        uuid transaction_id FK
        uuid session_id FK
        text receipt_number
        timestamptz issued_at
    }

    notifications {
        uuid id PK
        uuid profile_id FK
        uuid session_id FK
        text type
        text status
        timestamptz created_at
    }

    audit_logs {
        uuid id PK
        uuid actor_id FK
        text action
        text entity_type
        text entity_id
        jsonb metadata
        timestamptz created_at
    }
```

## 3. Cardinality Summary

- One profile owns multiple vehicles.
- One location contains multiple zones.
- One zone has one active rate and historical rate records.
- One attendant may be assigned to multiple zones.
- One vehicle may have many parking sessions across time but only one active session.
- One parking session has at most one successful transaction in the initial model.
- One successful transaction generates at most one receipt.
- Notifications belong to a profile and may reference a session.

## 4. Required Constraints

- Vehicles: normalized plate number unique per owner or system policy approved later.
- Zones: capacity is non-negative and occupancy cannot exceed capacity.
- Sessions: valid status values and an assigned attendant.
- Transactions: amount is non-negative.
- QR references: unique and unpredictable.
- Profiles: role must be one of the four supported roles.
- Receipts: unique receipt number and one-per-transaction policy.

## 5. Active Session Protection

The database shall include a partial unique constraint equivalent to:

```sql
CREATE UNIQUE INDEX active_session_per_vehicle
ON parking_sessions (vehicle_id)
WHERE status = 'ACTIVE';
```

Final migration syntax will be implemented only during the database phase.

## 6. Historical Rates

Every parking session stores `snapshot_rate_centavos`. This prevents later rate edits from changing previously completed transactions.

# REST API Design

## 1. Response Convention

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "CODE",
    "message": "Readable explanation"
  }
}
```

## 2. Authentication Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/session` | Resolve authenticated session | Authenticated |
| POST | `/api/auth/logout` | Revoke application session | Authenticated |

Supabase registration and login will primarily use Supabase Auth. Express verifies bearer tokens and retrieves the server-side profile role.

## 3. Driver and Profile Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/me` | Retrieve current profile | Authenticated |
| PATCH | `/api/me` | Update permitted profile fields | Authenticated |
| GET | `/api/drivers` | Search driver accounts | Parking/System Admin |
| PATCH | `/api/drivers/:id/status` | Enable or disable account | Parking/System Admin |

## 4. Vehicle Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/vehicles` | Register a vehicle | Driver |
| GET | `/api/vehicles` | List vehicles owned by current driver | Driver |
| GET | `/api/vehicles/:id` | Retrieve vehicle details | Authorized |
| PATCH | `/api/vehicles/:id` | Update vehicle details | Owner |
| DELETE | `/api/vehicles/:id` | Retire vehicle | Owner |
| GET | `/api/vehicles/lookup?plate=` | Find registered vehicle | Attendant |

## 5. Parking Location and Zone Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/parking-locations` | List public locations | Authenticated |
| GET | `/api/parking-locations/:id` | Retrieve location and zones | Authenticated |
| POST | `/api/parking-locations` | Create location | Parking Admin |
| PATCH | `/api/parking-locations/:id` | Update location | Parking Admin |
| POST | `/api/parking-zones` | Create zone | Parking Admin |
| PATCH | `/api/parking-zones/:id` | Update zone or availability | Parking Admin or assigned Attendant |
| PATCH | `/api/parking-zones/:id/rate` | Update fixed rate | Parking Admin |

Availability update endpoints require audit logging.

## 6. Attendant Assignment Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/attendant-assignments` | Assign attendant | Parking Admin |
| DELETE | `/api/attendant-assignments/:id` | Remove assignment | Parking Admin |
| GET | `/api/attendant-assignments/me` | Retrieve assigned zones | Attendant |

## 7. Parking Session Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/parking-sessions` | Create active session | Attendant |
| GET | `/api/parking-sessions/active` | List authorized active sessions | Attendant/Admin |
| GET | `/api/parking-sessions/:id` | Retrieve session | Authorized |
| GET | `/api/parking-sessions/qr/:reference` | Retrieve session by secure QR reference | Authorized Attendant |
| POST | `/api/parking-sessions/:id/close` | Close session after payment rules | Attendant |

## 8. Transaction and Receipt Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/transactions/cash` | Record cash payment | Attendant |
| POST | `/api/transactions/online` | Create pending online payment | Driver |
| POST | `/api/transactions/verify/:id` | Server verification operation | Backend/provider process |
| GET | `/api/transactions` | List transactions | Authorized/Admin |
| POST | `/api/payments/paymongo/webhook` | Verified PayMongo webhook | Provider signature |
| GET | `/api/receipts/:id` | Retrieve receipt | Owner/Admin |
| GET | `/api/receipts/:id/download` | Download receipt | Owner/Admin |

## 9. Notifications and Reports

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/notifications/me` | List driver notifications | Driver |
| PATCH | `/api/notifications/:id/read` | Mark notification read | Owner |
| GET | `/api/reports/dashboard` | Dashboard metrics | Parking/System Admin |
| GET | `/api/reports/transactions` | Filtered transaction report | Parking/System Admin |
| GET | `/api/audit-logs` | Search audit logs | Parking/System Admin |

## 10. Validation and Error Codes

Initial error categories:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `ACTIVE_SESSION_EXISTS`
- `ZONE_FULL`
- `ASSIGNMENT_REQUIRED`
- `PAYMENT_AMOUNT_MISMATCH`
- `PAYMENT_ALREADY_CONFIRMED`
- `INVALID_QR_REFERENCE`
- `PROVIDER_ERROR`

Final endpoint implementation may use additional provider-specific codes, but the naming conventions remain consistent.

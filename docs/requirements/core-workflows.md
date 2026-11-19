# Core System Workflows

## 1. Vehicle Registration

```mermaid
sequenceDiagram
    actor Driver
    participant Frontend
    participant OCR
    participant Backend
    participant PostgreSQL

    Driver->>Frontend: Open vehicle registration
    Frontend->>Frontend: Request camera permission
    Driver->>Frontend: Capture plate image
    Frontend->>OCR: Process image
    OCR-->>Frontend: Suggested plate number
    Driver->>Frontend: Confirm or correct number
    Frontend->>Backend: POST vehicle data
    Backend->>PostgreSQL: Validate and insert vehicle
    PostgreSQL-->>Backend: Vehicle result
    Backend-->>Frontend: Success or validation error
```

## 2. Parking Session Creation

```mermaid
sequenceDiagram
    actor Attendant
    participant Backend
    participant Database

    Attendant->>Backend: Submit plate number
    Backend->>Database: Find registered vehicle
    Attendant->>Backend: Select assigned zone
    Backend->>Database: Check active session
    Backend->>Database: Read fixed active rate
    Backend->>Database: Create session transactionally
    Database-->>Backend: Session and QR reference
    Backend-->>Attendant: QR session data
```

## 3. Payment and Receipt

```mermaid
sequenceDiagram
    actor Driver
    participant Frontend
    participant Backend
    participant PayMongo
    participant Database
    participant Email

    Driver->>Frontend: Start online payment
    Frontend->>Backend: Create payment request
    Backend->>PayMongo: Create sandbox checkout
    PayMongo-->>Backend: Checkout data
    Backend-->>Frontend: Checkout details
    Driver->>PayMongo: Complete sandbox payment
    PayMongo-->>Backend: Verified webhook or status update
    Backend->>Database: Confirm transaction once
    Backend->>Database: Create receipt
    Backend->>Email: Send receipt
    Backend-->>Frontend: Confirmed payment
```

## 4. Cash Payment and Session Closure

```mermaid
flowchart TD
    A[Attendant opens session] --> B[Enter amount received]
    B --> C{Amount matches fixed rate?}
    C -->|Yes| D[Record confirmed cash transaction]
    D --> E[Create receipt]
    E --> F[Close parking session]
    F --> G[Decrease zone occupancy]
    C -->|No| H[Record discrepancy transaction]
    H --> I[Flag for parking administrator]
```

## 5. Availability Update

Occupancy changes are derived from valid active sessions and updated transactionally.

- Session creation: increment occupancy if below capacity.
- Session closure: decrement occupancy.
- Administrator availability: manually close or correct the operational status according to audited procedures.

The system does not infer occupancy from GPS or cameras.
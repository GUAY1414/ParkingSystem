# Use Cases

## UC-01 Driver Registration

**Actor:** Driver

1. The driver provides registration details.
2. Supabase Auth creates the account.
3. The system creates the corresponding driver profile.
4. The driver receives confirmation.

## UC-02 Vehicle Registration

**Actor:** Driver

1. The driver opens vehicle registration.
2. The driver captures or uploads a plate image.
3. OCR suggests a plate number.
4. The driver confirms or corrects the value.
5. The system validates and saves the vehicle.

## UC-03 Parking Location Search

**Actor:** Driver

1. The driver opens the map or location list.
2. The system retrieves locations and zones.
3. The driver selects a location.
4. The system displays availability and fixed rates.

## UC-04 Session Initiation

**Actor:** Parking Attendant

1. The attendant scans or manually enters a plate number.
2. The system identifies a registered vehicle.
3. The attendant selects an assigned zone.
4. The system verifies that no active session exists.
5. The system snapshots the fixed rate.
6. The system creates the session and QR reference.
7. The driver receives a notification.

## UC-05 QR Session Retrieval

**Actor:** Parking Attendant

1. The attendant scans a session QR reference.
2. The backend validates the reference and attendee authorization.
3. The system displays permitted session details.

## UC-06 Cash Payment

**Actor:** Parking Attendant

1. The attendant enters the amount received.
2. The backend creates or updates the transaction.
3. The system compares the amount with the fixed rate.
4. Exact payment creates a receipt.
5. Incorrect payment is marked for administrative review.

## UC-07 Online Payment

**Actor:** Driver

1. The driver initiates an online payment for the parking session.
2. The backend creates a pending payment transaction.
3. The payment provider presents the sandbox checkout.
4. The backend verifies provider status or webhook evidence.
5. The system creates a receipt and confirms payment.

## UC-08 Session Closure

**Actor:** Parking Attendant

1. The attendant confirms payment requirements are met.
2. The backend closes the session.
3. The zone occupancy is updated.
4. The system records an audit event.

## UC-09 Location and Zone Management

**Actor:** Parking Administrator

1. The administrator creates or edits a location.
2. The administrator creates zones and configures capacity and status.
3. The administrator updates the fixed session rate.
4. The system records the change in audit logs.

## UC-10 Administrative Monitoring

**Actor:** Parking Administrator

1. The administrator opens dashboard statistics.
2. The system retrieves database-backed metrics.
3. The administrator filters locations, sessions, payments, dates, and statuses.
4. The administrator reviews discrepancies and exports reports.

## UC-11 Role Management

**Actor:** System Administrator

1. The system administrator views system users.
2. The administrator assigns or changes supported roles.
3. The backend and database enforce the new permissions.
4. The change is audited.

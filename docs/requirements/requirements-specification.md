# Kuya meron pa? — Requirements Specification

## 1. Project Overview

Kuya meron pa? is a digital parking management, vehicle verification, and payment system for participating parking locations in Manila.

The application connects drivers, authorized attendants, parking administrators, and system administrators through a responsive web application.

## 2. Approved Technology Decisions

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Node.js, Express.js, TypeScript
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Storage: Supabase Storage
- OCR: Tesseract.js with manual correction
- Maps: Leaflet and OpenStreetMap
- QR: Secure server-generated session reference plus QR library
- Payment sandbox: PayMongo
- Email: Resend
- Hosting: Vercel, Render, and Supabase

Stripe is a fallback option if PayMongo sandbox access is not available.

## 3. Scope

### Included

- Driver and vehicle registration
- Camera capture and OCR-assisted license plate recognition
- Map-based parking location discovery
- Zone availability and fixed session rates
- Attendant-controlled parking sessions
- QR session verification
- Cash and online payments
- Server-verified payment status
- Digital receipts and email notifications
- Administrator monitoring, reports, and audit logs
- Role-based access control and Row Level Security

### Explicitly Excluded

- Automatic occupancy detection
- Continuous GPS vehicle tracking
- Real-time automatic vehicle billing by elapsed time
- Official government rate certification
- Production financial processing before regulatory and provider approval
- Perfect OCR accuracy claims

## 4. User Roles

### Driver

- Register and authenticate
- Manage profile information
- Register multiple vehicles
- Capture and correct license plate information
- Discover participating parking locations
- View zones, capacity, availability, and fixed rates
- View active sessions and transaction history
- Pay cash or online
- View and download receipts
- Receive notifications

### Parking Attendant

- Authenticate through an authorized account
- View assigned locations and zones
- Scan and verify registered vehicles
- Create parking sessions
- Generate QR references
- Record cash payments
- Close sessions and update availability
- View handled sessions

### Parking Administrator

- Manage drivers and attendants
- Manage locations and zones
- Configure fixed session rates
- Assign attendants
- Monitor sessions and availability
- Monitor and flag payments
- Generate reports
- Review audit logs

### System Administrator

- Manage users and role assignments
- Configure application settings
- Configure technical access
- Review security settings and operational logs
- Manage technical incidents

Parking and system administrator permissions must remain separate.

## 5. Functional Requirements

### FR-01 Authentication

The system shall support registration, login, logout, password recovery, and server-side session validation.

### FR-02 Role-Based Access

The system shall restrict features and API operations according to assigned roles.

### FR-03 Profile Management

Drivers shall be able to view and update permitted personal information.

### FR-04 Vehicle Registration

The system shall allow drivers to register vehicles and manually confirm or correct OCR results.

The plate number shall be normalized before validation and duplicate lookup.

### FR-05 Camera Capture

Browser camera workflows shall support rear-camera access on supported mobile devices, denied permission handling, capture errors, and manual plate entry.

Captured images shall not be retained unless required and approved by storage policy.

### FR-06 OCR

The system shall use OCR to suggest a plate number and shall require manual confirmation.

OCR accuracy shall not be presented as guaranteed.

### FR-07 Parking Discovery

The system shall display participating locations with names, addresses, coordinates, zones, rates, availability, and navigation links.

### FR-08 Session Creation

An authorized attendant shall be able to create one active parking session for a registered vehicle in an assigned zone.

The session shall record the vehicle, location, zone, attendant, start time, fixed rate snapshot, status, and secure QR reference.

### FR-09 Duplicate Session Prevention

The database shall prevent one vehicle from having more than one active session.

### FR-10 QR Verification

Authorized attendants shall be able to retrieve session details using a server-side QR reference.

Sensitive driver information shall not be embedded in the QR code.

### FR-11 Payments

The system shall support cash and PayMongo sandbox payments.

Online payment success shall be verified by server-side confirmation or webhook signature verification.

Frontend success messages shall not update payment status.

### FR-12 Receipts

A confirmed payment shall produce a receipt containing the transaction, session, vehicle, location, zone, time, amount, method, and timestamp.

### FR-13 Notifications

The system shall notify drivers when sessions begin, payments become due, and payments are confirmed.

### FR-14 Administration

Administrators shall have access to actual database statistics, filtered reports, transactions, discrepancies, availability, and audit logs.

## 6. Business Rules

- Rates are fixed per parking session, not per elapsed hour.
- Only parking administrators may modify official rates.
- Historical transaction records preserve the rate that applied at session creation.
- Parking sessions are controlled by authorized attendants.
- A vehicle cannot have multiple simultaneous active sessions.
- Closing a session requires a confirmed or recorded payment according to policy.
- Cash amounts differing from the fixed rate must be marked for administrative review.
- Online payment status must be verified by the backend.
- Duplicate online payment confirmation must have no duplicate financial effect.
- QR references must be unpredictable and validated by authorization.
- Sensitive personal information must be masked where not operationally necessary.

## 7. Non-Functional Requirements

### NFR-01 Usability

The interface shall be responsive, mobile-first for drivers and attendants, and usable on desktop for administrators.

### NFR-02 Accessibility

Forms shall include labels, keyboard navigation, visible focus states, and understandable error messages.

### NFR-03 Security

- HTTPS in production
- Environment secrets outside source control
- Server-side authorization
- Supabase Row Level Security
- Input validation
- Payment signature verification
- Audit logging
- No service-role key in frontend code

### NFR-04 Availability

The system shall recover cleanly from database, provider, email, and camera errors.

### NFR-05 Performance

Database dashboards shall use indexed queries and server-side filtering where practical.

### NFR-06 Privacy

Development shall use fictional or controlled sample information. QR codes and responses shall avoid unnecessary personal data exposure.

## 8. Initial Acceptance Criteria

- A driver can register and add a vehicle through manual or OCR-assisted entry.
- An attendant can create only one active session for a vehicle.
- The system prevents duplicate active sessions.
- An attendant can verify a session using its secure QR reference.
- Cash payment discrepancies are flagged.
- Online sandbox payment status is verified server-side.
- Confirmed payment creates a receipt and closes or updates the applicable session according to workflow rules.
- Dashboard statistics come from database records.
- Unauthorized API and database operations are denied.

# UI and Navigation Wireframes

## 1. Shared Design Principles

- Mobile-first layouts
- Warm neutral backgrounds
- Dark blue or navy primary navigation
- Teal or green success state
- Amber warning state
- Red destructive or discrepancy state
- Clear tables and cards
- Accessible labels and focus styles
- Consistent icons and status badges
- No decorative animations that hinder use

## 2. Driver Layout

```text
Mobile
┌────────────────────────────┐
│ Kuya meron pa?       Avatar│
├────────────────────────────┤
│ Active Session Card         │
│ Location / Zone / Plate     │
│ Status / Pay / View QR      │
├────────────────────────────┤
│ Quick Actions               │
│ [Vehicles] [Map] [Payments] │
├────────────────────────────┤
│ Recent Sessions             │
│ [Session rows]              │
├────────────────────────────┤
│ Home  Map  Sessions  Profile│
└────────────────────────────┘
```

Desktop sidebar navigation:

```text
Dashboard
Vehicles
Parking Map
Active Sessions
Payments
Receipts
Profile
```

## 3. Driver Vehicle Registration

```text
Register Vehicle

[Plate Image Preview]
[Open Camera] [Upload Image] [Enter Manually]

Recognized Plate
[ ABC 1234 ]
[Confirm and Continue] [Edit]

Vehicle Details
Make
Model
Color

[Save Vehicle]
```

The OCR value is an unconfirmed suggestion until the driver reviews it.

## 4. Parking Map

```text
[Search location]
[Filter by available zones]

┌──────────────────────────────┐
│                              │
│         Leaflet Map          │
│       [Location Pins]        │
│                              │
├──────────────────────────────┤
│ Selected Location            │
│ Zone A — 12/20 available    │
│ Fixed rate: ₱50/session     │
│ [View Details] [Directions]  │
└──────────────────────────────┘
```

## 5. Attendant Layout

```text
┌──────────────────────────────┐
│ Attendant Dashboard          │
├─────────────┬────────────────┤
│ Scan Plate  │ Assigned Zones │
│ [Camera]    │ Zone A — 12    │
│ [Manual]    │ Zone B — 5     │
├─────────────┴────────────────┤
│ Active Sessions              │
│ Plate | Zone | Time | Action │
└──────────────────────────────┘
```

Primary controls:

- Scan vehicle
- QR verification
- Start session
- Record cash payment
- View active sessions
- Update zone availability

## 6. Administrator Layout

```text
┌───────────────┬─────────────────────────┐
│ KUYA MERON PA │ Dashboard               │
│               │ [Metric cards]          │
│ Overview      │ [Availability chart]    │
│ Locations     │ [Recent sessions table] │
│ Zones         │                         │
│ Rates         │ Search / Date / Filter  │
│ Attendants    │ [Filtered table]        │
│ Sessions      │                         │
│ Payments      │                         │
│ Reports       │                         │
│ Audit Logs    │                         │
└───────────────┴─────────────────────────┘
```

## 7. System Administrator Layout

```text
System Settings

Users and Roles
Security
Environment Status
Audit Logs
System Operations
```

Parking and system administrator navigation remains separate.

## 8. Required Reusable Components

- App sidebar
- Mobile bottom navigation
- Page header
- Metric card
- Status badge
- Search input
- Date range filter
- Data table
- Pagination
- Loading skeleton
- Empty state
- Error alert
- Success toast
- Confirmation dialog
- Camera capture panel
- Plate correction form
- QR display panel
- Map container
- Receipt card

## 9. Functional UI States

Every major screen shall include:

- Loading state
- Empty state
- Validation state
- Success state
- Authorization state
- Server-error state
- Offline or provider failure state where relevant

# Approved System Decisions

## Payment Sandbox

**Selected provider: PayMongo**

Reason: PayMongo provides Philippine-oriented sandbox payment workflows and supports common local payment use cases.

Development use will be limited to sandbox credentials and test payments. The application shall verify payment status through backend API requests and/or verified webhook events.

A frontend success message will never be trusted as proof of payment.

**Fallback:** Stripe sandbox may be used only if PayMongo account or integration access is unavailable.

## OCR Strategy

Tesseract.js is the initial browser-side OCR implementation.

The system will:

- Capture or accept an image
- Suggest a plate number
- Allow manual correction
- Normalize the entered value
- Validate format within reasonable Philippine plate patterns
- Require confirmation

Poor lighting and unreadable images must produce a manual-entry option.

## Fixed Pricing

All zones store an active fixed fee per session. The fee is snapshotted into the parking session and transaction record so later rate changes do not modify historical records.

Demonstration values:

- Zone A: ₱50
- Zone B: ₱70
- Zone C: ₱100

These values are not official government rates.

## QR References

QR codes shall contain a random, unpredictable session reference or a signed retrieval reference—not sensitive personal data.

The backend shall check authentication, role, zone assignment, and session validity.

## Development Data

All visible data in demonstrations shall be controlled, fictional, or non-sensitive sample data.

## Hosting Limitations

The finished prototype may run on free-tier services, but free hosting is not suitable for real financial or sensitive personal data without a security, provider, and operational assessment.

## Scope Guardrails

The system shall not implement:

- Continuous vehicle tracking
- Automatic occupancy detection
- Hidden camera-based enforcement
- Hourly billing assumptions
- Automatic transaction approval based only on frontend state

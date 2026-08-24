System Design — Healthcare Appointment Management System

1. Overview

The Healthcare Appointment Management System is a MERN-based role-oriented application for managing patient appointments and doctor consultations.

The primary workflow is:

Patient
  ↓
Authentication
  ↓
Doctor Discovery
  ↓
Doctor Availability
  ↓
Date & Time Slot
  ↓
Appointment
  ↓
Pre-Visit Symptoms
  ↓
Doctor Consultation
  ↓
Prescription / Follow-up
  ↓
Visit Summary
  ↓
Notifications / Reminders

2. Architecture

┌──────────────────────────┐
│        React/Vite        │
│       Frontend UI        │
└────────────┬─────────────┘
             │ HTTP / JSON
             │ JWT
             ▼
┌──────────────────────────┐
│      Express / Node      │
│     REST API Layer       │
├──────────────────────────┤
│ Routes                   │
│ Controllers              │
│ Middleware               │
│ Services                 │
│ Background Jobs          │
└────────────┬─────────────┘
             │ Mongoose
             ▼
┌──────────────────────────┐
│        MongoDB           │
│     Application Data     │
└──────────────────────────┘

Optional external services:
- LLM service
- SMTP / email
- Google Calendar

3. User Roles

Patient

Patients can:

register

authenticate

discover doctors

view availability

book appointments

cancel appointments

submit symptoms

view consultation results

manage their profile

Doctor

Doctors can:

authenticate

view assigned appointments

review patient information

review pre-visit symptoms

complete consultations

record diagnosis and notes

add prescription/follow-up information

Admin

Admins can:

access administrative dashboards

manage doctors

manage patients

manage appointments

activate/deactivate doctor records

Public registration does not provide an Admin role selection.

4. Authentication & Authorization

Authentication uses JWT.

General flow:

Login
 ↓
Credentials validated
 ↓
JWT generated
 ↓
Frontend stores authenticated session
 ↓
Protected request includes JWT
 ↓
Backend auth middleware verifies token
 ↓
Role authorization checks permissions
 ↓
Controller executes

The backend remains the authoritative security boundary.

Frontend route protection improves user experience but must not be treated as sufficient authorization.

5. Appointment Booking

Appointment creation follows:

Select doctor
      ↓
Select date
      ↓
Check doctor availability
      ↓
Generate available slots
      ↓
Remove unavailable/booked slots
      ↓
Patient selects slot
      ↓
Backend validates date + slot again
      ↓
Create appointment

The second server-side validation is essential because the frontend availability response may become stale.

6. Double Booking Prevention

The system should prevent two patients from successfully booking the same doctor/date/time combination.

Protection should exist at the backend rather than relying only on disabled frontend buttons.

Conceptually:

Request booking
      ↓
Validate doctor/date/time
      ↓
Query existing appointment
      ↓
Already booked?
   /       \
 Yes       No
 ↓          ↓
Reject    Create

7. Appointment Lifecycle

A typical lifecycle is:

Booked
  ↓
Upcoming
  ↓
Completed

Alternative termination:

Booked / Upcoming
       ↓
Cancelled

The frontend should present status-aware actions rather than exposing actions that are no longer valid.

8. Pre-Visit Symptoms

The patient can submit symptoms before consultation.

Example flow:

Patient symptoms
      ↓
Appointment context
      ↓
Optional LLM processing
      ↓
Pre-visit summary
      ↓
Stored with appointment
      ↓
Doctor reviews information

LLM output is an assisting feature. It must not replace clinical judgment or authorization logic.

9. Consultation

The doctor can complete an appointment with consultation information such as:

diagnosis

notes

prescription

follow-up date

follow-up instructions

The appointment becomes a completed clinical record after successful consultation submission.

10. Visit Summary

The patient can view the completed visit information.

A summary may include:

Appointment
Doctor
Date
Symptoms / pre-visit information
Diagnosis
Consultation notes
Prescription
Follow-up information

11. Medication Reminders

Background jobs are used for scheduled reminder processing.

The architecture separates:

Clinical / appointment data
        ↓
Reminder job
        ↓
Notification record
        ↓
Optional email delivery

This allows reminder processing to continue independently of the frontend.

12. Notifications

Notifications can be represented as persistent records.

This is preferable to relying exclusively on email because:

the user can see notifications in-app

delivery can be retried

external SMTP availability does not determine whether an event was recorded

13. Background Jobs

The backend includes scheduled jobs for:

appointment reminders

email retry processing

medication/prescription reminder processing

Jobs are started from the backend startup sequence.

14. External Integrations

LLM

Used for optional symptom / summary processing.

Failure should be handled gracefully so that normal appointment functionality is not dependent on an external AI provider.

Google Calendar

Optional appointment synchronization.

Required configuration:

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN

Invalid OAuth configuration should be surfaced as an integration error rather than exposing credentials.

SMTP

Used for optional email notifications.

Required configuration:

SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM

15. Data Model

Core entities:

User
Doctor
Appointment
Notification
Prescription / prescription information

Relationships:

User (Patient)
      │
      └────< Appointment >──── Doctor
                    │
                    ├── Symptoms
                    ├── Consultation
                    ├── Prescription
                    └── Follow-up

Appointment
      │
      └────< Notification

The Mongoose model files are the authoritative implementation of the schema.

16. Security

Important security practices:

JWT authentication

role-based backend authorization

patient-only public registration

environment variables for secrets

.env excluded from Git

no credentials in README

server-side validation

server-side appointment authorization

controlled external-service error handling

17. Error Handling

Errors are handled across multiple layers:

Frontend validation
        ↓
API request
        ↓
Authentication middleware
        ↓
Authorization middleware
        ↓
Controller validation
        ↓
Database/service operation
        ↓
Central error handling

Expected categories include:

400 validation errors

401 authentication failures

403 authorization failures

404 missing resources

409 appointment conflicts where applicable

500 unexpected server errors

18. Deployment Architecture

For deployment:

Browser
  ↓
Frontend hosting
  ↓
Backend API
  ↓
MongoDB

Optional:
Backend → SMTP
Backend → Google Calendar
Backend → LLM provider

Production credentials should be configured through the hosting provider's environment-variable system.

19. Design Principles

The project intentionally follows a practical academic-project architecture:

Keep business logic on the backend.

Keep frontend role checks separate from backend authorization.

Validate appointment availability on the server.

Treat third-party integrations as optional dependencies.

Keep secrets outside source control.

Use reusable route/controller/service layers.

Keep the UI simple and healthcare-oriented rather than over-designed.

# API Documentation

> The route files under `backend/src/routes/` are the authoritative source for exact endpoint names and HTTP methods. This document provides the functional API map for the project.

## Authentication

| Operation | Purpose | Access |
|---|---|---|
| Register | Create public patient account | Public |
| Login | Authenticate account and issue JWT | Public |

### Registration

Public registration is intentionally patient-only.

Doctor and Admin accounts are provisioned through controlled development/admin mechanisms.

---

## Doctors

| Operation | Purpose | Access |
|---|---|---|
| List doctors | Browse available doctors | Patient / authorized user |
| View doctor | View doctor profile | Patient / authorized user |
| Availability | Retrieve date/slot availability | Patient |
| Manage doctor | Create/update/activate/deactivate | Admin |

---

## Appointments

| Operation | Purpose | Access |
|---|---|---|
| Book | Create appointment | Patient |
| List | View relevant appointments | Role-dependent |
| Detail | View appointment | Authorized participant |
| Cancel | Cancel appointment | Authorized patient / role |
| Symptoms | Submit pre-visit symptoms | Patient |
| Consultation | Complete consultation | Doctor |

---

## Patient

| Operation | Purpose | Access |
|---|---|---|
| Profile | View profile | Patient |
| Update profile | Edit profile | Patient |

---

## Admin

| Operation | Purpose | Access |
|---|---|---|
| Dashboard | View system overview | Admin |
| Doctors | Manage doctors | Admin |
| Patients | Manage patients | Admin |
| Appointments | Manage appointments | Admin |

---

## Authentication Header

Protected requests use the authenticated JWT session.

Conceptually:

```http
Authorization: Bearer <JWT>
```

Never place real JWT secrets or credentials in source code.

---

## Appointment Booking Validation

The backend should validate:

- authenticated patient
- valid doctor
- valid date
- doctor working/available day
- valid time slot
- required reason/notes where applicable
- slot is still available
- appointment conflict does not exist

---

## Error Response Principles

Clients should expect appropriate HTTP status codes for:

- invalid request data
- unauthenticated request
- unauthorized role
- missing resource
- appointment conflict
- server/integration failure

The frontend should display user-friendly messages rather than raw stack traces.

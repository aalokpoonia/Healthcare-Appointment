# Healthcare Appointment & Follow-up Manager

## Live Demo
[Open Healthcare Appointment Management System](https://extraordinary-paprenjak-db9f0a.netlify.app/)

## Overview
This repository contains a MERN-based healthcare appointment system with patient, doctor, and admin flows. The application supports appointment booking, doctor availability, symptom intake, consultation completion, follow-up notes, optional Google Calendar sync, and failure-safe background notifications.

It is a working local project and not a verified public deployment. Deployment configuration is present in [render.yaml](render.yaml), but a hosted URL requires platform setup and credentials outside this codebase.

## Features implemented in the current codebase
- Patient registration and login
- Doctor search and listing
- Doctor availability, working hours, slot generation, and leave-day handling
- Appointment booking with duplicate-slot prevention
- Appointment cancellation
- Pre-visit symptoms and LLM summary generation with safe fallback
- Doctor consultation and post-visit summary generation with safe fallback
- Prescription storage and frequency tracking
- Background appointment reminder job
- Background medication reminder job
- Email queue/retry handling
- Optional Google Calendar event creation/deletion
- Admin leave marking for affected appointments

## Tech stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js + MongoDB + Mongoose
- Auth: JWT
- Background jobs: node-cron
- Email: Nodemailer
- LLM: OpenAI-compatible client with fallback-safe service
- Calendar: Google Calendar API, optional

## Local setup
1. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
2. Create local `.env` files from the example files in the respective folders.
3. Start the backend:
   ```bash
   cd backend
   npm start
   ```
4. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
5. Use the seeded demo accounts for local testing.

## Demo accounts
- Patient: `patient.demo@example.com` / `Patient@123`
- Doctor: `doctor.demo@example.com` / `Doctor@123`
- Admin: `admin.demo@example.com` / `Admin@123`

## Environment variables
Environment files are not committed. The current code reads the following variables.

### Backend (.env)
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

### Frontend (.env)
- `VITE_API_URL`

## API documentation
The following endpoints are the important ones currently present in the code.

### Authentication
- `POST /api/auth/register` — register a patient account. Requires no auth.
- `POST /api/auth/login` — authenticate a user and return a JWT. Requires no auth.
- `GET /api/auth/me` — return current user. Requires JWT auth.
- `GET /api/auth/profile` — return current profile. Requires JWT auth.
- `PUT /api/auth/profile` — update profile fields. Requires JWT auth.

### Doctors
- `GET /api/appointments/doctors` — search doctors. Requires JWT auth.
- `GET /api/appointments/doctors/:id/slots` — get available slots for a doctor/date. Requires JWT auth.
- `GET /api/doctors/profile` — doctor profile. Requires doctor role.
- `PUT /api/doctors/profile` — update doctor profile. Requires doctor role.

### Appointments
- `POST /api/appointments/book` — create an appointment. Requires JWT auth.
- `GET /api/appointments/me` — current patient appointments. Requires JWT auth.
- `GET /api/appointments/:id` — fetch appointment details. Requires JWT auth.
- `PATCH /api/appointments/:id/cancel` — cancel an appointment. Requires JWT auth.
- `POST /api/appointments/hold` — hold a slot for two minutes. Requires JWT auth.
- `GET /api/appointments/doctor` — list appointments for the logged-in doctor. Requires doctor role.

### Symptoms / consultation
- `POST /api/appointments/symptoms` — submit pre-visit symptoms and trigger the LLM summary generation. Requires JWT auth.
- `POST /api/appointments/summary` — complete consultation with diagnosis, notes, prescription, and follow-up info. Requires JWT auth; doctor or admin.

### Admin
- `GET /api/admin/stats` — admin dashboard stats. Requires admin role.
- `GET /api/admin/doctors` — list doctors. Requires admin role.
- `POST /api/admin/doctors` — create doctor. Requires admin role.
- `PUT /api/admin/doctors/:id` — update doctor. Requires admin role.
- `PATCH /api/admin/doctors/:id/status` — toggle doctor active status. Requires admin role.
- `DELETE /api/admin/doctors/:id` — delete doctor. Requires admin role.
- `POST /api/admin/doctors/:id/leave` — mark a doctor unavailable on a date and handle affected bookings. Requires admin role.
- `GET /api/admin/patients` — list patients. Requires admin role.
- `GET /api/admin/appointments` — list all appointments. Requires admin role.

## Database schema
The application uses MongoDB collections through Mongoose models.

### User
- Fields: `name`, `email`, `password`, `role`, `phone`, `dateOfBirth`, `gender`, `address`, `emergencyContact`, `isActive`
- Relationship: a user can be a `patient`, `doctor`, or `admin`

### Patient
- Created when a patient registers
- Fields: `userId`, profile details if present in the current implementation
- Relationship: one patient profile maps to one user

### Doctor
- Fields: `userId`, `specialization`, `qualification`, `experience`, `consultationFee`, `hospitalName`, `availableDays`, `workingHours`, `slotDuration`, `leaveDays`, `bio`, `isActive`
- Relationship: linked to one user and many appointments

### Appointment
- Fields: `doctorId`, `patientId`, `date`, `slotTime`, `reason`, `notes`, `status`, `symptomSummary`, `preVisitSummary`, `diagnosis`, `clinicalNotes`, `postVisitSummary`, `prescription`, `prescriptionFrequency`, `followUpDate`, `recommendations`, `googleEventId`, `calendarSyncStatus`
- Relationship: each appointment belongs to one patient and one doctor
- A unique index prevents duplicate doctor/date/slot entries

### Prescription
- Fields: `appointmentId`, `patientId`, `medicationName`, `dosage`, `frequency`, `duration`, `notes`
- Relationship: attached to an appointment; supports reminder scheduling by frequency

### Notification
- Fields: `userId`, `appointmentId`, `type`, `status`, `retryCount`, `payload`, `sentAt`
- Relationship: records email delivery attempts for booking, reminder, cancellation, and medication reminder events

## LLM prompts and failure handling
The actual LLM integration is in `backend/src/services/llmService.js`.

### Pre-visit summary prompt
```text
Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: {symptoms}
```

### Post-visit summary prompt
```text
Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: {clinicalNotes}
```

### Failure behavior
- If `OPENAI_API_KEY` is not configured, the service returns a fallback-safe result instead of crashing.
- If the external LLM request fails, the appointment/consultation is still saved.
- The user sees a fallback message such as "Summary unavailable — please review notes manually."

## Google Calendar setup
The calendar feature is optional and should not block appointment creation.

1. Create a Google Cloud project.
2. Enable the Google Calendar API.
3. Create OAuth 2.0 credentials.
4. Configure a refresh token and store it in local environment variables.
5. Set the following values in the backend `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
6. If the credentials are absent or invalid, the code logs the failure and continues without returning a 500 for the appointment request.

## Background jobs
- `startReminderJob()` runs a cron process for appointment reminders and medication reminders.
- `startEmailRetryJob()` retries failed notifications until the retry limit is reached.
- Email send attempts are non-blocking; missing SMTP credentials simply skip email sending instead of breaking the business flow.

## Project status
This project is a working local codebase with optional integrations and safe failure handling. It is not a verified public deployment and should not be described as such.

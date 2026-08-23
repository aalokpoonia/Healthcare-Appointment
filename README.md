# Healthcare Appointment & Follow-up Manager

A deployable MVP for a healthcare booking platform built with the MERN stack.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + React Router + Axios
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT with patient/doctor/admin roles
- LLM: OpenAI API integration with fallback handling
- Email: Nodemailer + notification queue
- Calendar: Google Calendar API integration with OAuth-ready service layer
- Background jobs: node-cron for reminders and email retries

## Project Structure
```text
Healthcare Appointment/
  backend/
    src/
      models/
      routes/
      controllers/
      middleware/
      services/
      jobs/
      config/
    .env.example
    server.js
  frontend/
    src/
      pages/
      components/
      context/
      api/
  render.yaml
  README.md
  SYSTEM_DESIGN.md
```

## Quick Start

### 1) Backend setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```

### 2) Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables
See `backend/.env.example` and `frontend/.env.example`.

Required backend values:
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

Required frontend value:
- `VITE_API_URL`

## Database Schema
- User: id, name, email, password, role, phone, createdAt
- Doctor: userId, specialization, workingHours, slotDuration, leaveDays[], bio
- Patient: userId, dateOfBirth, bloodGroup, allergies, medicalHistory
- Appointment: doctorId, patientId, date, slotTime, status, symptomSummary, preVisitSummary, postVisitSummary, doctorNotes, prescription, holdUntil, googleEventId
- Prescription: appointmentId, patientId, medicationName, dosage, frequency, duration, notes
- Notification: userId, appointmentId, type, status, retryCount, payload, sentAt

## API Route List

### Auth
- POST `/api/auth/register` — body: `{ name, email, password, phone, role }`
- POST `/api/auth/login` — body: `{ email, password }`
- GET `/api/auth/me` — requires JWT

### Admin
- GET `/api/admin/doctors`
- POST `/api/admin/doctors` — body with doctor details and user details
- PUT `/api/admin/doctors/:id`
- DELETE `/api/admin/doctors/:id`
- POST `/api/admin/doctors/:id/leave` — body: `{ date }`

### Patient/Booking
- GET `/api/appointments/doctors`
- GET `/api/appointments/doctors/:id/slots?date=2026-08-25`
- POST `/api/appointments/book` — body: `{ doctorId, date, slotTime }`
- POST `/api/appointments/hold` — body: `{ doctorId, date, slotTime }`
- POST `/api/appointments/symptoms` — body: `{ appointmentId, symptoms }`
- GET `/api/appointments/me`

### Doctor
- GET `/api/doctors/profile`
- PUT `/api/doctors/profile`
- GET `/api/appointments/doctor`
- POST `/api/appointments/summary` — body: `{ appointmentId, notes, prescription }`

## LLM Prompts (exact)
Pre-visit:
```text
Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: <symptoms>
```

Post-visit:
```text
Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: <notes>
```

The LLM service attempts JSON responses and falls back to the message:
`Summary unavailable — please review notes manually.`

## Google Calendar OAuth Setup
1. Go to Google Cloud Console.
2. Create a new project and enable Google Calendar API.
3. Create OAuth 2.0 client credentials.
4. Add authorized redirect URI: `http://localhost:5000/oauth/google/callback` for local dev.
5. Save the Client ID and Secret in `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
6. Generate refresh token and store it as `GOOGLE_REFRESH_TOKEN`.
7. Ensure the account has calendar access enabled.

## SMTP / Email Setup
Use Gmail SMTP with App Password or Mailtrap in development:
- SMTP Host: `smtp.gmail.com`
- Port: `587`
- User: Gmail email address
- Pass: App password for Gmail

## Deployment
### Render (backend)
- Connect repo to Render.
- Set build command: `cd backend && npm install`
- Set start command: `cd backend && npm start`
- Add all backend env vars from `.env.example`

### Vercel (frontend)
- Import the repo into Vercel.
- Set project root to `frontend`.
- Add `VITE_API_URL` pointing to the deployed backend URL.
- Deploy.

This project includes a `render.yaml` file for one-click Render deployment scaffolding.

## Notes
- Booking uses a unique Mongo compound index and a rapid slot hold to reduce double-booking risk.
- If the LLM is unavailable, booking and note submission still continue.
- Background jobs send reminders and retry failed emails.

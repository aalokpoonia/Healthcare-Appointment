Healthcare Appointment Management System

A full-stack MERN healthcare appointment management system designed around a realistic patient–doctor–admin workflow.

Project Status

Academic / Campus Assignment Project

The system demonstrates role-based healthcare operations including doctor discovery, availability-based appointment booking, pre-visit symptoms, doctor consultation, prescriptions, visit summaries, notifications, and administrative management.

Important: Google Calendar and email services are optional integrations and require valid external credentials. The core appointment workflow should not depend on Google OAuth being configured.

Core Workflow

Patient
  ↓
Register / Login
  ↓
Find Doctor
  ↓
View Doctor Profile & Availability
  ↓
Select Date
  ↓
Select Available Time Slot
  ↓
Book Appointment
  ↓
Submit Pre-Visit Symptoms
  ↓
Doctor Reviews Patient / Symptoms
  ↓
Consultation
  ↓
Diagnosis + Prescription + Follow-up
  ↓
Visit Summary
  ↓
Medication / Appointment Reminders

Key Features

Patient

Patient-only public registration

Secure JWT login

Browse and search doctors

View doctor profiles

View doctor availability

Select appointment date and time

Appointment reason / notes

Appointment booking

Double-booking protection

Appointment cancellation

Appointment history

Pre-visit symptom submission

Consultation / visit summary access

Prescription information

Profile management

Notifications and reminders

Doctor

Secure doctor login

Doctor dashboard

View upcoming appointments

View patient details

Review submitted symptoms

Complete consultation

Record diagnosis / notes

Add prescription details

Set follow-up information

Review appointment history

Admin

Secure admin login

Admin dashboard

Doctor management

Add / edit doctors

Activate / deactivate doctors

Patient management

Appointment management

View appointment details

Role-protected administration routes

Security & Access Control

The application uses JWT authentication and role-based authorization.

Role

Main Access

Patient

Patient dashboard, doctors, booking, symptoms, appointments, profile

Doctor

Doctor dashboard, assigned appointments, patient information, consultation

Admin

Administrative dashboard, doctors, patients, appointments

Public registration creates a Patient account only. Doctor and Admin accounts are intended to be provisioned through the development/admin/seed mechanism rather than arbitrary public registration.

Backend authorization is treated as the security boundary; frontend route protection is only the user-interface layer.

Tech Stack

Frontend

React

Vite

Tailwind CSS

React Router

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT

Supporting Services

Nodemailer

node-cron

Google Calendar API (optional)

LLM service for symptom / visit-summary processing (optional, credential-dependent)

Project Structure

Healthcare Appointment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── jobs/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   └── services/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
├── README.md
├── SYSTEM_DESIGN.md
├── render.yaml
└── package.json

Installation

1. Clone

git clone https://github.com/aalokpoonia/Healthcare-Appointment.git
cd Healthcare-Appointment

2. Backend

cd backend
npm install

Create a local .env from backend/.env.example.

3. Frontend

cd ../frontend
npm install

Create a local .env from frontend/.env.example.

4. Start Backend

cd ../backend
npm start

5. Start Frontend

In another terminal:

cd frontend
npm run dev

Environment Variables

Backend

PORT=
MONGO_URI=
JWT_SECRET=

OPENAI_API_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=

Frontend

VITE_API_URL=

Do not commit real .env files or credentials.

Development Demo Accounts

The project includes seeded development accounts for local demonstration:

Role

Email

Password

Patient

patient.demo@example.com

Patient@123

Doctor

doctor.demo@example.com

Doctor@123

Admin

admin.demo@example.com

Admin@123

These credentials are intended for local/demo use only.

Appointment Availability

Appointment booking follows an availability-based flow:

Patient selects a doctor.

Patient selects a date.

The system checks the doctor's configured availability.

Available slots are generated.

Already-booked slots are excluded.

Patient selects an available slot.

The backend validates the slot again before creating the appointment.

The appointment is created only when the selected slot remains valid.

This server-side revalidation is important because frontend slot availability can become stale if another appointment is created concurrently.

Pre-Visit Symptoms & Consultation

Patients can submit symptoms and relevant notes before an appointment.

The doctor can then review the appointment context and complete the consultation.

The consultation workflow supports information such as:

diagnosis

consultation notes

prescription

follow-up information

The final visit summary presents the relevant completed consultation information to the patient.

LLM-powered processing is treated as an assisting feature rather than the authorization or booking mechanism.

Medication & Appointment Reminders

The backend contains scheduled background jobs for reminders.

The reminder infrastructure is designed to support:

upcoming appointment reminders

prescription / medication reminder processing

notification records

retry handling for failed email delivery

External email credentials are required for actual SMTP delivery.

Google Calendar Integration

Google Calendar is an optional integration.

When configured correctly, appointment information can be synchronized with Google Calendar.

Required credentials include:

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN

If Google OAuth is not configured or credentials are invalid, Calendar synchronization should be treated as an optional integration failure rather than a reason to expose credentials or block the core healthcare workflow.

API Overview

The backend is organized into authentication, doctor, appointment, patient and admin route groups.

Typical operations include:

Area

Operation

Auth

Register

Auth

Login

Doctors

List doctors

Doctors

View doctor

Doctors

View availability

Appointments

Create / book

Appointments

View appointments

Appointments

View details

Appointments

Cancel

Appointments

Submit symptoms

Appointments

Complete consultation

Patient

View / update profile

Admin

Manage doctors

Admin

Manage patients

Admin

Manage appointments

Refer to the route files under backend/src/routes/ for the authoritative endpoint definitions.

Database Model Overview

The system uses MongoDB with Mongoose.

Core entities include:

User
 ├── role: patient / doctor / admin
 │
Doctor
 │
Appointment
 ├── patient
 ├── doctor
 ├── date/time
 ├── status
 ├── symptoms / pre-visit data
 ├── consultation data
 └── follow-up / prescription information
 │
Notification

The exact model definitions under backend/src/models/ are the source of truth.

Screenshots

Place real screenshots from the running application in screenshots/ and use the following section:

Login



Patient Dashboard



Doctor Selection & Availability



Appointment Booking



Doctor Dashboard



Consultation / Visit Summary



Validation

The project has been validated through:

frontend production builds

backend JavaScript syntax checks

local backend startup

demo authentication checks

appointment-flow development checks

role-protection review

repository secret exclusion checks

For a final submission, the recommended smoke test is:

Patient login
→ Find doctor
→ Select date
→ Select slot
→ Book
→ Submit symptoms
→ Doctor login
→ Open appointment
→ Complete consultation
→ Patient login
→ View visit summary

Error Handling

The application should distinguish between:

validation errors

authentication failures

authorization failures

unavailable appointment slots

duplicate bookings

external service failures

database/server errors

External integrations such as email and Google Calendar should not expose credentials in error messages.

Deployment

A render.yaml configuration is included for deployment preparation.

Deployment still requires:

production MongoDB configuration

secure environment variables

production frontend/backend URLs

external service credentials where required

final production smoke testing

No production URL is claimed unless deployment has been independently verified.

Documentation

README.md — project overview and setup

SYSTEM_DESIGN.md — architecture and system design

render.yaml — deployment configuration

Future Improvements

Production deployment

Automated end-to-end tests

Production email configuration

Production Google Calendar OAuth

More granular doctor scheduling / leave management

Audit logging

Improved notification preferences

Monitoring and observability

Academic Note

This project was developed as a full-stack academic/campus assignment demonstrating practical implementation of:

MERN stack development

REST APIs

authentication and authorization

database modeling

role-based workflows

appointment scheduling

background jobs

external service integration

healthcare-oriented user flows

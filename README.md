# Healthcare Appointment Management System

## About the Project
This project is a MERN-based healthcare appointment management system developed as an academic and full-stack project. It supports the core healthcare workflow for three user roles: Patient, Doctor, and Admin.

The main patient journey is:
Patient → Find Doctor → View Availability → Select Date → Select Time Slot → Book Appointment → Submit Symptoms → Doctor Consultation → Visit Summary

## Features
- JWT authentication
- role-based access
- patient registration/login
- doctor listing
- doctor profile
- doctor availability
- appointment slot selection
- appointment booking
- double-booking prevention
- appointment cancellation
- pre-visit symptom submission
- doctor consultation
- prescriptions
- visit summary
- patient profile
- doctor dashboard
- admin dashboard
- doctor/patient/appointment management
- optional Google Calendar integration

## Tech Stack
### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT

### Additional Technologies
- Google Calendar API (optional integration)
- Nodemailer
- node-cron

## Project Structure
```text
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
│   ├── package-lock.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .gitignore
├── README.md
├── package.json
├── render.yaml
├── screenshots/
├── SYSTEM_DESIGN.md
└── package-lock.json
```

## Installation
1. Clone the repository.
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd ../backend
   npm install
   ```
4. Create local `.env` files from the example files and set the required environment variables.
5. Start the backend:
   ```bash
   cd backend
   npm start
   ```
6. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Environment Variables
The project expects the following environment variables to be defined locally in `.env` files. Do not commit these files.

### Backend
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

### Frontend
- `VITE_API_URL`

## Demo Accounts
The following demo accounts are intentionally included for local testing and are used by the seeded development data:

- Patient: patient.demo@example.com / Patient@123
- Doctor: doctor.demo@example.com / Doctor@123
- Admin: admin.demo@example.com / Admin@123

## Main Application Flow
Patient
→ Find Doctor
→ View Availability
→ Select Date
→ Select Time Slot
→ Book Appointment
→ Submit Symptoms
→ Doctor Consultation
→ Visit Summary

## Screenshots
Screenshots will be added here as the project documentation is expanded.

## Testing
The following project behaviors were verified:
- appointment creation
- doctor time-slot availability
- double-booking prevention
- appointment cancellation
- frontend production build

## Future Improvements
- production Google Calendar configuration
- email notifications
- deployment
- automated tests

## Project Status
Academic project — MERN-based Healthcare Appointment Management System.

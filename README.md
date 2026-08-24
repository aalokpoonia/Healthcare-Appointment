# Healthcare Appointment Management System

## About the Project
This project is a MERN-based healthcare appointment management system designed for role-based patient care and clinic operations. Patients can find doctors, view doctor availability, book appointments, submit pre-visit symptoms, and review consultation summaries. Doctors can manage appointments and consultation records, while admins can manage doctors, patients, and appointment records.

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
- OpenAI API (for symptom and summary processing)
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
└── SYSTEM_DESIGN.md
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
4. Configure environment variables using the provided `.env.example` files.
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
Create local `.env` files from the examples and define only the required values.

### Backend
```env
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
```

### Frontend
```env
VITE_API_URL=
```

## Demo Accounts
The following demo accounts are intentionally provided for local development and are already used in the project seed script:

- Patient: `patient.demo@example.com` / `Patient@123`
- Doctor: `doctor.demo@example.com` / `Doctor@123`
- Admin: `admin.demo@example.com` / `Admin@123`

## Main Application Flow
Patient
→ Find Doctor
→ Select Date
→ Select Time Slot
→ Book Appointment
→ Submit Symptoms
→ Doctor Consultation
→ Visit Summary

## Testing
The appointment flow was verified for:
- appointment creation
- slot availability
- double-booking prevention
- cancellation
- frontend production build

## Future Improvements
- production Google Calendar configuration
- email notifications
- deployment
- automated testing

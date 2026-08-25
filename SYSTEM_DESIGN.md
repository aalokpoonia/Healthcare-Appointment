# System Design

The application uses a simple MERN architecture: a Node/Express backend exposes REST APIs, MongoDB stores users, doctors, bookings, prescriptions, notifications, and summaries, and a React/Vite frontend renders role-specific screens for patients, doctors, and admins. The backend is responsible for business logic, background jobs, and failure-safe integrations with LLM, email, and Google Calendar services.

## Database design
MongoDB models are stored as Mongoose schemas. `User` holds login and role metadata. `Doctor` stores specialty, working hours, slot duration, available days, and leave days. `Appointment` holds the booked date, slot, reason, symptom intake, consultation details, prescription, follow-up date, and optional Google Calendar metadata. `Prescription` stores medication name, dosage, frequency, duration, and notes. `Notification` captures outgoing email or reminder payloads and their retry state. This keeps the core workflow simple while allowing role-based access and asynchronous follow-up processing.

## API structure
The backend separates routes by concern: authentication, doctor profile actions, admin actions, and appointment actions. The appointment routes handle doctor search, slot generation, booking, cancellation, symptom submission, consultation completion, and retrieving appointments for patient or doctor views. Admin routes manage doctor records, activation/deactivation, and leave-date conflicts.

## Doctor availability and slots
Doctor availability is based on `availableDays`, `workingHours`, and `slotDuration`. The slot service generates times from the start and end times of the working day, filters out dates marked as leave days, and excludes already booked times for the selected doctor/date. The result is returned to the frontend as available/not-available slot objects, and the booking API rejects a request if the selected slot is no longer valid.

## Double-booking prevention and simultaneous safety
The critical invariant is that one doctor cannot have more than one appointment in the same date and time slot. The `Appointment` model defines a unique compound index on `(doctorId, date, slotTime)`. Booking flow checks for an existing non-cancelled appointment before creation and then uses a guarded create/update pattern. If two requests race, MongoDB rejects the duplicate insert, and the API returns a conflict instead of creating a second booking.

## Doctor leave conflict handling
Admin leave is recorded on the doctor record by date. When a leave date is set, the admin controller finds affected appointments for that doctor/date, marks them as flagged, and queues notifications to the affected patient instead of silently deleting appointment records. This preserves a visible record of the disruption and keeps the patient informed.

## Slot availability and hold approach
The current code does not implement a true temporary reservation/hold system with an external lock. The actual behavior is: a slot is considered available only when it is not already booked and the doctor is not marked unavailable on that date. The code does include an `on_hold` status and a `holdUntil` field, but the runtime logic uses it conservatively and the slot validation is primarily based on existing appointment records and leave dates. This is the code’s real behavior, and the design description reflects that rather than claiming a more advanced hold mechanism.

## LLM pre-visit summary
The symptom intake endpoint collects symptoms and related details and calls the LLM service with the prompt: “Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: …” The returned JSON is stored on the appointment as `preVisitSummary`. If the LLM key is missing or the external request fails, the code stores a safe fallback instead of failing the appointment flow.

## LLM post-visit summary
When the doctor completes consultation, the backend gathers diagnosis, clinical notes, prescription, and follow-up information, then sends the clinical notes to the LLM using the prompt: “Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: …” The generated summary is stored on the appointment and shown to the patient. If the external service fails, consultation data still saves and the patient sees a fallback message.

## Email and retry handling
Notification delivery is intentionally non-blocking. Booking confirmations, cancellations, reminders, and medication reminders are queued as `Notification` records. The email service skips sending when SMTP credentials are unavailable. The retry job scans failed notifications and retries them up to a limited number of times without interrupting the main booking or consultation flow.

## Google Calendar failure handling
Google Calendar is optional. On booking, the code attempts calendar event creation after the appointment record is created. If the configuration is invalid or the API fails, the application logs the error, marks the calendar sync as failed/skipped, and still returns the appointment successfully. This prevents appointment creation from depending on Google OAuth.

## Background jobs
The backend starts a cron-based reminder job for appointment reminders and medication reminders, and a separate retry job for failed email notifications. These jobs run asynchronously and are designed to fail safely without breaking user-facing APIs.

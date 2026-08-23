# System Design Summary

This MVP uses a simple but resilient architecture that keeps the appointment flow reliable under concurrency and external API failures. The backend is an Express API connected to MongoDB via Mongoose, and the frontend is a Vite React app with route-based role access.

## Double-booking prevention
The critical booking invariant is: one doctor cannot be assigned more than one patient to the same date and slot time. The Appointment model applies a unique compound index on `(doctorId, date, slotTime)`. Bookings are attempted through `findOneAndUpdate` with an upsert guard, and if the data race still occurs, MongoDB rejects the duplicate insert with a unique-key error. That makes the second request fail cleanly instead of allowing two bookings for the same slot.

## Doctor leave conflict handling
When an admin marks a doctor as unavailable for a date, the leave endpoint updates the doctor record and queries all existing appointments for that doctor on that date. Any non-cancelled booking is flagged, and a notification is queued for the affected patient. This guarantees a visible record of the conflict even before a full reschedule workflow is implemented. The design intentionally avoids silently deleting patient records.

## Slot hold mechanism
A short slot hold is implemented by storing `holdUntil` on the Appointment and setting the appointment status to `on_hold` for two minutes. The field is indexed with MongoDB TTL behavior so expired holds can be cleaned up automatically. The patient symptom form can use this reservation window to complete intake before the slot is released or confirmed. This prevents the slot from being grabbed by another patient while a user is mid-checkout.

## Notification failure handling
Any email or reminder send is stored as a `Notification` document with status `pending`, `failed`, or `sent`. The retry job processes failed notifications with exponential backoff-style retry count throttling and stops after three attempts. This ensures delivery attempts do not block the user flow. The API still returns success for appointment bookings and notes submission even when sending email or LLM content fails.

## LLM resilience
The LLM layer wraps all OpenAI calls in a fallback-safe service. If the request fails, times out, or the API key is missing, the service returns a structured fallback message: `Summary unavailable — please review notes manually.` The appointment and notes remain persisted and the user workflow continues without waiting on LLM success. This is essential for an MVP where external services may be temporarily unavailable.

## Deployment layout
The backend is ready for Node deployment on Render with environment variables from `.env.example`, and the frontend is ready for Vercel with the `VITE_API_URL` environment variable pointing to the deployed backend. Combined, this matches the intended production split of a Node API and a React frontend.

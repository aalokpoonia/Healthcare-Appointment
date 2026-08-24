# Unthinkable Campus Assignment — Final Submission Checklist

## Repository

- [ ] GitHub repository is public
- [ ] Repository description added
- [ ] Relevant GitHub topics added
- [ ] `.gitignore` present
- [ ] No `.env` files committed
- [ ] No `node_modules` committed
- [ ] README updated
- [ ] SYSTEM_DESIGN.md updated
- [ ] API documentation included
- [ ] Screenshots included
- [ ] Final source ZIP created

## Application

- [ ] Patient registration works
- [ ] Public registration cannot create Admin
- [ ] Patient login works
- [ ] Doctor login works
- [ ] Admin login works
- [ ] Patient cannot access Doctor dashboard
- [ ] Patient cannot access Admin dashboard
- [ ] Doctor cannot access Admin pages
- [ ] Doctor can access Doctor dashboard
- [ ] Admin can access Admin dashboard

## Patient Flow

- [ ] Find doctor
- [ ] View doctor profile
- [ ] Select date
- [ ] View availability
- [ ] Select time slot
- [ ] Book appointment
- [ ] Submit symptoms
- [ ] View appointment
- [ ] Cancel appointment
- [ ] View consultation / visit summary
- [ ] View prescription
- [ ] Profile update

## Doctor Flow

- [ ] View appointments
- [ ] Open patient details
- [ ] Review symptoms
- [ ] Complete consultation
- [ ] Add diagnosis
- [ ] Add notes
- [ ] Add prescription
- [ ] Add follow-up date/instructions

## Admin Flow

- [ ] Dashboard
- [ ] Doctor management
- [ ] Add doctor
- [ ] Edit doctor
- [ ] Activate/deactivate doctor
- [ ] Patient management
- [ ] Appointment management

## Integrations

- [ ] Reminder job starts
- [ ] Notification processing works
- [ ] Email configuration documented
- [ ] Google Calendar configuration documented
- [ ] LLM configuration documented
- [ ] External integration failures do not expose secrets

## Final Verification

Run:

```bash
cd frontend
npm run build
```

Then perform the final smoke test:

```text
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
```

## Submission Safety

Never include:

```text
.env
MongoDB credentials
JWT secrets
Google client secrets
Google refresh tokens
SMTP passwords
API keys
node_modules
dist/build artifacts
.git
```

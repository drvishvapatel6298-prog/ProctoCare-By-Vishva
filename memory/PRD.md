# ProctoCare by Vishva — PRD

## Original Problem Statement
Premium multi-page website for proctology clinic "ProctoCare by Vishva". Luxury yet caring medical brand for tier-2 city patients — soft medical palette (white, calming teal, soft beige), elegant typography, modern layout, mobile-first. Personal-brand positioning of the doctor with multi-page structure (Home, About Doctor, Services, Booking, Testimonials, FAQ, Blog, Contact) plus an admin appointment-management dashboard.

## User Personas
1. **Patient (primary)** — adult in tier-2 Indian city seeking confidential, premium proctology care. Wants clarity, privacy, and easy booking.
2. **Doctor / Clinic Admin** — manages appointments, patient flow, contact messages, and approves/reschedules bookings.

## Core Requirements (locked)
- Premium luxury medical design with teal (#1A5B5E) + bone white (#FBFBF9) + warm beige (#C9B69B).
- Cormorant Garamond + Outfit typography.
- Multi-page React Router app with sticky Book CTA & floating WhatsApp.
- Public REST API for services, FAQ, testimonials, blog, time-slots.
- Patient appointment booking with calendar + slot selection (booked slots blocked).
- JWT-protected admin dashboard for managing appointments, contact messages, stats.
- Resend-powered email confirmation to patient + clinic admin.
- SEO-friendly meta tags, semantic headings.

## Architecture
- **Backend:** FastAPI + Motor (MongoDB) + bcrypt + PyJWT + Resend SDK.
- **Frontend:** React 19, React Router 7, Tailwind, shadcn/ui (Calendar, Popover, Sonner toaster), lucide-react icons.
- **Auth:** Bearer JWT in localStorage (12h TTL). Single seeded admin user (no public registration).
- **Email:** Resend, async non-blocking; failures logged but never block booking.

## What's Been Implemented (2026-04-25 — MVP launch)
- Full multi-page marketing site (Home, About, Services, Blog list & detail, Testimonials, FAQ, Contact).
- Appointment booking flow with date picker + dynamic time-slot grid + duplicate-slot 409 protection.
- Admin login + dashboard with stats, filterable appointment table, approve/reschedule/cancel/delete actions, contact messages tab.
- 5 SEO-rich pre-seeded blog posts (piles, fissure, laser, fistula, prevention).
- 6 services, 6 testimonials, 10 FAQs seeded as static content.
- Resend email pipeline for patient + admin notifications on booking.
- Floating WhatsApp button + sticky Book CTA after 400px scroll.
- SEO meta tags (title, description, OG tags) configured.
- 100% backend test pass (18/18 pytest cases) and end-to-end frontend Playwright validation.

## Prioritised Backlog
### P1 (next-up)
- Per-page meta tags (currently global only) — react-helmet for unique titles per route.
- Schema.org `Physician` + `MedicalClinic` + `Article` JSON-LD for SEO.
- Replace placeholder doctor photo & clinic photos with real shots once provided.
- Real clinic address + Google Maps embed once finalised.
- Real WhatsApp/phone number wiring (currently +91 90000 00000 placeholder).

### P2 (nice-to-have)
- Brute-force lockout on admin login (per playbook, 5 fails → 15 min).
- Admin can edit/CRUD blog posts, testimonials, services from the dashboard.
- Patient self-service: lookup booking by phone + last-name to view status.
- WhatsApp / SMS notifications on booking via Twilio.
- Appointment reminders (24h before).

### P3 (future)
- Multi-language (Hindi + Gujarati).
- Patient login + medical history vault.
- Online video-consultation room (Twilio Video / Daily.co).
- Payment integration (advance booking).

## Files Map
- Backend: `/app/backend/server.py`, `.env`, seeded data inlined.
- Frontend pages: `/app/frontend/src/pages/*` and `/pages/admin/*`
- Layout: `/app/frontend/src/components/Layout/*`
- Auth context: `/app/frontend/src/contexts/AuthContext.js`
- Test creds: `/app/memory/test_credentials.md`

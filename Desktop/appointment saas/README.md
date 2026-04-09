# Appointment Booking & Scheduling System for Service Businesses

Portfolio-grade booking and operations software for service-led SMEs such as salons, clinics, consultants, wellness studios, beauty teams, and premium appointment-based businesses.

This project is positioned as a sellable proof piece rather than a toy demo. It includes a public booking flow, operational admin workspace, seeded business data, role-based views, and a believable service-business workflow built with Next.js, React, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Product summary

Atelier Reserve is a premium scheduling and business operations app that helps a service business:

- manage appointments
- assign staff
- control services and pricing
- track customer history
- manage business hours and blocked time
- monitor dashboard metrics
- run a polished public booking flow

The portfolio build also includes a cookie-backed demo mode so the UI remains interactive even when a local PostgreSQL database is not connected yet.

## Features

- Marketing-style entry page with product framing and demo entry points
- Public multi-step booking flow
- Booking summary success page
- Admin dashboard with operational metrics
- Daily and weekly calendar views
- Appointments table with filters and detail page
- Appointment status update flow
- Appointment reassignment flow
- Appointment rescheduling flow
- Customers list and detailed profile view
- Staff directory with availability overview and active/inactive toggles
- Services management with duration, price, category, and status toggles
- Availability screen for business hours, staff schedules, blocked time, and closures
- Settings screen for booking rules and notification preferences
- Role-based owner vs staff demo behavior
- Realistic seeded data for customers, staff, services, and appointments

## Tech stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- App Router
- Server actions
- Prisma ORM
- PostgreSQL

## Demo data included

- 20+ customers
- 6 staff records
- 11 services
- 40+ appointments across pending, confirmed, completed, cancelled, and no-show states
- Business hours
- Staff availability schedules
- Blocked operational time
- Closure dates

## Demo access

This portfolio build intentionally avoids full authentication complexity.

- Owner / Admin demo: use the role switcher in the `/demo` workspace
- Staff demo: switch the workspace role to `Staff member`
- Public customer flow: use `/book`

Suggested demo identities for presentation:

- Owner: `elena@atelierreserve.demo`
- Staff: `maya@atelierreserve.demo`
- Demo password story: `demo1234`

The UI does not enforce login in this proof build, but these identities help when describing the system to clients.

## Project structure

```text
.
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── book/
│   │   └── demo/
│   ├── components/
│   │   ├── booking/
│   │   ├── demo/
│   │   └── ui/
│   └── lib/
│       ├── actions.ts
│       ├── booking.ts
│       ├── data.ts
│       ├── demo-data.ts
│       ├── demo-state.ts
│       ├── prisma.ts
│       ├── types.ts
│       └── utils.ts
├── .env.example
├── package.json
└── README.md
```

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create your environment file.

```bash
cp .env.example .env
```

3. Update `DATABASE_URL` to a PostgreSQL database.

4. Generate the Prisma client.

```bash
npm run db:generate
```

5. Push the schema.

```bash
npm run db:push
```

6. Seed the demo data.

```bash
npm run db:seed
```

7. Start the app.

```bash
npm run dev
```

Open `http://localhost:3000`.

## Notes on demo mode

- With PostgreSQL configured and seeded, the app can use Prisma-backed data.
- Without a working database, the app falls back to a built-in seeded snapshot plus cookie-based demo mutations for bookings and status changes.
- This keeps the portfolio app easy to run in local demos and screenshots.

## Suggested screenshot list

1. Dashboard overview
2. Weekly appointment calendar
3. Appointments management table
4. Public booking flow
5. Customer profile page
6. Staff management page
7. Services management page
8. Availability and business hours screen
9. Settings screen

## Suggested Upwork portfolio description

Built a premium appointment booking and scheduling system for service businesses using Next.js, React, TypeScript, Tailwind CSS, Prisma, and PostgreSQL. The product includes a public booking flow, operational admin dashboard, appointment calendar, customer records, staff scheduling, service management, availability controls, and business settings. Designed as a real SME operations tool rather than a generic dashboard demo, with realistic seeded data and role-based owner/staff behavior.

## Suggested client-facing positioning

Use this project when pitching:

- custom booking platforms
- admin dashboards
- internal SME operations systems
- scheduling systems
- salon, clinic, wellness, coaching, and service-business software

## Verification checklist

- Seed the database and confirm seeded records appear across dashboard, calendar, customers, staff, and services
- Create a booking through `/book`
- Open the new appointment in `/demo/appointments`
- Change appointment status
- Reassign or reschedule an appointment
- Toggle staff and service states
- Save updated booking settings

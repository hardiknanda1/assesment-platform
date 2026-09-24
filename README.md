# Assessment Platform (MVP)

A modular-monolith Next.js app for promoting an assessment, enrolling students, and managing enrollments — built so the online assessment engine (300–400 concurrent students) can be added later without restructuring.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · shadcn/ui (Radix) · Framer Motion · Clerk · PostgreSQL · Prisma 7 · Zod 4 · Vercel-ready.

## What's included

| Area | Routes |
|---|---|
| Landing page (static, animated, responsive) | `/` |
| Auth (Clerk) | `/sign-in`, `/sign-up` |
| Enrollment form + confirmation | `/register`, `/register/confirmation/[applicationNumber]` |
| Student dashboard + assessment placeholder | `/dashboard`, `/assessment` |
| Admin: stats, enrollment list (search / filter / server-side pagination), details, status change, CSV export | `/admin`, `/admin/enrollments`, `/admin/enrollments/[id]` |

**API** (JSON; the same services back the pages and server actions):

```
GET    /api/exams                     public
GET    /api/exams/:idOrCode           public
POST   /api/enrollments               signed-in student
GET    /api/enrollments?page=&limit=&q=&examId=&status=&grade=   admin
GET    /api/enrollments/:id           owner or admin
PATCH  /api/enrollments/:id           admin  { "status": "CONFIRMED" | ... }  (audited)
GET    /api/students/me               signed-in user
GET    /api/admin/stats               admin
GET    /api/admin/enrollments/export  admin  (streamed CSV, same filters)
```

Errors are always `{ "error": { "code", "message", "details?" } }` with 401 / 403 / 404 / 409 / 422 statuses.

## Setup

Requirements: Node 20.9+, PostgreSQL 14+ (local, Docker or [Neon](https://neon.tech)), a [Clerk](https://dashboard.clerk.com) application.

```bash
npm install                      # also runs `prisma generate`
cp .env.example .env             # fill in DATABASE_URL, DIRECT_URL, Clerk keys, ADMIN_EMAILS
npm run db:deploy                # apply migrations (prisma migrate deploy)
npm run db:seed                  # seed the two sample exams (idempotent)
npm run dev                      # http://localhost:3000
```

Optional demo data for the admin panel (never in production):

```bash
SEED_DEMO_STUDENTS=60 npm run db:seed
```

### Clerk

1. Create an application (email sign-in is enough) and copy the publishable and secret keys into `.env`.
2. The sign-in/up URLs and redirects are already in `.env.example` (`/sign-in`, `/sign-up`; after sign-up → `/register`, after sign-in → `/dashboard`).
3. No webhook is needed: the local `users` row is created on the user's first authenticated request.

### Making someone an admin

Roles (`STUDENT`, `ADMIN`, `SUPER_ADMIN`) live in PostgreSQL and are the source of truth for authorization.

- **Bootstrap:** add the email to `ADMIN_EMAILS`. The user is promoted to `ADMIN` on their next sign-in, provided that email is verified in Clerk.
- **CLI:** `npm run user:role -- someone@example.com ADMIN` (the user must have signed in once).

Admin accounts can't enroll in exams; use a separate student account to test enrollment.

## Scripts

| Script | What it does |
|---|---|
| `dev` / `build` / `start` | Next.js (build runs `prisma generate` first) |
| `lint`, `typecheck` | ESLint, `tsc --noEmit` |
| `db:migrate` | `prisma migrate dev` — create a new migration after editing `schema.prisma` |
| `db:deploy` | `prisma migrate deploy` — apply migrations (CI / production) |
| `db:seed` | Seed exams (and optional demo students) |
| `db:studio` | Prisma Studio |
| `user:role` | Set a user's role |
| `test:integration` | Service-layer tests against a real DB: enrollment, duplicates, 60-way concurrency, authorization, search, pagination, export, stats |

## Architecture

Follows `architecture.md`: one Next.js modular monolith with a strict dependency direction.

```
UI (pages, components)  →  Route Handlers / Server Actions  →  Services  →  Prisma  →  PostgreSQL
```

```
prisma/
  schema.prisma                 users, students, exams, enrollments, audit_logs
  migrations/                   SQL migrations (committed)
  seed.ts
src/
  proxy.ts                      Clerk session gate (Next 16 "proxy" = middleware)
  app/
    (marketing)/                landing, /register (+ server action), confirmation
    (auth)/                     Clerk sign-in / sign-up
    (student)/                  dashboard, assessment placeholder
    admin/                      overview, enrollments list/detail (+ server action)
    api/                        enrollments, exams, students, admin
  components/
    ui/                         shadcn/ui primitives
    landing/ enrollment/ admin/ student/ auth/ shared/ brand/
  lib/
    db.ts  auth.ts  env.ts  errors.ts  api.ts  constants.ts
    validations/                Zod: EnrollmentSchema, StudentSchema, ExamSchema, list query…
    services/                   enrollment, student, exam, admin, user, audit
    utils/                      formatting, CSV, application numbers
  config/site.ts                brand name, support email, timezone
```

### Key decisions

- **Server-side authorization, three layers.** `proxy.ts` requires a session on `/dashboard`, `/register`, `/assessment` and `/admin/*` (pages redirect to sign-in; APIs return a JSON 401). Every admin page calls `requireAdmin()`, which returns a 404 for non-admins; the layout check alone isn't enough, because layouts don't re-run on client navigation. Admin service functions also take the actor and assert the role themselves, so a new route can't accidentally skip the check.
- **Application numbers** look like `FA26-000123`: the exam code plus a per-exam sequence. The number is issued inside the enrollment transaction by atomically incrementing `exams.application_seq`, whose row lock serializes issuance per exam. The result is unique and gap-free, and never comes from the client. `enrollments.application_number` is also `UNIQUE`.
- **Duplicate prevention:** a pre-check returns the existing application number, and the `UNIQUE (student_id, exam_id)` constraint handles concurrent double-submits (tested: five parallel submits produce exactly one enrollment).
- **Exams are never stored on the student.** `Student 1─* Enrollment *─1 Exam`, so a student can enroll in several exams.
- **Zod everywhere:** the same schema validates the form on the client (instant feedback) and on the server (authoritative), in both the server action and the REST route. The server also ignores any client-supplied email that doesn't match the signed-in account.
- **Admin list** uses URL-driven filters with server-side `count` + `skip/take`, and nothing beyond the current page reaches the browser. **CSV export** streams in 500-row keyset-paginated batches (memory-bounded) and neutralizes spreadsheet formula injection.
- **Audit log** records enrollment status changes and exports (actor, entity, before/after, filters).

### Extending to the assessment engine

The platform is shaped so the engine slots in without rework:

1. **Schema:** add `exam_sections`, `questions`, `question_options`, `exam_questions`, `attempts`, `attempt_answers` and `results` in a new migration (`npm run db:migrate`). `Attempt` should reference `Enrollment` (one attempt per enrollment, enforced with a unique constraint), which already ties student and exam together.
2. **Services:** add `attempt.service.ts` and `evaluation.service.ts` next to the existing ones. Start and submit are durable Postgres transactions, with a server-owned `started_at` / `deadline_at` for the timer and idempotent submit (unique constraint plus status check). Scoring runs only on the server.
3. **UI/API:** `/assessment` already exists behind auth. Add `POST /api/exams/:id/start`, `PATCH /api/attempts/:id/answers` (batched auto-save) and `POST /api/attempts/:id/submit`.
4. **Scale for 300–400 concurrent students:** use Neon's pooled `DATABASE_URL` and keep `DATABASE_POOL_MAX` small per instance. Batch answer auto-saves (for example every 10–15 s, or on navigation) rather than writing per click. Add Redis (Upstash) for rate limiting and hot session state only if load testing shows it's needed.

## Deploying to Vercel + Neon

1. Create a Neon database. Set `DATABASE_URL` to the **pooled** connection string and `DIRECT_URL` to the **direct** one.
2. Import the repo in Vercel and add every variable from `.env.example`, using production Clerk keys.
3. Run migrations as part of deploy, either with the build command `npm run db:deploy && npm run build` or from CI. Seed once with `npm run db:seed`.

## Not in this MVP

- **Rate limiting:** architecture §15 lists it. Add Upstash Redis or Vercel's WAF before public launch, especially on `POST /api/enrollments`.
- **Not wired up yet:** Sentry, PostHog, S3 uploads, and an admin UI for creating and editing exams (exams come from `prisma/seed.ts` for now).
- **Placeholder copy:** the brand name ("EduAssess"), sample exams and landing-page copy are placeholders. Rename in `src/config/site.ts` and `prisma/seed.ts`.

# EduFlow

> A modern, production-grade Learning Management System (LMS) inspired by Udemy.
> Instructors create rich video courses; students browse, enroll, watch, and track their progress.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

---

## Tech Stack

- **Framework** · Next.js 16 (App Router, Server Components, Server Actions)
- **Language** · TypeScript (strict)
- **Database** · PostgreSQL (Neon) + Prisma 7
- **Auth** · Auth.js v5 with the Prisma adapter (database sessions)
- **Storage** · Cloudinary (signed direct uploads — bytes never touch our server)
- **UI** · Tailwind CSS v4 + shadcn/ui (`base-nova` preset)
- **Forms** · React Hook Form + Zod (schemas shared with server actions)
- **Tooling** · ESLint 9 (flat config) + Prettier 3 + `@t3-oss/env-nextjs` (typed env)
- **Deployment** · Vercel

---

## Quick Start

### 1. Prerequisites

- **Node.js ≥ 20** (`node --version`)
- **npm ≥ 10**
- **PostgreSQL** — easiest is a free [Neon](https://neon.tech) database (takes 1 minute to create)
- **Cloudinary** account — [create one free](https://cloudinary.com/users/register/free)

### 2. Install

```bash
git clone <your-fork-url>
cd eduflow
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Then fill in the values in `.env.local`. See [Environment Variables](#environment-variables) below.

Generate an `AUTH_SECRET`:

```bash
# any of these works:
openssl rand -base64 32
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Set up the database

```bash
npm run db:generate     # generate the Prisma client
npm run db:push         # push the schema to your database (dev only — use migrate in prod)
npm run db:seed         # populate with realistic demo data
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

All variables are validated by [`src/lib/env.ts`](./src/lib/env.ts) using Zod. **The app refuses to start if anything required is missing or malformed.**

| Variable                                | Required | Notes                                                |
| --------------------------------------- | :------: | ---------------------------------------------------- |
| `DATABASE_URL`                          |    ✅    | PostgreSQL connection string (use Neon's pooled URL) |
| `AUTH_SECRET`                           |    ✅    | ≥ 32 chars; `openssl rand -base64 32`                |
| `AUTH_URL`                              |   prod   | Full deployed URL (e.g., `https://eduflow.app`)      |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | optional | Google OAuth — added in Step 3                       |
| `CLOUDINARY_API_KEY`                    |    ✅    | Cloudinary console → API Keys                        |
| `CLOUDINARY_API_SECRET`                 |    ✅    | Cloudinary console → API Keys                        |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`     |    ✅    | Cloudinary console → top-left                        |
| `NEXT_PUBLIC_APP_URL`                   |    ✅    | `http://localhost:3000` in dev                       |

See [`.env.example`](./.env.example) for the full template.

---

## Scripts

| Command                | What it does                                     |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Start the Next.js dev server (with Turbopack)    |
| `npm run build`        | Production build                                 |
| `npm run start`        | Run the production build                         |
| `npm run lint`         | ESLint over the project                          |
| `npm run lint:fix`     | ESLint with autofix                              |
| `npm run format`       | Prettier write across all source files           |
| `npm run format:check` | Prettier check (CI-friendly)                     |
| `npm run typecheck`    | Run `tsc --noEmit`                               |
| `npm run db:generate`  | Generate the Prisma client                       |
| `npm run db:push`      | Push schema to DB without a migration (dev only) |
| `npm run db:migrate`   | Create + apply a new migration                   |
| `npm run db:reset`     | Drop everything, re-apply migrations, re-seed    |
| `npm run db:studio`    | Open Prisma Studio (GUI for your DB)             |
| `npm run db:seed`      | Run `prisma/seed.ts` (realistic demo data)       |

---

## Project Architecture

```
src/
├── app/             ← Next.js App Router (routes, layouts, server actions)
├── components/
│   ├── ui/          ← shadcn primitives
│   └── shared/      ← cross-feature composites
├── features/        ← feature-based domains (courses, chapters, auth, …)
│   └── <feature>/
│       ├── components/    ← UI exclusive to this feature
│       ├── actions/       ← server actions (mutations)
│       ├── queries/       ← server-side data fetchers
│       ├── hooks/         ← client-side hooks
│       ├── validations/   ← Zod schemas
│       └── types/         ← TS types
├── lib/             ← db, env, auth, cloudinary, utils
├── hooks/           ← global hooks
├── providers/       ← theme + sonner provider tree
├── config/          ← site config, navigation
├── types/           ← global ambient types
└── generated/       ← Prisma client (gitignored)
```

### Key principles

- **Server Components by default**, opt into client only for interactivity.
- **Server actions** for mutations from our own React tree; **`/app/api/*`** for webhooks & external clients.
- **Zod schemas** are the single contract shared by React Hook Form and server actions.
- **Defense in depth**: middleware → server re-check → conditional UI.
- **Signed direct uploads** — file bytes never proxy through our server.

For the full architectural breakdown, decisions log, and roadmap, see **[`docs/project-context.md`](./docs/project-context.md)** — the single source of truth for the project.

---

## Roadmap

| Phase | Focus                                               |
| ----- | --------------------------------------------------- |
| 1     | Foundation, database schema, authentication         |
| 2     | Public landing, course browsing, single course page |
| 3     | Instructor dashboard, course CRUD, video uploads    |
| 4     | Student library, video player, progress tracking    |
| 5     | Reviews, quizzes, certificates, admin               |
| 6     | Performance, security, testing                      |
| 7     | Stripe payments                                     |
| 8     | Production deployment, monitoring, error tracking   |



---

## License

TBD.

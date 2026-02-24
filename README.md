# ApexDaily : Advanced Todo & High-Performance Workspace Platform

 **ApexDaily** (Advanced Todo) is a sophisticated, full-stack productivity platform engineered for teams and individuals who demand more than a simple task list. By unifying workspace collaboration, project management, and a strict-consistency habit tracker into a single, cohesive dark UI, AdvTD is designed to be the only productivity tool you'll need.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Database Schema](#database-schema)
6. [Repository Structure](#repository-structure)
7. [Quick Start](#quick-start)
8. [Environment Variables](#environment-variables)
9. [Prisma & Database Setup](#prisma--database-setup)
10. [Development Scripts](#development-scripts)
11. [Deployment](#deployment)
12. [Contributing](#contributing)
13. [License](#license)

---

## Overview

AdvTD is built on **Next.js 16** with the **App Router** and **Turbopack**, delivering fast, server-rendered pages alongside highly interactive client components. The platform is architected around three core pillars:

- **Workspace Collaboration** — Manage multiple workspaces, each with their own projects, tasks, and members.
- **Project Management** — Create and manage projects using templates or from scratch, with full task lifecycle tracking.
- **Habit & Consistency Tracking** — A personal, workspace-independent habit tracker that enforces daily accountability with a strict-today-only toggle.

The UI is built with a high-end dark aesthetic using **Tailwind CSS** and **Lucide React** icons, prioritizing clarity and flow for power users.

---

## Features

### 🗓️ Habit Tracker
A dynamic, visual habit grid that auto-generates the **current month's calendar** using `date-fns`. Each cell represents a day, and users can see their completion history at a glance. The grid is rendered as a Client Component for real-time interactivity while data is fetched server-side for performance.

- Color-coded cells for completed, skipped, and pending days.
- Summary statistics (streak count, monthly completion rate) displayed alongside the grid.
- Smooth transitions and hover states for a premium feel.

### 🔒 Strict-Today Toggle
A core integrity feature of the Consistency Tracker. When enabled, the Strict-Today Toggle **prevents users from retroactively marking habits as completed for past dates**. This enforces genuine consistency rather than allowing users to fill in missed days after the fact.

- Toggle state is persisted per-user in the database.
- Visual indicator clearly communicates the current mode (strict vs. flexible).
- Server Actions validate the date server-side to prevent client-side bypassing.

### 🏢 Workspace Collaboration
Organize all your work into **distinct workspaces** — for example, one for a client project, one for your startup, and one for personal tasks. Each workspace is a fully isolated environment with its own projects and member list.

- **Member Management** — Invite collaborators to a workspace.
- **Role-based Access** — Owners can manage members; members can interact with projects and tasks.
- **Workspace Switcher** — A fast, accessible dropdown in the sidebar to jump between workspaces instantly.

### 📋 Project Templates
Speed up project creation with a built-in **template engine**. Instead of starting from scratch, choose a template that pre-populates your project with the right structure.

Available templates include:
- **Task Tracker** — A standard to-do list structure with status columns (To Do, In Progress, Done).
- **Content Calendar** — Pre-structured for content teams, with fields for publish dates, platforms, and assignees.
- **Sprint Board** — An agile-friendly layout for engineering teams.
- **Custom** — Start with a blank project and define your own structure.

### 🔧 Modern, State-Managed Sidebar
The sidebar is a fully custom, **collapsible navigation component** built with React state.

- **Icon-only mode** — When collapsed, the sidebar shows only icons with rich **tooltip labels** on hover, preserving screen real estate without sacrificing navigability.
- **Modal Triggers** — The sidebar controls global application modals (e.g., "New Project", "Invite Member") via **state hoisting** to the root layout, ensuring modals are accessible from anywhere in the app.
- **Active State Indicators** — The current page/workspace is visually highlighted.

### ⚡ Server Actions & Real-Time Mutations
All data mutations (creating a habit, toggling a log, adding a task) are handled by **Next.js Server Actions**, which run securely on the server and communicate directly with Supabase via Prisma. This eliminates the need for a separate REST or GraphQL API layer for CRUD operations.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router + Turbopack) | SSR, routing, Server Actions |
| **Language** | TypeScript | End-to-end type safety |
| **Database** | Supabase (PostgreSQL) | Hosted relational database |
| **ORM** | Prisma | Type-safe database client and schema management |
| **Authentication** | NextAuth.js | Session management, OAuth & credentials support |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Icons** | Lucide React | Consistent, clean icon set |
| **Date Handling** | date-fns | Lightweight date utilities for the Consistency Grid |
| **Build Tool** | Turbopack | Fast incremental bundling for development |
| **Caching** | Redis | Server-side caching and rate limiting |

---

## Architecture Overview

### Frontend

The UI is composed of two complementary rendering strategies:

- **React Server Components (RSC)** — Used for pages and data-heavy sections (e.g., the dashboard overview, project lists). Data is fetched directly from the database on the server, with zero client-side loading spinners for initial page loads.
- **Client Components** — Used for interactive elements that require state, such as the Consistency Grid, the collapsible Sidebar, and modal dialogs. These are clearly marked with `"use client"` and kept as leaf nodes in the component tree to minimize client-side JavaScript.

**State Hoisting** is used in `layout.tsx` to manage global modal visibility. Modal state (open/closed, which modal is active) lives in the root layout and is passed down to both the Sidebar (which triggers modals) and the Modal components themselves (which consume the state). This avoids the need for a heavy global state library like Redux for this use case.

### Backend

The backend is entirely serverless, hosted on Vercel and powered by:

- **Next.js Server Actions** (`/app/actions/`) — Handle all write operations for habits, tasks, templates, and workspaces. Each action validates the user's session via NextAuth, performs the mutation with Prisma, and revalidates the relevant Next.js cache path.
- **API Route Handlers** (`/app/api/`) — Dedicated REST endpoints organized by domain: `activity`, `auth`, `dashboard`, `habit`, `register`, `tasks`, `workload`, and `workspaces`. These serve data to Client Components that cannot use Server Actions directly.
- **Reusable Query Helpers** (`/lib/queries/`) — Encapsulated Prisma query functions shared across Server Actions and API routes to keep data access logic DRY and testable.
- **Redis** (`/lib/redis.ts`) — Used for caching frequently-read data (e.g., workspace lists, dashboard stats) and optionally for rate limiting API routes.
- **NextAuth.js** (`/app/api/auth/`) — Manages authentication. The session token is used in Server Actions and API routes to identify the current user and ensure they can only access or mutate their own data.
- **Global Providers** (`/app/providers.tsx`) — Wraps the application in necessary React context providers (e.g., NextAuth `SessionProvider`, theme, toast notifications) at the root level.

---

## Database Schema

The Supabase PostgreSQL database is managed entirely through Prisma. Below is a description of the core models defined in `/prisma/schema.prisma`.

### `User`
Stores user profiles and is the anchor for authentication.

| Field | Type | Description |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `name` | String? | Display name |
| `email` | String | Unique, used for login |
| `emailVerified` | DateTime? | For email verification flows |
| `image` | String? | Avatar URL |
| `habits` | Habit[] | Relation to user's habits |
| `workspaces` | WorkspaceMember[] | Relation to workspace memberships |

### `Workspace`
A top-level organizational unit. Projects and members live inside a workspace.

| Field | Type | Description |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `name` | String | Display name |
| `ownerId` | String | FK → User |
| `members` | WorkspaceMember[] | Members of this workspace |
| `projects` | Project[] | Projects in this workspace |

### `Project`
Represents a project within a workspace. Can be created from a template.

| Field | Type | Description |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `name` | String | Project name |
| `template` | String? | Template key used (e.g., `"task-tracker"`) |
| `workspaceId` | String | FK → Workspace |
| `tasks` | Task[] | Tasks belonging to this project |

### `Task`
An individual unit of work within a project.

| Field | Type | Description |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `title` | String | Task title |
| `status` | String | e.g., `"todo"`, `"in-progress"`, `"done"` |
| `projectId` | String | FK → Project |
| `assigneeId` | String? | FK → User (optional) |

### `Habit`
User-specific habits that are **decoupled from workspaces**, allowing personal tracking regardless of which workspace a user is in.

| Field | Type | Description |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `name` | String | Habit description (e.g., "Read 30 minutes") |
| `userId` | String | FK → User |
| `logs` | HabitLog[] | Daily completion records |

### `HabitLog`
Records a single completion event for a habit on a given date. A **unique constraint** on `(habitId, date)` ensures only one log per habit per day, enforcing data integrity at the database level.

| Field | Type | Description |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `habitId` | String | FK → Habit |
| `date` | DateTime | The date of completion (normalized to midnight UTC) |
| `completed` | Boolean | Whether the habit was completed |

---

## Repository Structure

```
/adv-todo
├── /app
│   ├── /(auth)                        # Auth route group (login, register pages)
│   │
│   ├── /(dashboard)                   # Dashboard route group (protected)
│   │   ├── /dashboard
│   │   │   ├── /dailyroutine          # Daily routine planner page
│   │   │   ├── /overview              # Main dashboard landing page (RSC)
│   │   │   ├── /project               # Project detail page
│   │   │   ├── /settings              # User/workspace settings page
│   │   │   ├── /tasks                 # Tasks list/board page
│   │   │   └── /workspaces            # Workspace management page
│   │   ├── page.tsx                   # Dashboard index page
│   │   └── layout.tsx                 # Dashboard layout (Sidebar + modal state)
│   │
│   ├── /actions                       # Next.js Server Actions (mutations)
│   │   ├── habits.ts                  # createHabit, toggleHabitLog, deleteHabit
│   │   ├── task.ts                    # createTask, updateTaskStatus, deleteTask
│   │   ├── template.ts                # createProjectFromTemplate
│   │   └── workspace.ts               # createWorkspace, inviteMember, etc.
│   │
│   ├── /api                           # API Route Handlers
│   │   ├── /activity                  # Activity feed endpoints
│   │   ├── /auth                      # NextAuth.js [...nextauth] route handler
│   │   ├── /dashboard                 # Dashboard-specific data endpoints
│   │   ├── /habit                     # Habit REST endpoints
│   │   ├── /register                  # User registration endpoint
│   │   ├── /tasks                     # Task REST endpoints
│   │   ├── /workload                  # Workload/analytics endpoints
│   │   └── /workspaces                # Workspace REST endpoints
│   │
│   └── /generated                     # Auto-generated files (do not edit manually)
│
├── /components
│   ├── /activity                      # Activity feed components
│   ├── /dashboard                     # Sidebar, workspace switcher, overview widgets
│   ├── /habit                         # Habit grid, habit row, strict-today toggle
│   ├── /layout                        # Shared layout wrappers and shell components
│   ├── /projects                      # Project cards, project creation modal
│   ├── /tasks                         # Task list, task creation/edit modals
│   ├── /team                          # Team member display and invite UI
│   └── /workspace                     # Workspace switcher and management UI
│
├── /hooks
│   ├── use-task-details.ts            # Custom hook for task detail state/fetching
│   └── use-user.ts                    # Custom hook for current user session data
│
├── /lib
│   ├── /queries                       # Reusable database query helpers
│   ├── auth.ts                        # NextAuth configuration and options
│   ├── prisma.ts                      # Prisma Client singleton
│   ├── redis.ts                       # Redis client (caching / rate limiting)
│   ├── templates.ts                   # Project template definitions and engine
│   └── utils.ts                       # Shared utility functions (cn, formatDate, etc.)
│
├── /prisma
│   └── schema.prisma                  # Prisma schema: all models and relations
│
├── /public                            # Static assets (favicon.ico, og-image, etc.)
├── /store                             # Client-side state store (Zustand or similar)
├── /styles                            # Global CSS overrides and custom styles
│
├── favicon.ico                        # App favicon
├── globals.css                        # Global Tailwind CSS base styles
├── layout.tsx                         # Root app layout
├── page.tsx                           # Public landing / login redirect
├── providers.tsx                      # Global React context providers wrapper
│
├── .env                               # Local environment variables (gitignored)
├── .gitignore                         # Git ignore rules
└── node_modules/                      # Installed dependencies (gitignored)
```

---

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed and configured:

- **Node.js** v18.0.0 or higher (`node --version` to check)
- **npm** v9+ or **pnpm** v8+
- A **Supabase** project — create one for free at [supabase.com](https://supabase.com). You will need the database connection string from your project's settings.

### 1. Clone the Repository

```bash
git clone https://github.com/niraaj/adv-todo.git
cd adv-todo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project by copying the example:

```bash
cp .env.example .env
```

Then open `.env` and fill in your values. See the [Environment Variables](#environment-variables) section below for a full reference.

### 4. Initialize the Database

Generate the Prisma Client and push the schema to your Supabase database:

```bash
# Generate the Prisma Client types
npx prisma generate

# Push the schema to your Supabase PostgreSQL instance
npx prisma db push
```

> **Note:** `prisma db push` is recommended for development and initial setup. For production or when managing migrations in a team, consider using `prisma migrate dev` to create versioned migration files.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will hot-reload on file changes thanks to Turbopack.

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# -----------------------------------------------
# DATABASE (Supabase)
# -----------------------------------------------
# Found in: Supabase Dashboard → Project → Settings → Database → Connection String (URI)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"

# -----------------------------------------------
# AUTHENTICATION (NextAuth.js)
# -----------------------------------------------
# A random, secret string used to sign session tokens.
# Generate one with: openssl rand -base64 32
NEXTAUTH_SECRET="your-randomly-generated-secret-here"

# The canonical URL of your application.
# In development, this is always http://localhost:3000
# In production, this should be your deployed URL (e.g., https://adv-todo.vercel.app)
NEXTAUTH_URL="http://localhost:3000"
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string from Supabase |
| `NEXTAUTH_SECRET` | ✅ Yes | Secret for signing JWTs and session tokens |
| `NEXTAUTH_URL` | ✅ Yes | Canonical URL of the app (for OAuth callbacks) |

---

## Prisma & Database Setup

### Supabase Connection Compatibility

Supabase uses a connection pooler (PgBouncer) on port `6543`, but Prisma requires a **direct connection** for migrations and schema pushes. Always use port **`5432`** in your `DATABASE_URL` for Prisma.

```
# ✅ Correct — Direct connection on port 5432
DATABASE_URL="postgresql://postgres:[pass]@db.[id].supabase.co:5432/postgres"

# ❌ Incorrect — Pooled connection on port 6543 (breaks Prisma migrations)
DATABASE_URL="postgresql://postgres:[pass]@db.[id].supabase.co:6543/postgres"
```

### Generating the Prisma Client

After any change to `prisma/schema.prisma`, you must regenerate the client:

```bash
npx prisma generate
```

### Viewing Your Data

Prisma Studio provides a visual browser for your database tables, useful for debugging:

```bash
npx prisma studio
```

---

## Development Scripts

All scripts are defined in `package.json` and run with `npm run <script>`.

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev --turbopack` | Start the development server with Turbopack |
| `build` | `next build` | Create a production build |
| `start` | `next start` | Start the production server |
| `lint` | `next lint` | Run ESLint across the project |
| `db:push` | `prisma db push` | Push schema changes to the database |
| `db:generate` | `prisma generate` | Re-generate the Prisma Client |
| `db:studio` | `prisma studio` | Open Prisma Studio |

---

## Deployment

AdvTD is optimized for deployment on **Vercel**.

### Deploy to Vercel

1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/new).
3. In the Vercel project settings, add all required **Environment Variables** from your `.env` file.
4. Set `NEXTAUTH_URL` to your Vercel deployment URL (e.g., `https://your-app.vercel.app`).
5. Deploy. Vercel will automatically run `npm run build` on each push to your main branch.

> **Important:** After deploying, copy your production URL and update `NEXTAUTH_URL` in Vercel's environment variable settings, then trigger a redeploy for the change to take effect.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit with a descriptive message: `git commit -m "feat: add X feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against the `main` branch with a clear description of your changes.

Please ensure your code passes linting (`npm run lint`) before submitting.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

*Created by **Niraaj** for **Verito Studio**.*

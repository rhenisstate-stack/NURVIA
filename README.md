# NURVIA — Your Path to Nursing Confidence

> **NURVIA** is a comprehensive, independent nursing education and exam-preparation platform designed for nursing learners preparing for ATI, HESI, course examinations, and NCLEX-RN / NCLEX-PN licensure.

---

## 1. Product & Architecture Overview

NURVIA is built with an independent architecture that decouples exam discovery, learning delivery, curriculum authoring, and analytics into a cohesive platform:

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide icons.
- **Backend API**: ASP.NET Core 8 Web API, Entity Framework Core, modular Clean Architecture (`Nurvia.Api`, `Nurvia.Application`, `Nurvia.Domain`, `Nurvia.Infrastructure`).
- **Database**: PostgreSQL 16 (configured via `docker-compose.yml`).
- **Design System**: NURVIA Design Tokens (Midnight Navy `#142B4A`, Intelligent Teal `#0D9488`, Deep Navy `#0B1D33`, Soft Cloud `#F4F7F9`), light/dark themes, accessible WCAG 2.2 AA contrast.

---

## 2. Monorepo Structure

```text
NURVIA/
├── apps/
│   ├── api/                           # ASP.NET Core Solution
│   │   ├── Nurvia.slnx                # Solution file
│   │   ├── Nurvia.Api/                # Web API, Controllers, Minimal APIs, Swagger
│   │   ├── Nurvia.Application/        # Use cases, DTOs, interfaces
│   │   ├── Nurvia.Domain/             # Entities, aggregates, value objects
│   │   └── Nurvia.Infrastructure/     # EF Core DbContext, PostgreSQL persistence
│   └── web/                           # Next.js App Router Web Application
│       ├── app/
│       │   ├── page.tsx               # Public Marketing & Exam Discovery Homepage
│       │   ├── learner/page.tsx       # Learner Workspace & Progress Dashboard
│       │   ├── exam-session/page.tsx  # Distraction-Free Exam Engine Experience
│       │   ├── admin/page.tsx         # Curriculum Studio & Question Bank Admin
│       │   ├── design-system/page.tsx # Design System Showcase & Component Verification
│       │   ├── layout.tsx             # Root layout with font and metadata
│       │   ├── not-found.tsx          # Custom 404 page
│       │   └── globals.css            # NURVIA CSS design tokens (Light/Dark)
│       ├── components/
│       │   ├── brand/logo.tsx         # Scalable Geometric Learning Path Vector Logo
│       │   ├── layout/
│       │   │   ├── public-shell.tsx   # Public website header, navigation & footer
│       │   │   ├── learner-shell.tsx  # Responsive learner sidebar & topbar
│       │   │   ├── exam-shell.tsx     # Low-distraction clinical exam shell
│       │   │   └── admin-shell.tsx    # High-density management console shell
│       │   └── ui/                    # Primitive & composite components (Button, Badge, Card, etc.)
│       └── public/
│           └── brand/                 # SVG vector brand assets (Light, Dark, Monochrome)
├── docker-compose.yml                 # PostgreSQL 16 container definition
└── README.md
```

---

## 3. Brand Identity & Visual System

- **Brand Name**: NURVIA
- **Slogan**: *Your Path to Nursing Confidence.*
- **Core Symbol**: The Geometric Learning Path (rising progression towards clinical mastery).
- **Core Palette**:
  - `Midnight Navy` (`#142B4A`): Brand anchor, navigation, high-contrast headings.
  - `Intelligent Teal` (`#0D9488`): Primary actions, active progress, interactive focus.
  - `Deep Navy` (`#0B1D33`): Dark theme surfaces, admin workspace shell.
  - `Soft Cloud` (`#F4F7F9`): Main application light background canvas.
  - `Slate` (`#64748B`): Secondary text and metadata.

---

## 4. Application Shells Implemented

1. **Public Website Shell (`PublicShell`)**:
   - Header with vector logo, desktop/mobile drawer navigation, theme toggle, and CTAs.
   - Comprehensive footer with tracks, resources, and educational disclaimer.
2. **Learner Dashboard Shell (`LearnerShell`)**:
   - Collapsible desktop sidebar (264px / 76px) and mobile drawer.
   - Modules: Overview, Exam Preparation, Study Resources, Personalized Learning, Account.
   - Top bar with global search, 7-day study streak indicator, notifications, and profile.
3. **Exam Experience Shell (`ExamShell`)**:
   - Distraction-free layout without extraneous marketing elements.
   - Autorun countdown timer with pause/resume, question progress bar, and dosage calculator modal.
   - Split view supporting EHR Clinical Exhibits (Notes, Vitals, Labs, Orders) and NGN items.
4. **Administrative Console Shell (`AdminShell`)**:
   - High-density dark sidebar for curriculum authors and reviewers.
   - Question Bank lifecycle management (Draft, Validation, Review, Approved, Published, Archived).

---

## 5. Getting Started

### 1. Database (PostgreSQL 16)
Start the PostgreSQL container:
```bash
docker-compose up -d
```

### 2. Backend API (.NET 8 / 10)
Run the ASP.NET Core Web API:
```bash
dotnet run --project apps/api/Nurvia.Api/Nurvia.Api.csproj
```
Swagger UI will be accessible at: `http://localhost:5000/swagger` (or `https://localhost:5001/swagger`).

### 3. Frontend Web Application (Next.js)
Run the Next.js development server:
```bash
cd apps/web
npm run dev
```
Access the application at: `http://localhost:3000`

### Interactive Routes
- **Public Homepage**: [http://localhost:3000/](http://localhost:3000/)
- **Learner Dashboard**: [http://localhost:3000/learner](http://localhost:3000/learner)
- **Exam Session Engine**: [http://localhost:3000/exam-session](http://localhost:3000/exam-session)
- **Design System Showcase**: [http://localhost:3000/design-system](http://localhost:3000/design-system)
- **Curriculum Admin Studio**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 6. Phase 1 Verification & Quality Gates

- [x] Brand vectors designed in SVG (Symbol, Full Lockup, Dark Lockup, Monochrome, Favicon).
- [x] Design tokens configured via CSS variables and mapped into Tailwind CSS.
- [x] Light mode default + Dark mode support with persistence.
- [x] Reusable UI components (`Button`, `Badge`, `Card`, `Input`, `Progress`, `ThemeToggle`, `Logo`).
- [x] Four dedicated application shells implemented (`PublicShell`, `LearnerShell`, `ExamShell`, `AdminShell`).
- [x] Next.js production build verified (`next build` succeeds with 0 errors).
- [x] .NET modular architecture compiled (`Nurvia.Domain`, `Nurvia.Application`, `Nurvia.Infrastructure`, `Nurvia.Api` build with 0 warnings/errors).

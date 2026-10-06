<div align="center">

# Personal Site by Pabitra Mohan Singh

**Personal site and guestbook built with Astro, Tailwind CSS, and TypeScript.**

[![Astro](https://img.shields.io/badge/Astro-7.x-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

## Features

- **Dark / Light Theme** – client-side toggle with local storage persistence
- **Background Music Player** – autoplay on first interaction, persists across navigation
- **Guestbook** – OAuth sign-in via Google, AI-moderated messages, auto-pruned storage
- **Server-Side Rendering** – Astro server output on Cloudflare Workers
- **AI Moderation** – Llama Guard 3 scans every message before it reaches the database
- **D1 Database** – persistent storage with Drizzle ORM migrations
- **SEO Optimized** – meta tags, Open Graph, semantic HTML5
- **Fully Responsive** – mobile-first layout with Tailwind CSS
- **Accessible** – semantic landmarks, heading hierarchy, skip-to-main-content link
- **TypeScript** – end-to-end strict type checking
- **Modular CSS Architecture** – cascade layers with tokens, base, components, and animations

---

## Technology Stack

- Astro 7 (server output)
- Tailwind CSS 4
- TypeScript 7
- Cloudflare Workers
- Cloudflare D1 (SQLite)
- Cloudflare KV (sessions)
- Cloudflare AI (Llama Guard 3 moderation)
- Better Auth (OAuth)
- Drizzle ORM
- Vite (bundled with Astro)
- PNPM

---

## Architecture Overview

The codebase follows a feature-based architecture designed for clarity and maintainability.

### Core Layers

- **`src/core/`** – Shared infrastructure (auth, database)
- **`src/shared/`** – Reusable UI, SEO, scripts, and styles used across the site
- **`src/features/`** – Self-contained feature modules (home, guestbook)
- **`src/layouts/`** – Page shell (`BaseLayout.astro`)
- **`src/pages/`** – Route definitions and API endpoints
- **`src/styles/`** – Global design tokens, base styles, and animation utilities
- **`src/db/`** – Drizzle schema and database client

### Dependency Flow

```text
pages → layouts → features → shared → core → db
```

- Pages import from layouts, features, and shared
- Features import from shared and core
- Shared imports from core
- Core imports from db

This hierarchy prevents circular dependencies and keeps the codebase predictable.

### Feature Module Structure

```text
features/<name>/
├── components/     # Astro components
├── scripts/        # Client-side behavior
└── styles/         # Feature-scoped CSS (when needed)
```

---

## Getting Started

### Prerequisites

- Node.js 22.x
- PNPM 10.x
- Cloudflare account (for deployment)
- Google OAuth credentials (for guestbook sign-in)

### Installation

```bash
git clone https://github.com/thepabitrams/itspabitramohansingh.git
cd itspabitramohansingh
pnpm install
```

### Local Environment

Create `.dev.vars` at the project root:

```env
BETTER_AUTH_SECRET=<your-secret>
BETTER_AUTH_URL=http://localhost:8787
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

`.dev.vars` is gitignored. Never commit it.

### Database Setup

Generate and apply Drizzle migrations locally:

```bash
npx drizzle-kit generate
npx wrangler d1 migrations apply guestbook-db --local
```

### Development

Start the dev server:

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
```

### Manual Deploy

```bash
pnpm build
npx wrangler deploy
```

---

## Deployment

Production deployment is automated via Cloudflare Workers Builds.

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `pnpm run build` |
| Deploy command | `npx wrangler deploy` |
| Preview command | `npx wrangler versions upload` |

Push to `main` triggers a production deploy to `its.pabitramohansingh.workers.dev`. Pushes to any other branch create preview versions.

### Required Secrets

Set once via Wrangler:

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

### Cloudflare Bindings

Configured in `wrangler.jsonc`:

- DB – D1 database (guestbook-db)
- SESSION – KV namespace (auto-provisioned)
- AI – Workers AI binding
- IMAGES – Cloudflare Images binding
- ASSETS – Static asset binding

---

## Folder Structure

```text
src/
├── core/                # Shared infrastructure
├── db/                  # Drizzle schema and client
├── features/            # Feature modules
├── layouts/             # Page shell
├── pages/               # Routes and API endpoints
├── shared/              # Reusable UI and utilities
└── styles/              # Modular CSS architecture

public/                  # Static assets
astro.config.mjs         # Astro configuration
wrangler.jsonc           # Cloudflare Workers configuration
drizzle.config.ts        # Drizzle ORM configuration
tsconfig.json            # TypeScript configuration
package.json             # Project manifest
```

---

## Contributing

Issues and PRs are welcome. See [AGENTS.md](./AGENTS.md) for AI agent instructions.

---

## License

This project is licensed under the [MIT License](./LICENSE). See [LICENSES](./LICENSES/) for third-party attributions.

---

## Documentation

- [CSS Architecture](./src/styles/README.md) – Design system, cascade layers, and usage guidelines
- [AGENTS.md](./AGENTS.md) – Instructions for AI coding agents working on this project

---

## Acknowledgements

Built with Astro, Tailwind CSS, and TypeScript. Built with a modular, scalable architecture for maintainability and developer experience.

---

<div align="center">

**Made by [Pabitra Mohan Singh](https://www.linkedin.com/in/pabitramohansingh)**

</div>
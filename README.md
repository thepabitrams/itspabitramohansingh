
<div align="center">

# Portfolio Website by Pabitra Mohan Singh

**A modern, performant personal portfolio built with Astro, Tailwind CSS, and TypeScript to showcase my skills, experience, and projects.**

[![Astro](https://img.shields.io/badge/Astro-5.x-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

*Single source of truth for design tokens, component patterns, and motion.*

</div>

---

## Features

- Dark / Light Theme – client-side toggle with local storage persistence
- MDX Content Collections – project pages with Zod-validated frontmatter
- Static Site Generation – fully pre-rendered HTML, zero client-side JavaScript by default
- SEO Optimized – meta tags, Open Graph, semantic HTML5
- Fully Responsive – mobile-first layout with Tailwind CSS
- Blazing Fast – inline critical CSS, HTML compression, no render-blocking scripts
- Accessible – semantic landmarks, heading hierarchy, skip-to-main-content link
- TypeScript – end-to-end static type checking
- Modular CSS Architecture – cascade layers with tokens, base, components, and animations

---

## Technology Stack

- Astro 7
- Tailwind CSS 4
- TypeScript 5
- Vite (bundled with Astro)
- PNPM

---

## Architecture Overview

The codebase follows a component-based architecture designed for clarity and maintainability.

### Core Layers

- **Pages** – Route definitions (`index.astro`)
- **Layouts** – Page shells and shared layout pieces (BaseLayout.astro, Header.astro, Footer.astro)
- **Components** – Reusable UI pieces (home, ui, interactive, seo)
- **Styles** – Modular CSS architecture (tokens, base, components, animations)
- **Types** – TypeScript type definitions

### Dependency Flow

```text
Pages → Layouts → Components → Styles 
```

- Pages import from Layouts, Components
- Layouts import from Components and Styles
- Components import from Styles
- Types has no dependencies

This hierarchy prevents circular dependencies and keeps the codebase predictable.

---

## Getting Started

### Prerequisites
 Node.js 22.12.0 or later
 PNPM 9.0 or later

### Installation

```bash
git clone https://github.com/thepabitrams/itspabitramohansingh.git
cd itspabitramohansingh
pnpm install
```

### Development

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```
---

## Folder Structure
```text
   src/
    ├── components/   # Reusable Astro UI components
    ├── layouts/      # Page layout wrappers
    ├── pages/        # Route definitions (home)
    └── styles/       # Modular CSS architecture (tokens, base, components, animations)
```
---

## Documentation

- [CSS Architecture](./src/styles/README.md) – Design system, cascade layers, and usage guidelines
- [Third-Party Licenses](./THIRD-PARTY/) – Full license texts for all dependencies
- [NOTICE](./NOTICE) – Attribution for third-party software

---

## Acknowledgements

Built with Astro, Tailwind CSS, and TypeScript. Built with a modular, scalable architecture for maintainability and developer experience.

See the [NOTICE](./NOTICE) file and [THIRD-PARTY](./THIRD-PARTY/) folder for full attribution.


---

<div align="center">

**Made by [Pabitra Mohan Singh](https://www.linkedin.com/in/pabitramohansingh)**

</div>
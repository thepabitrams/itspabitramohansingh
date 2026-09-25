<div align="center">

# CSS Architecture

**A modular, cascade-layer-driven styling system built on Tailwind CSS v4.**

[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Astro](https://img.shields.io/badge/Astro-5.x-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](../../LICENSE)

---

*Single source of truth for design tokens, component patterns, and motion.*

</div>

---

## Table of Contents

- [Overview](#overview)
- [Why Modular Architecture?](#why-modular-architecture)
- [File Structure](#file-structure)
- [File Reference](#file-reference)
- [Layer Order & Cascade](#layer-order--cascade)
- [Usage Guidelines](#usage-guidelines)
- [Design Tokens](#design-tokens)
- [Adding New Styles](#adding-new-styles)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This directory contains the complete styling architecture for the project. It follows the **official Tailwind CSS v4 Cascade Layer specification** and the **Astro recommended project structure**.

The architecture is designed to be:
- **Modular** — Each concern lives in its own file.
- **Scalable** — New styles can be added without creating conflicts.
- **Maintainable** — Any developer can instantly locate and modify styles.
- **Performance-first** — Styles are layered to minimize specificity wars.

> This is not a collection of stylesheets. It is a **design system foundation**.

---

## Why Modular Architecture?

In a monolithic CSS file, styles from different concerns compete for specificity, become difficult to trace, and create a maintenance nightmare as the project grows. This architecture solves that by using **CSS Cascade Layers** — a native browser feature that gives developers explicit control over which styles win, regardless of selector specificity or source order. [reference:0]

By splitting the CSS into logical layers, we achieve:
- **Predictable cascade behavior** — Layer order is declared once and never changes.
- **Clear ownership** — Every style has exactly one correct location.
- **Zero specificity conflicts** — Components never need `!important` to override base styles.
- **Team scalability** — Multiple developers can work simultaneously without merge conflicts.

This approach mirrors how enterprise design systems (Google Material, IBM Carbon, Salesforce Lightning) organize their styling foundations.

---

## File Structure

```text
src/styles/
├── README.md           # This documentation
├── global.css          # Entry point — orchestrates all imports
├── tokens.css          # Design tokens (@theme layer)
├── base.css            # Element resets and global typography
├── components.css      # Reusable UI component patterns
└── animations.css      # @keyframes and motion utilities
```
---

## File Reference

| File | Layer | Purpose | When to Edit |
|:---|:---|:---|:---|
| `global.css` | Entry Point | Imports Tailwind and all custom layers in correct order. Contains only `@utility` definitions. | Only when adding a new global utility class. |
| `tokens.css` | `@layer theme` | Single source of truth for all design tokens: colors, fonts, spacing scales. | When changing brand colors, fonts, or spacing values. |
| `base.css` | `@layer base` | Element resets, default typography, scroll behavior, reduced-motion handling. | When changing default HTML element styles. |
| `components.css` | `@layer components` | Reusable, overridable component patterns (e.g., `.social-icon`). | When building a new UI component or modifying an existing one. |
| `animations.css` | Global | All `@keyframes` definitions and animation utility classes. | When adding or modifying motion effects. |

---

## Layer Order & Cascade

Tailwind CSS v4 injects four layers in the following order of precedence:

| Order | Layer | Description |
|:---|:---|:---|
| 1 | `theme` | Design tokens — variables that define the system. |
| 2 | `base` | Element defaults — resets and typography. |
| 3 | `components` | Reusable patterns — overridable by utilities. |
| 4 | `utilities` | Single-purpose helpers — highest precedence. |

**Critical Rule:** Later layers always override earlier layers. This means a utility class will always override a component style, which will always override a base style. This is intentional and eliminates specificity conflicts. 

---

## Usage Guidelines

### Rule 1: Write in the Correct Layer
Every style must be placed in its designated layer. Do not write raw CSS in `global.css`. Do not put component styles in `base.css`.

| If you are... | Write in... |
|:---|:---|
| Changing a brand color | `tokens.css` |
| Styling a new HTML element default | `base.css` |
| Building a new button, card, or icon | `components.css` |
| Adding a hover, load, or scroll animation | `animations.css` |
| Creating a one-off helper class | `global.css` (using `@utility`) |

### Rule 2: Never Use `!important`
The layered architecture makes `!important` unnecessary. If you find yourself needing it, you are writing in the wrong layer. Move the style to a later layer (e.g., from `components` to `utilities`).

### Rule 3: Use CSS Custom Properties
All colors, fonts, and spacing values must reference a token from `tokens.css`. Never hardcode a hex value or font name outside of `tokens.css`.

**Correct:**
```css
color: var(--color-primary);
```
**Incorrect:**
```css
color: #1A73E8;
```

---

## Design Tokens

All design tokens are defined in `tokens.css` inside the `@theme` block. This is the single source of truth for the entire design system.

| Token Category | Prefix | Example |
|:---|:---|:---|
| Primary colors | `--color-primary-*` | `--color-primary`, `--color-primary-dark` |
| Neutral scale | `--color-neutral-*` | `--color-neutral-50` through `--color-neutral-950` |
| Typography | `--font-family-*` | `--font-family-sans` |

To change the primary brand color across the entire site, modify **only** the value in `tokens.css`. Every component, utility, and animation that references the token will update automatically.

---

## Adding New Styles

Follow this decision tree to determine where a new style belongs:

1. **Is it a design value (color, font, spacing)?** → Add to `tokens.css`
2. **Is it a default style for a native HTML element?** → Add to `base.css`
3. **Is it a reusable UI pattern (button, card, icon)?** → Add to `components.css`
4. **Is it a motion effect (keyframe, transition, hover animation)?** → Add to `animations.css`
5. **Is it a single-purpose helper class (`.sr-only`, `.focus-ring`)?** → Add to `global.css` using `@utility`

---

## Contributing

This is a personal project and is not currently accepting external contributions. However, if you are the project owner:

1. Create a feature branch: `git checkout -b style/feature-name`
2. Make your changes following the [Usage Guidelines](#-usage-guidelines).
3. Test in both light and dark mode.
4. Verify no `!important` declarations were added.
5. Submit a pull request with a clear description of the architectural change.

---

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.

---

<div align="center">

**Built with** [Astro](https://astro.build/) & [Tailwind CSS v4](https://tailwindcss.com/)

**Author:** [Pabitra Mohan Singh](https://www.linkedin.com/in/pabitramohansingh)

*Last updated: September 2026*

</div>
<div align="center">

# CSS Architecture

**A modular, cascade-layer-driven styling system built on Tailwind CSS v4.**

[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Astro](https://img.shields.io/badge/Astro-7.x-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](../../LICENSE)

</div>

## Table of Contents

- [Overview](#overview)
- [Why Modular Architecture?](#why-modular-architecture)
- [File Structure](#file-structure)
- [Entry Point Chain](#entry-point-chain)
- [File Reference](#file-reference)
- [Layer Order & Cascade](#layer-order--cascade)
- [Usage Guidelines](#usage-guidelines)
- [Design Tokens](#design-tokens)
- [Adding New Styles](#adding-new-styles)
- [Contributing](#contributing)
- [License](#license)

## Overview

The styling system spans three locations:

- **`src/styles/`** — global design system (tokens, base, animations)
- **`src/shared/styles/`** — CSS for shared UI components (Header, Footer, MusicToggle, ThemeToggle, NavigationButton)
- **`src/features/<name>/styles/`** — CSS scoped to individual features (home, guestbook)

This follows the **official Tailwind CSS v4 Cascade Layer specification** and the **Astro recommended project structure**.

The architecture is designed to be:
- **Modular** — Each concern lives in its own file.
- **Scalable** — New styles can be added without creating conflicts.
- **Co-located** — Feature styles live next to the feature they serve.
- **Performance-first** — Styles are layered to minimize specificity wars.

> This is not a collection of stylesheets. It is a **design system foundation**.

## Why Modular Architecture?

In a monolithic CSS file, styles from different concerns compete for specificity, become difficult to trace, and create a maintenance nightmare as the project grows. This architecture solves that by using **CSS Cascade Layers** — a native browser feature that gives developers explicit control over which styles win, regardless of selector specificity or source order.

By splitting the CSS into logical layers and grouping files by ownership, we achieve:

- **Predictable cascade behavior** — Layer order is declared once and never changes.
- **Clear ownership** — Every style has exactly one correct location.
- **Zero specificity conflicts** — Components never need `!important` to override base styles.
- **Feature isolation** — Home styles don't leak into the guestbook and vice versa.

This approach mirrors how enterprise design systems (Google Material, IBM Carbon, Salesforce Lightning) organize their styling foundations.

## File Structure

```text
src/styles/                        # Global design system
├── README.md                      # This documentation
├── global.css                     # Entry point — Tailwind import + utility classes
├── tokens.css                     # Design tokens (@theme layer)
├── base.css                       # Element resets and global typography
├── animations.css                 # Keyframes and animation delay utilities
└── components.css                 # Aggregator — imports shared and feature CSS

src/shared/styles/                 # Shared UI component CSS
├── shared.css                     # Entry point for shared styles
├── background.css                 # .background-canvas
├── footer.css                     # .site-footer
├── header.css                     # .site-header, .site-navigation
├── icon-button.css                # .icon-button
├── music-toggle.css               # .music-toggle-button and children
├── navigation.css                 # .navigation-button, .navigation-divider
└── theme-toggle.css               # .theme-toggle-button and children

src/features/home/styles/          # Home feature CSS
├── home.css                       # Entry point for home styles
├── profile.css                    # .profile-photo and slides
└── socials.css                    # .social-icon, .social-cta, tooltips
```

## Entry Point Chain

Every stylesheet flows from a single entry point in `src/styles/`:

```text
src/styles/components.css
├── src/shared/styles/shared.css
│   ├── background.css
│   ├── footer.css
│   ├── header.css
│   ├── icon-button.css
│   ├── music-toggle.css
│   ├── navigation.css
│   └── theme-toggle.css
└── src/features/home/styles/home.css
    ├── profile.css
    └── socials.css
```

To add a new feature's CSS, add one `@import` to `components.css`. To remove a feature, delete the feature folder and its import line. Nothing else changes.

## File Reference

### Global Design System (`src/styles/`)

| File | Layer | Purpose |
|:---|:---|:---|
| `global.css` | Entry Point | Imports Tailwind and all custom layers in correct order. Contains `@utility` definitions. |
| `tokens.css` | `@layer theme` | Single source of truth for all design tokens: colors, fonts, spacing, shadows, animations. |
| `base.css` | `@layer base` | Element resets, default typography, scroll behavior, reduced-motion handling. |
| `animations.css` | Global | Animation delay utilities (`.animate-delay-*`). |
| `components.css` | Aggregator | Imports `shared.css` and every feature's entry CSS. No styles live here directly. |

### Shared UI (`src/shared/styles/`)

| File | Purpose |
|:---|:---|
| `shared.css` | Imports all shared component CSS files. |
| `background.css` | Full-viewport background canvas. |
| `header.css` | Sticky site header and navigation container. |
| `footer.css` | Site footer. |
| `navigation.css` | Navigation buttons and dividers. |
| `icon-button.css` | Base circular icon button. |
| `music-toggle.css` | Music toggle button, equalizer bars, halo effect. |
| `theme-toggle.css` | Theme toggle sun/moon transition. |

### Feature Styles (`src/features/<name>/styles/`)

| File | Purpose |
|:---|:---|
| `home/home.css` | Imports home-specific CSS files. |
| `home/profile.css` | Profile photo slideshow and hover states. |
| `home/socials.css` | Social icons, tooltips, and Gmail CTA. |

## Layer Order & Cascade

Tailwind CSS v4 injects four layers in the following order of precedence:

| Order | Layer | Description |
|:---|:---|:---|
| 1 | `theme` | Design tokens — variables that define the system. |
| 2 | `base` | Element defaults — resets and typography. |
| 3 | `components` | Reusable patterns — overridable by utilities. |
| 4 | `utilities` | Single-purpose helpers — highest precedence. |

**Critical Rule:** Later layers always override earlier layers. A utility class always overrides a component style, which always overrides a base style. This eliminates specificity conflicts by design.

## Usage Guidelines

### Rule 1: Write in the Correct Location

| If you are... | Write in... |
|:---|:---|
| Changing a brand color | `src/styles/tokens.css` |
| Styling a native HTML element default | `src/styles/base.css` |
| Adding a hover, load, or scroll animation delay | `src/styles/animations.css` |
| Styling a shared component (Header, Footer, MusicToggle, ThemeToggle, NavigationButton) | `src/shared/styles/<component>.css` |
| Styling a feature (home, guestbook) | `src/features/<name>/styles/<name>.css` |
| Creating a one-off utility class | `src/styles/global.css` using `@utility` |

### Rule 2: Never Use `!important`

The layered architecture makes `!important` unnecessary. If you need it, you are writing in the wrong layer. Move the style to a later layer (e.g., from `components` to `utilities`).

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

### Rule 4: Co-locate Feature Styles

Feature-specific CSS belongs inside the feature folder, not in `src/styles/`. If a style is only used by `home`, it lives in `src/features/home/styles/`. If it's used by multiple features, promote it to `src/shared/styles/`.

### Rule 5: Only Create Feature CSS When Tailwind Utilities Cannot Express It

Tailwind utilities handle layout, spacing, colors, typography, borders, and simple hover states. External CSS is required only for:
- Pseudo-elements with generated content (`::before`, `::after`)
- Descendant selectors (`.parent .child`)
- Complex `:nth-child` targeting
- Custom `@keyframes` animations
- CSS custom properties per variant
- State-driven child styling (`.is-playing .equalizer-bar`)

If none of those apply, use Tailwind utilities inline and skip the external CSS file.

## Design Tokens

All design tokens are defined in `tokens.css` inside the `@theme` block. This is the single source of truth for the entire design system.

| Token Category | Prefix | Example |
|:---|:---|:---|
| Primary colors | `--color-primary-*` | `--color-primary`, `--color-primary-dark` |
| Neutral scale | `--color-neutral-*` | `--color-neutral-50` through `--color-neutral-950` |
| Brand colors | `--color-brand-*` | `--color-brand-facebook`, `--color-brand-x` |
| Instagram gradient stops | `--color-instagram-*` | `--color-instagram-orange` |
| Gmail brand colors | `--color-gmail-*` | `--color-gmail-red`, `--color-gmail-blue` |
| Semantic surface colors | `--color-surface`, `--color-on-surface` | Set on `:root` and `.dark` |
| Typography | `--font-*` | `--font-sans` |
| Spacing | `--spacing-*` | `--spacing-icon`, `--spacing-photo` |
| Radius | `--radius-*` | `--radius-icon`, `--radius-pill` |
| Shadows | `--shadow-*` | `--shadow-photo`, `--shadow-glow-facebook` |
| Animations | `--animate-*` | `--animate-slide-in-left`, `--animate-profile-cycle` |

To change the primary brand color across the entire site, modify **only** the value in `tokens.css`. Every component, utility, and animation that references the token updates automatically.

## Adding New Styles

Follow this decision tree:

1. **Is it a design value (color, font, spacing, shadow)?** → Add to `src/styles/tokens.css`
2. **Is it a default style for a native HTML element?** → Add to `src/styles/base.css`
3. **Is it an animation keyframe or delay?** → Add to `src/styles/animations.css`
4. **Is it a shared component used on multiple pages?** → Create `src/shared/styles/<component>.css`, import it in `src/shared/styles/shared.css`
5. **Is it a feature-specific style that uses pseudo-elements, custom keyframes, descendant selectors, or state-driven children?** → Create `src/features/<name>/styles/<file>.css`, import it in `src/features/<name>/styles/<name>.css`
6. **Is it a single-purpose helper class (`.sr-only`, `.focus-ring`)?** → Add to `src/styles/global.css` using `@utility`
7. **Is it something Tailwind utilities can express inline?** → Don't write external CSS. Use utilities in the markup.

## Contributing

This is a personal project and is not currently accepting external contributions. If you are the project owner:

1. Create a feature branch: `git checkout -b style/feature-name`
2. Make your changes following the [Usage Guidelines](#usage-guidelines).
3. Test in both light and dark mode.
4. Verify no `!important` declarations were added.
5. Submit a pull request with a clear description of the architectural change.

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.

---

<div align="center">

**Built with** [Astro](https://astro.build/) & [Tailwind CSS v4](https://tailwindcss.com/)

**Author:** [Pabitra Mohan Singh](https://www.linkedin.com/in/pabitramohansingh)

</div>
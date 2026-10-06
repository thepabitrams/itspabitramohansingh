# CSS Architecture

Modular, cascade-layer-driven styling built on Tailwind CSS v4.

## Location

```
src/styles/                # Global design system
├── global.css             # Entry point
├── tokens.css             # Design tokens
├── base.css               # Element resets
├── animations.css         # Keyframes and delays
└── components.css         # Aggregator

src/shared/styles/         # Shared UI components
src/features/*/styles/     # Feature-scoped CSS
```

## Why This Split

- **Global** — tokens, resets, animations. Used everywhere.
- **Shared** — CSS for components used on multiple pages (Header, Footer, MusicToggle, ThemeToggle, NavigationButton).
- **Features** — CSS scoped to one feature (home, guestbook). Co-located with the feature it serves.

## Entry Point

Everything flows through `src/styles/components.css`:

```
components.css
├── shared/styles/shared.css
└── features/<name>/styles/<name>.css
```

Add a feature → one `@import` line. Remove a feature → delete folder and import.

## Rules

1. **Write in the right location** — tokens in `tokens.css`, shared in `shared/styles/`, feature CSS in `features/*/styles/`
2. **Never use `!important`** — cascade layers make it unnecessary
3. **Use tokens** — never hardcode hex values, reference `var(--color-*)`
4. **Co-locate feature styles** — if only `home` uses it, it lives in `home/styles/`
5. **Only write CSS when Tailwind can't** — pseudo-elements, keyframes, descendant selectors, `:nth-child`, state-driven children

## Tailwind Cannot Express

- `::before` / `::after` with `content`
- Descendant selectors (`.parent .child`)
- Complex `:nth-child` targeting
- Custom `@keyframes`
- CSS custom properties per variant
- State-driven child styling

If it's none of those, use Tailwind utilities inline.

## License

MIT. See [LICENSE](../../LICENSE).
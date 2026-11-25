# Tuff design system

Dense and quiet, built for a tool people keep open all day. Text is small, rows are tight, hairlines do the work boxes would, and colour shows up only where it means something. Most of the look comes from being consistent: a decision gets made once, in a token or a kit component, and every screen reuses it.

Run `pnpm dev`. The feed dashboard is at http://localhost:5180/ (`web/src/feed/`), the showcase at `/design` (`web/src/Showcase.tsx`), and the wefunder.com redesign at `/wefunder` (`web/src/wefunder/`).

The marketing page is the one place that doesn't use the app's tokens. It uses `--lp-*` instead, is always dark, and alternates sections with `data-lp-tone="dark" | "light"`.

## Where things live

| What | File |
| --- | --- |
| Tokens (colour, type, radius, size, motion) | `web/src/theme.css` (`@theme` at the top, light `:root`, dark `:root[data-theme='dark']`) |
| Components, imported from one place | `web/src/ui/kit.tsx` → `web/src/ui/kit/*.tsx` |
| Icons | `web/src/ui/glyphs.tsx` (`<Icon name>`), project marks in `web/src/ui/icons.tsx` |
| Empty-state drawings | `web/src/ui/illustrations/` |
| Every user-facing word | `web/src/words/` (components never hardcode copy) |

## Rules that hold everywhere

1. **Import from `ui/kit.jsx`, never from `ui/kit/<file>.jsx`.** The barrel is the public API. Anything it doesn't export is internal.
2. **Colour comes from semantic tokens only.** Use `--ink`, `--panel`, `--accent` and the rest, or their Tailwind names (`text-ink-2`, `bg-panel`). Never use the neutral ramp `--n-0`…`--n-9` and never a hex literal. Only the semantic layer has a dark value, so a primitive or a hex will be wrong in one of the two themes.
3. **One `primary` per screen.** The accent marks the single action, so a second accented thing means the screen no longer has one.
4. **Radius comes from the ramp:** `--r-tile` 4, `--r-row` 8, `--r-field` 12, `--r-card` 16, `--r-panel` 20, `--r-pill`. Don't write a raw `rounded-[6px]`. When one rounded box sits inside another, the inner radius is the outer one minus the padding.
5. **Controls and rows are 32px tall** (`--control-h`, `--row-h`). Don't change the height of a single instance; if it looks wrong, the token is wrong.
6. **Type comes from the scale** (`text-xs` 12 … `text-hero` 40). Text people read is never smaller than 12px. `text-badge` (11) is for counts only.
7. **Motion uses `--ease-out` for anything that enters, and stays under 250ms.** Anything that animates on its own also needs a `prefers-reduced-motion` fallback.

## Topics

- [design/tokens.md](design/tokens.md): which colour, surface and type token to reach for
- [design/components.md](design/components.md): when to use each component, its variants and defaults

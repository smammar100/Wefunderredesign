# Tokens

Everything here is defined in `web/src/theme.css`. Each semantic token has a light value in `:root` and a dark one in `:root[data-theme='dark']`. The theme is set on `<html data-theme>` before first paint (see `web/index.html`).

## Which background

```
Is it a dialog, popover or menu floating over content?
 ├── Yes → --float (shadow: --float-shadow)
 └── No
      ├── Is it the page behind everything? → --canvas
      ├── Is it the app frame (sidebar, bars)? → --chrome
      ├── Is it a group of rows or settings? → --panel, via <Panel>
      ├── Is it a text field or a well? → --sunken
      ├── Is it a quiet button or select? → --control (use `quietLook`)
      └── Is it the track behind a segmented control or a toggle that's on? → --track
```

`--hover` is the only hover ground, and it goes on rows. Don't darken a surface by hand to fake hover.

## Which text colour

- `--ink`: titles, row text, anything someone came to read. This is the default.
- `--ink-2`: supporting text under or beside `--ink`.
- `--ink-3`: placeholders, metadata, disabled. Don't use it for a sentence someone has to read in order to act.
- `--accent`: links and the one primary action. Put `--on-accent` text on an accent ground.
- `--danger`: destructive actions and errors. Never use it as decoration.
- `--due`: overdue dates only.

## Tints

`--tint-0`…`--tint-9` are the ten identity colours for labels, lists, projects and avatars. Pick one by id with `tintOf(id)` / `tint(id)`; don't choose by hand. For text in a tint, use `--tint-N-ink`. The bright tint fails contrast as text on white.

## Type

| Token | px | Use |
| --- | --- | --- |
| `text-hero` / `text-display` | 40 / 32 | Marketing only, never in the app |
| `text-title` | 24 | `PageTitle` |
| `text-xl` | 20 | Empty-state titles |
| `text-lg` / `text-md` | 17 / 15 | Dialog titles, emphasis |
| `text-base` | 14 | Row text, body. The default |
| `text-sm` | 13 | Controls, secondary lines |
| `text-xs` | 12 | Metadata. The floor for readable text |
| `text-badge` | 11 | `Badge` counts and `Kbd` only |

Letter-spacing gets tighter as text gets bigger: `--track-body` −0.1, `--track-title` −0.3, `--track-display` −0.7. Headings take `--track-title`.

## Motion

- `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)` for enter and exit. This is the default.
- `--ease-in-out` for something that moves while it stays on screen (a sliding chip).
- `--ease-drawer` for sheets.
- Never use `ease-in` on UI: it starts slow and reads as lag.
- Duration: 150ms for popovers (`SHOWING`), 240ms for sliding (`SLIDING`), 200ms for columns (`COLUMN_MS`). Import those constants instead of retyping the numbers.

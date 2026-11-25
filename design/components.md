# Components

Everything below is exported from `web/src/ui/kit.tsx`. If a prop value isn't listed here, it doesn't exist. Treat an unlisted variant as a bug, not an option.

## Button

For actions. Navigation is a link, not a Button.

Tones: `quiet` (the default), `primary`, `danger`. Nothing else exists.

```
Is it destructive or hard to undo?
 ├── Yes → tone="danger"
 └── No
      ├── Is it the one action this screen exists for? → tone="primary"
      └── Default → leave tone out (quiet)
```

```tsx
// Correct: a dialog footer
<Button onClick={close}>Cancel</Button>
<Button tone="primary" onClick={save}>Save</Button>

// Incorrect: two primaries, so nothing on the screen stands out
<Button tone="primary">Cancel</Button>
<Button tone="primary">Save</Button>
```

## Field, SecretInput, Select

`Field` is the text input (32px, `--sunken`). Pass `wide` to fill the row. `SecretInput` is for tokens and keys. `Select` is a short closed list of 2–7 options. For more options, or for options that are people, dates or projects, use the pickers (`WhoPick`, `DuePick`, `ProjectPick`, `PriorityPick`, `LabelPick`).

Spread the right preset from `kit/fields.tsx` onto a raw `<input>`: `urlField`, `linkField`, `findField`, `othersEmail`. They stop password managers and autocorrect from treating the input as a login.

## Segments, Toggle, Switch

```
Is it choosing one view or mode out of 2–5? → <Segments>
Is it one filter among several that can be on together? → <Toggle>
Is it a setting that takes effect immediately? → <Switch>
Does it need a Save press to take effect? → a checkbox, which the kit doesn't provide
```

```tsx
// Correct
<Segments items={[{ key: 'board', label: 'Board', icon: 'board' }, { key: 'list', label: 'List', icon: 'list' }]} value={view} onPick={setView} />

// Incorrect: two Toggles standing in for one exclusive choice
<Toggle on={view === 'board'} onChange={() => setView('board')}>Board</Toggle>
```

## Badge, Kbd, LabelChip, Dot, PriorityMark

- `Badge`: a count of what's waiting. `tone` is `normal` (the default), `urgent` for a direct mention only, or `quiet` for a muted room. It renders nothing at 0 and caps at `99+`.
- `LabelChip`: a label, coloured by its own tint. Pass `tight` only to the last chip in a fixed-width row.
- `PriorityMark value={null}` draws "no priority". Don't hide it, because the empty mark keeps the column aligned.
- `Kbd`: a keyboard key in running text, drawn at `text-badge` on `--sunken`.

## Avatar, AgentFaceMark, ProjectMark

`Avatar` is a person (initials, or a photo via `url`). Set `on` to the colour behind it so the presence ring cuts out cleanly: `var(--panel)` inside a Panel, `var(--canvas)` on the page. Agents use `AgentFaceMark`, and projects use `ProjectMark`.

## Panel, Row, SectionHead, PageTitle, EmptyState

A list of things is a `Panel` holding `Row`s. Rows are 32px and highlight with `--hover`. `selected` marks the current one, and `rail` adds the left mark used for navigation. Put a `SectionHead` above each Panel and one `PageTitle` per screen.

An empty list is an `EmptyState` with one `art` drawing, a title, one sentence, and an `action` if there's an obvious first step. Don't show an empty Panel.

## Dialog, Popover, Choice

`Dialog` is for a task that blocks the screen: a title, a body, and a `footer` of Buttons. Use `size="large"` only for writing (a new task), and `sheet` for the full-height phone version. `Popover` is for anything anchored to the thing that opened it, like a menu or a picker. `Choice` is one row inside a Popover.

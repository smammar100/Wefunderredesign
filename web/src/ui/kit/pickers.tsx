import { useState, useRef, useEffect } from 'react'
import { PLACES, SAYS } from '../../data/words.js'
import { KIT as W } from '../../words/kit.js'
import { type PersonInWorkspace } from '@tracker/shared-schema'
import { Icon } from '../glyphs.jsx'
import { type Marked, ProjectMark as Mark, markOf, markRadius } from '../icons.jsx'
import { Glass } from '../Glass.jsx'
import { Avatar, agentLabel } from './avatar.jsx'
import { useWorkingOn } from '../../data/working.js'
import { Over, Fluid } from './rows.jsx'
import { inWindow } from './labels.jsx'
import { Hairline } from './page.jsx'
import { findField } from './fields.jsx'

/* Who a task is given to, from whatever this window holds of it. A row kept
   from before the list existed — this device's copy for reading offline,
   `docs/specs/offline.md` — has only the one id, and is read as that one. */
export const whoOf = (t: { assignee_ids?: string[] | undefined; assignee_id?: string | null | undefined }): string[] =>
  t.assignee_ids ?? (t.assignee_id ? [t.assignee_id] : [])

/** Everybody on something, by name, in their order: what a fact says beside
    the face that stands for all of them. */
export function namesOf(people: PersonInWorkspace[], ids: readonly string[]): string {
  return ids
    .map((id) => people.find((p) => p.actor_id === id)?.name)
    .filter(Boolean)
    .join(', ')
}

/**
 * Who has it, changed from the face that shows it.
 *
 * The same shape as the list's ring and the priority's mark, and for the same
 * reason: the thing that draws where something stands is the thing that
 * changes it. The row drew a face and the face did nothing, so assigning
 * meant opening the task — and a letter on the keyboard had no control to
 * open. `docs/specs/keyboard.md`.
 *
 * Several people, one face. The first is drawn
 * and the rest are a count on its corner, so a row is the same width with
 * one person on it as with five: the slot a face sits in was measured for
 * one, and a stack of faces would have pushed the row's dates along under
 * the pointer. The menu ticks each person and stays open while they are
 * picked; Nobody takes everybody off and closes it.
 */
export function WhoPick({
  people,
  value,
  said,
  onPick,
  disabled = false,
  size = 24,
  working: guessed = null,
  task,
  single = false,
  label,
}: {
  people: PersonInWorkspace[]
  /** One at most: a pick is the whole answer and closes the menu — a
      list's agent. */
  single?: boolean
  /** What the button is called, where it is not a task's assignee. */
  label?: string
  /** The agent working on it now, ringed while it works. */
  working?: string | null
  /** The task this is the face of: an agent given it that says it is at it
      is ringed too, whatever list it is in. */
  task?: string
  /** Who has it, in order, `[]` for nobody — and `undefined` for several
      tasks at once, which have no one answer: then no row carries the tick,
      and picking somebody gives every one of them to that person alone. */
  value: string[] | undefined
  /** What this is the assignee of, for whoever cannot see the face. */
  said: string
  /** Everybody it is given to afterwards, in order. */
  onPick: (to: string[]) => void
  disabled?: boolean
  size?: number
}) {
  const [at, setAt] = useState<{ x: number; y: number; r: number } | null>(null)
  const [warm, setWarm] = useState(false)
  const face = useRef<HTMLButtonElement>(null)
  const on = value ?? []
  const here = people.find((p) => p.actor_id === on[0]) ?? null
  const { status } = useWorkingOn(task)
  const working = (status && on.includes(status.agent_id) ? people.find((p) => p.actor_id === status.agent_id)?.name : null) ?? guessed
  /* Several tasks at once have no list to add to: a pick is the answer. */
  const one = value === undefined
  const whole = one || single
  /* A person pressed: on or off the list, which stays open to pick the
     next; Nobody, or anyone for several tasks, is the whole answer. */
  const pick = (id: string | null) => {
    if (id === null) {
      setAt(null)
      return onPick([])
    }
    if (whole) {
      setAt(null)
      return onPick([id])
    }
    onPick(on.includes(id) ? on.filter((x) => x !== id) : [...on, id])
  }
  /*
   * Typed to narrow, because a workspace is not a short list.
   *
   * Six people fit in a menu and are read at a glance; sixty are a
   * scroll, and the one being looked for is known by name before the
   * menu opens. The labels picker has had this since there were labels
   * — same shape here, so neither has to be learnt twice.
   */
  const [typed, setTyped] = useState('')
  useEffect(() => {
    if (!at) setTyped('')
  }, [at])
  const found = typed.trim() ? people.filter((x) => x.name.toLowerCase().includes(typed.trim().toLowerCase())) : people
  /* Nobody first, so the digit that takes somebody off is always 1 and does
     not move when a person joins the workspace. Gone while narrowing: a
     search is for finding somebody, and the row that means "no-one" is
     not something anybody searches for. */
  const rows = typed.trim() ? found : [null, ...people]

  useEffect(() => {
    if (!at) return
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return setAt(null)
      /* The digits are a shortcut for the list as it stands, so they stop
         being one the moment somebody is typing a name into it — a `2`
         in "Robin 2" would otherwise pick the second row. */
      if (typed) return
      const n = Number(e.key)
      if (!Number.isInteger(n) || n < 1 || n > Math.min(rows.length, 9)) return
      e.preventDefault()
      pick(rows[n - 1]?.actor_id ?? null)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  return (
    <>
      <button
        ref={face}
        data-who={on.join(',')}
        aria-label={label ?? (working ? `${W.assigneeOf(said)} · ${W.agentWorking(working)}` : W.assigneeOf(said))}
        title={label ?? (working ? W.agentWorking(working) : undefined)}
        aria-haspopup="menu"
        aria-expanded={at !== null}
        disabled={disabled}
        onClick={() => {
          if (at) return setAt(null)
          const box = face.current?.getBoundingClientRect()
          if (box) setAt({ x: box.left, y: box.bottom, r: box.right })
        }}
        /* A mouse only. A finger's `pointerenter` fires on the tap and
           never leaves, so the brightening would stay on whatever was
           pressed last. */
        onPointerEnter={(e) => e.pointerType === 'mouse' && setWarm(true)}
        onPointerLeave={() => setWarm(false)}
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* A ring that turns while its agent works: the one thing on the
            row that moves, and only while something is happening. */}
        {working && <span data-agent-working aria-hidden className="agent-working pointer-events-none absolute -inset-1 rounded-full" />}
        {here ? (
          <>
            <Avatar id={here.actor_id} name={here.name} url={here.avatar_url} size={size} live={Boolean(working)} />
            {on.length > 1 && (
              /* How many more, on the face's corner, ringed in the ground
                 so it reads as its own thing over the picture. */
              <span
                data-who-more
                aria-hidden
                className="absolute flex items-center justify-center rounded-full px-1 text-mini leading-none font-semibold tabular-nums bg-ink-2 text-chrome"
                style={{
                  right: -8,
                  bottom: -4,
                  minWidth: 16,
                  height: 12,
                  boxShadow: '0 0 0 2px var(--chrome)',
                }}
              >
                +{on.length - 1}
              </span>
            )}
          </>
        ) : (
          /* An empty ring, the way the priority's bars are empty: the shape of
             the answer before anybody has given it.
             
             Brighter under the pointer, like the two facts beside it: the
             row says where the hand is and this says which of them it is
             on, which is the smaller thing and takes the smaller signal. */
          <span
            aria-hidden
            className="flex items-center justify-center transition-[background-color,color,opacity] bg-hover"
            /*
             * A face-shaped blank, not a dashed ring.
             *
             * The ring said "nothing here" and nothing else: a dotted
             * circle is the shape of an absence, and on a row of faces it
             * read as a hole in the row rather than as a place to put
             * someone. A person glyph on a filled disc is the same size and
             * the same shape as the avatar it stands in for — the full
             * `size`, not inset the way the ring was, so the row does not
             * change height when somebody is picked — and says what the
             * control is — who — before it says that it is empty. Dim
             * rather than dashed carries the emptiness.
             */
            style={{
              width: size,
              height: size,
              borderRadius: 999,
              color: warm && !disabled ? 'var(--ink-2)' : 'var(--ink-3)',
              opacity: warm && !disabled ? 1 : 0.7,
            }}
          >
            <Icon name="person" size={Math.max(10, Math.round(size * 0.56))} />
          </span>
        )}
      </button>
      {/* The screen is the menu's while it is open — `Over`. Laid down
          before the menu, so the menu is the one thing above it. */}
      {at && <Over onClose={() => setAt(null)} />}
      {at && (
        <div
          data-over
          data-who-menu
          role="menu"
          className="fixed z-40"
          style={{
            left: inWindow(at.x, 220, at.r),
            top: at.y + 6 + rows.length * 36 > window.innerHeight ? undefined : at.y + 6,
            bottom: at.y + 6 + rows.length * 36 > window.innerHeight ? window.innerHeight - at.y + 26 : undefined,
            width: 220,
          }}
        >
          {/* Glass, like the calendar and for the same reason: `glass.md`
              names floating panels among the places it goes, and these
              menus are that object at a smaller size. */}
          <Glass radius={16} className="overflow-hidden py-1">
            {/* Only once there are enough to hunt through. Under that the
              list is read at a glance and a field above it is a thing to
              dismiss before pressing the name already on screen. */}
            {people.length > 7 && (
              <>
                <input
                  {...findField}
                  data-testid="who-search"
                  autoFocus={window.matchMedia('(pointer: fine)').matches}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setAt(null)
                    /* Enter takes the only one left, which is what a name
                     typed nearly in full is asking for. */
                    if (e.key === 'Enter' && rows.length === 1) {
                      e.preventDefault()
                      pick(rows[0]?.actor_id ?? null)
                      setTyped('')
                    }
                  }}
                  placeholder={PLACES.findSomebody}
                  className="w-full bg-transparent px-3 py-2 text-base outline-none text-ink"
                />
                <Hairline inset={0} />
              </>
            )}
            {/* `relative`, so the glow inside is positioned against this pane
              rather than against the menu's own box. */}
            <div className="relative max-h-[240px] overflow-x-hidden overflow-y-auto py-1" data-fluid data-menu data-reads-down>
              <Fluid />
              {rows.map((p, i) => (
                <button
                  key={p?.actor_id ?? 'nobody'}
                  role={single ? 'menuitemradio' : 'menuitemcheckbox'}
                  data-row
                  data-who-pick={p?.actor_id ?? 'nobody'}
                  aria-checked={p ? on.includes(p.actor_id) : !one && on.length === 0}
                  onClick={() => pick(p?.actor_id ?? null)}
                  className={`flex w-full items-center gap-3 px-3 text-left text-base text-ink ${p?.agent ? 'py-1' : ''}`}
                  style={{ minHeight: 'var(--row-h)' }}
                >
                  {p ? <Avatar id={p.actor_id} name={p.name} url={p.avatar_url} size={20} /> : <span className="size-5" />}
                  {/* An agent, said under its name: giving it a task sets it
                  working. Beside the name, "away
                  since…" took the row's width and left the name none. */}
                  <span className="flex min-w-px flex-1 flex-col">
                    <span className="truncate">{p?.name ?? W.noOne}</span>
                    {p?.agent && (
                      <span data-who-agent className="truncate text-badge text-ink-3">
                        {agentLabel(p)}
                      </span>
                    )}
                  </span>
                  {(p ? on.includes(p.actor_id) : !one && on.length === 0) && <Icon name="tasks" size={14} className="text-ink-2" />}
                  {/* The digits are the shortcut for the list as it stands, so
                  they go while it is being narrowed. */}
                  {!typed && i < 9 && <span className="shrink-0 text-sm text-ink-3">{i + 1}</span>}
                </button>
              ))}
              {rows.length === 0 && <div className="px-3 py-2 text-base text-ink-3">{SAYS.nobodyByThatName}</div>}
            </div>
          </Glass>
        </div>
      )}
    </>
  )
}

/**
 * Which project, chosen by its mark — the head of the window a task is made
 * in.
 *
 * It was the browser's own select, a line of text out of the operating
 * system's menu, beside a person picker that was faces. The same shape as
 * that one now: the mark and the name on the button, every project with its
 * mark in the menu, typed to narrow once there are enough to hunt through.
 */
export function ProjectPick({
  projects,
  value,
  onPick,
  testId,
}: {
  projects: Marked[]
  value: string
  onPick: (id: string) => void
  testId?: string
}) {
  const [at, setAt] = useState<{ x: number; y: number; r: number } | null>(null)
  const [typed, setTyped] = useState('')
  const face = useRef<HTMLButtonElement>(null)
  const here = projects.find((p) => p.id === value) ?? null
  useEffect(() => {
    if (!at) setTyped('')
  }, [at])
  const q = typed.trim().toLowerCase()
  const rows = q ? projects.filter((p) => p.name.toLowerCase().includes(q)) : projects

  useEffect(() => {
    if (!at) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setAt(null)
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [at])

  return (
    <>
      <button
        ref={face}
        type="button"
        data-testid={testId}
        data-project-pick={value}
        aria-label={here ? W.projectIs(here.name) : W.chooseAProject}
        aria-haspopup="menu"
        aria-expanded={at !== null}
        data-control
        onClick={() => {
          if (at) return setAt(null)
          const box = face.current?.getBoundingClientRect()
          if (box) setAt({ x: box.left, y: box.bottom, r: box.right })
        }}
        className="flex h-7 max-w-[280px] min-w-px shrink items-center gap-2 pr-2 pl-1 text-sm font-medium bg-track"
        style={{
          /* The mark's own corner plus the four pixels around it, so the
             chip's curve runs parallel to the mark's instead of a full
             round end around a square. */
          borderRadius: markRadius(20) + 4,
          color: here ? 'var(--ink)' : 'var(--ink-2)',
          letterSpacing: 'var(--track-body)',
          ...(here ? {} : { paddingLeft: 12 }),
        }}
      >
        {here && <Mark {...markOf(here)} size={20} />}
        <span className="truncate">{here?.name ?? W.chooseAProject}</span>
        <Icon name="updown" size={12} className="text-ink-3" style={{ flexShrink: 0 }} />
      </button>
      {at && <Over onClose={() => setAt(null)} />}
      {at && (
        <div
          data-over
          data-project-menu
          role="menu"
          className="fixed z-40"
          style={{ left: inWindow(at.x, 264), top: at.y + 6, width: 264 }}
        >
          <Glass radius={16} className="overflow-hidden py-1">
            {projects.length > 7 && (
              <>
                <input
                  {...findField}
                  data-testid="project-search"
                  autoFocus={window.matchMedia('(pointer: fine)').matches}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && rows.length === 1) {
                      e.preventDefault()
                      setAt(null)
                      onPick(rows[0]!.id)
                    }
                  }}
                  placeholder={W.findAProject}
                  className="w-full bg-transparent px-3 py-2 text-base outline-none text-ink"
                />
                <Hairline inset={0} />
              </>
            )}
            <div className="relative max-h-[288px] overflow-y-auto py-1" data-fluid data-menu data-reads-down>
              <Fluid />
              {rows.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="menuitem"
                  data-row
                  data-project-option={p.id}
                  onClick={() => {
                    setAt(null)
                    onPick(p.id)
                  }}
                  className="flex w-full items-center gap-3 px-3 text-left text-base text-ink"
                  style={{ height: 'var(--row-h)' }}
                >
                  <Mark {...markOf(p)} size={20} />
                  <span className="min-w-px flex-1 truncate">{p.name}</span>
                  {p.id === value && <Icon name="tasks" size={14} className="text-ink-2" />}
                </button>
              ))}
              {rows.length === 0 && <div className="px-3 py-2 text-base text-ink-3">{W.noMatchingProjects}</div>}
            </div>
          </Glass>
        </div>
      )}
    </>
  )
}

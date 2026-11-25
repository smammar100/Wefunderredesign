import { useState, useRef, useEffect } from 'react'
import { PLACES, HEADS } from '../../data/words.js'
import { KIT as W } from '../../words/kit.js'
import { Icon } from '../glyphs.jsx'
import { Glass } from '../Glass.jsx'
import { Over, Fluid } from './rows.jsx'
import { inWindow } from './labels.jsx'
import { Hairline } from './page.jsx'
import { Dot } from './marks.jsx'
import { findField } from './fields.jsx'

/**
 * Which sprint, picked from a menu with a field to find one.
 *
 * It was the platform's select on a task's screen and this menu in the bar
 * for many at once; one menu now, the kind everything else here opens.
 * Newest first, by when a sprint starts: the sprint somebody is putting work
 * into is this one or the next, and a list in the order they were made put
 * it at the bottom under a year of finished ones. Each says its dates,
 * because two sprints can share a name. No digits: sprints are named with
 * numbers, and a digit typed to find "Sprint 15" picked the first row.
 */
type SprintRow = { id: string; name: string; starts_on?: string; ends_on?: string }

export function CyclePick({
  cycles,
  value,
  said,
  onPick,
  disabled = false,
  face,
}: {
  cycles: SprintRow[]
  /** The cycle, `null` for none, `undefined` for several tasks — no tick. */
  value: string | null | undefined
  said: string
  onPick: (to: string | null) => void
  disabled?: boolean
  /** What the button shows instead of the glyph. */
  face?: React.ReactNode
}) {
  const [at, setAt] = useState<{ x: number; y: number; r: number } | null>(null)
  const [warm, setWarm] = useState(false)
  const [typed, setTyped] = useState('')
  const mark = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!at) setTyped('')
  }, [at])
  const newest = [...cycles].sort((a, b) => (b.starts_on ?? '').localeCompare(a.starts_on ?? ''))
  const q = typed.trim().toLowerCase()
  const found = q ? newest.filter((y) => y.name.toLowerCase().includes(q)) : newest
  /* No sprint first, as the ordinary answer — and gone while finding one. */
  const rows: (SprintRow | null)[] = q ? found : [null, ...found]
  const when = (y: SprintRow) => (y.starts_on && y.ends_on ? W.sprintDates(y.starts_on, y.ends_on) : '')

  useEffect(() => {
    if (!at) return
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAt(null)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [at])

  return (
    <>
      <button
        ref={mark}
        data-cycle-pick
        aria-label={W.sprintOf(said)}
        aria-haspopup="menu"
        aria-expanded={at !== null}
        disabled={disabled}
        onClick={() => {
          if (at) return setAt(null)
          const box = mark.current?.getBoundingClientRect()
          if (box) setAt({ x: box.left, y: box.bottom, r: box.right })
        }}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setWarm(true)}
        onPointerLeave={() => setWarm(false)}
        className={face ? 'flex min-w-px items-center' : 'relative flex size-5 shrink-0 items-center justify-center transition-colors before:absolute before:-inset-1'}
        style={face ? undefined : { color: warm && !disabled ? 'var(--ink)' : 'var(--ink-3)' }}
      >
        {face ?? <Icon name="cycle" size={16} />}
      </button>
      {at && <Over onClose={() => setAt(null)} />}
      {at && (
        <div
          data-over
          data-cycle-menu
          role="menu"
          className="fixed z-40"
          style={{
            left: inWindow(at.x, 240, at.r),
            top: at.y + 6 + 340 > window.innerHeight ? undefined : at.y + 6,
            bottom: at.y + 6 + 340 > window.innerHeight ? window.innerHeight - at.y + 26 : undefined,
            width: 240,
          }}
        >
          <Glass radius={16} className="overflow-hidden py-1">
            <input
              {...findField}
              data-testid="cycle-search"
              autoFocus={window.matchMedia('(pointer: fine)').matches}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setAt(null)
                /* Enter takes the first of what is left — what somebody who
                   typed most of a name is asking for. */
                if (e.key === 'Enter' && rows.length > 0) {
                  e.preventDefault()
                  setAt(null)
                  onPick(rows[0]?.id ?? null)
                }
              }}
              placeholder={PLACES.findASprint}
              className="w-full bg-transparent px-3 py-2 text-base outline-none text-ink"
            />
            <Hairline inset={0} />
            <div className="relative max-h-[280px] overflow-y-auto py-1" data-fluid data-menu data-reads-down>
              <Fluid />
              {rows.map((y) => (
                <button
                  key={y?.id ?? 'none'}
                  role="menuitem"
                  data-row
                  data-cycle-row={y?.id ?? 'none'}
                  onClick={() => {
                    setAt(null)
                    onPick(y?.id ?? null)
                  }}
                  className="flex w-full items-center gap-3 px-3 text-left text-base"
                  style={{ height: 'var(--row-h)', color: y ? 'var(--ink)' : 'var(--ink-2)' }}
                >
                  <span className="min-w-px flex-1 truncate">{y ? y.name : HEADS.noCycle}</span>
                  {y && when(y) && <span className="shrink-0 text-xs tabular-nums text-ink-3">{when(y)}</span>}
                  {value !== undefined && (y?.id ?? null) === value && <Icon name="tasks" size={14} className="text-ink-2" />}
                </button>
              ))}
              {rows.length === 0 && <p className="px-3 py-2 text-sm text-ink-3">{W.noMatchingSprints}</p>}
            </div>
          </Glass>
        </div>
      )}
    </>
  )
}

/**
 * Where a task is, changed from the ring that shows it.
 *
 * The list is the status — so the thing that draws
 * it is the thing that sets it. It was a checkbox: one press, done or not
 * done, and the three lists in between reachable only by dragging a card on
 * the board.
 *
 * Drawn `fixed` at the ring rather than inside it, because the rows sit in a
 * panel with `overflow: hidden` and a menu absolutely positioned in there is
 * a menu with its bottom half cut off.
 */
export type Placed = {
  id: string
  name: string
  finishes: boolean
  /** The project's triage. */
  intake?: boolean
  icon: string
  /** What its mark is drawn in, or null for the mark's own — `Dot`. */
  color?: string | null
  /** The agent that takes its new tasks. */
  agent_id?: string | null
  agent_gone?: boolean
}

export function Status({
  lists,
  value,
  said,
  onPick,
  disabled = false,
}: {
  lists: Placed[]
  value: string | null
  /** What this is the status of, for the people who cannot see the ring. */
  said: string
  onPick: (listId: string) => void
  disabled?: boolean
}) {
  const [at, setAt] = useState<{ x: number; y: number; r: number } | null>(null)
  const ring = useRef<HTMLButtonElement>(null)
  const here = lists.find((l) => l.id === value) ?? null

  useEffect(() => {
    if (!at) return
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return setAt(null)
      /* The numbers beside the names, which is what they are for. A list is
         reached by its position rather than by its name, so renaming one
         does not move the key that picks it. */
      const n = Number(e.key)
      if (!Number.isInteger(n) || n < 1 || n > lists.length) return
      e.preventDefault()
      setAt(null)
      onPick(lists[n - 1]!.id)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [at, lists, onPick])

  return (
    <>
      <button
        ref={ring}
        /* The name of the list it is in, so the one attribute both finds
           this control and says what it is showing. */
        data-status={here?.name ?? ''}
        aria-label={said}
        aria-haspopup="menu"
        aria-expanded={at !== null}
        disabled={disabled}
        onClick={() => {
          if (at) return setAt(null)
          const box = ring.current?.getBoundingClientRect()
          if (box) setAt({ x: box.left, y: box.bottom, r: box.right })
        }}
        className="relative flex size-5 shrink-0 items-center justify-center before:absolute before:-inset-1"
      >
        <Dot icon={here?.icon ?? null} color={here?.color} />
      </button>
      {/* The screen is the menu's while it is open — `Over`. Laid down
          before the menu, so the menu is the one thing above it. */}
      {at && <Over onClose={() => setAt(null)} />}
      {at && (
        <div
          data-over
          data-status-menu
          role="menu"
          className="fixed z-40"
          style={{
            left: inWindow(at.x, 220, at.r),
            top: at.y + 6,
            width: 220,
          }}
        >
          {/* Glass, like the calendar and for the same reason: `glass.md`
              names floating panels among the places it goes, and these
              menus are that object at a smaller size. */}
          <Glass data-fluid data-menu radius={16} className="overflow-hidden py-1">
            {/* A menu is a list of rows, so it lights like one — `Fluid`. */}
            <Fluid />
            {lists.map((l, i) => (
              <button
                key={l.id}
                role="menuitem"
                data-row
                data-status-pick={l.id}
                onClick={() => {
                  setAt(null)
                  onPick(l.id)
                }}
                className="flex w-full items-center gap-3 px-3 text-left text-base text-ink"
                style={{ height: 'var(--row-h)' }}
              >
                <Dot icon={l.icon} color={l.color} />
                <span className="min-w-px flex-1 truncate">{l.name}</span>
                {l.id === value && <Icon name="tasks" size={14} className="text-ink-2" />}
                <span className="shrink-0 text-sm text-ink-3">{i + 1}</span>
              </button>
            ))}
          </Glass>
        </div>
      )}
    </>
  )
}

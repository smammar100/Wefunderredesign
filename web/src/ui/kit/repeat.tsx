import { filled, weekdayOf, type Repeat } from '@tracker/shared-schema'
import { REPEAT as W, monthDay, repeatSaid, weekdayLong, weekdayNarrow } from '../../words/repeat.js'
import { Icon } from '../glyphs.jsx'
import { Glass } from '../Glass.jsx'
import { Fluid } from './rows.jsx'
import { Switch } from './controls.jsx'

/**
 * How a task repeats, set beside the month the due date is picked in.
 *
 * The rules the date suggests first, one press each, then the rule laid out
 * to change. One height whatever is chosen: the row under the units holds
 * the weekdays, the two month choices or a line saying the date, in the same
 * thirty-two pixels, so nothing moves under the pointer. A hairline above
 * that row and above the switch keeps the three parts apart — what repeats,
 * on which days, and from when — as the line above the stepper does.
 */

export const PANEL_WIDTH = 264
/** Tall enough for what it holds, said once so the opener can place it. */
export const PANEL_HEIGHT = 452

const UNITS = ['day', 'week', 'month', 'year'] as const
const same = (a: Repeat | null, b: Repeat | null) => JSON.stringify(a) === JSON.stringify(b)

/** What the date suggests, as the server would store each. */
function suggested(anchor: string): Repeat[] {
  const [, m, d] = anchor.split('-').map(Number)
  return [
    { every: 'day' },
    { every: 'week', weekdays: [weekdayOf(anchor)] },
    { every: 'week', weekdays: [1, 2, 3, 4, 5] },
    { every: 'month', day: d! },
    { every: 'month', day: -1 },
    { every: 'year', month: m!, day: d! },
  ]
}

export function RepeatPanel({
  value,
  anchor,
  said,
  at,
  onPick,
}: {
  value: Repeat | null
  /** The date it repeats from: the due date, or today without one. */
  anchor: string
  said: string
  at: { left: number; top: number }
  /** `close` when the choice is the whole answer — a suggestion, or none. */
  onPick: (rule: Repeat | null, close: boolean) => void
}) {
  const rule = value ? filled(value, anchor) : null
  const n = rule?.interval ?? 1
  const unit = rule?.every ?? 'week'
  /* A change to the laid-out rule starts from what is there, or from the
     date's own week when nothing repeats yet. */
  const base: Repeat = rule ?? { every: 'week', weekdays: [weekdayOf(anchor)] }
  const change = (to: Partial<Repeat>) => {
    const next = { ...base, ...to }
    if (next.interval === 1) delete next.interval
    onPick(filled(next, anchor), false)
  }
  const setUnit = (every: Repeat['every']) => {
    if (every === base.every) return
    const { weekdays: _w, day: _d, month: _m, ...rest } = base
    onPick(filled({ ...rest, every }, anchor), false)
  }
  const [, am, ad] = anchor.split('-').map(Number)

  return (
    <div
      data-over
      data-repeat-menu
      data-fluid
      role="dialog"
      aria-label={W.repeatOf(said)}
      className="fixed z-40"
      style={{ left: at.left, top: at.top, width: PANEL_WIDTH }}
      onClick={(e) => e.stopPropagation()}
    >
      <Glass radius={16} className="overflow-hidden p-2">
        <Fluid />
        <div role="menu">
          {[null, ...suggested(anchor)].map((r, i) => {
            const on = same(r, rule)
            return (
              <button
                key={i}
                data-row
                role="menuitemradio"
                aria-checked={on}
                data-repeat-choice={r ? JSON.stringify(r) : 'none'}
                onClick={() => onPick(r, true)}
                className="relative flex h-8 w-full items-center gap-2 px-2 text-left text-base text-ink"
                style={{ borderRadius: 'var(--r-row)' }}
              >
                <span className="flex w-4 shrink-0 justify-center text-accent-ink">{on && <Icon name="check" size={14} />}</span>
                <span className="truncate">{r ? repeatSaid(r) : W.never}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-2 flex flex-col gap-2 border-t px-1 pt-2" style={{ borderColor: 'var(--line)' }}>
          {/* Every N, and of what. */}
          <div className="flex h-8 items-center gap-2">
            <span className="text-base text-ink-2">{W.every(unit)}</span>
            <div className="ml-auto flex items-center">
              <Step label={W.fewer} disabled={n <= 1} onClick={() => change({ interval: Math.max(1, n - 1) })} />
              <span data-repeat-interval className="w-8 text-center text-base tabular-nums text-ink">
                {n}
              </span>
              <Step more label={W.more} disabled={n >= 99} onClick={() => change({ interval: Math.min(99, n + 1) })} />
            </div>
          </div>
          <div className="grid h-8 grid-cols-4 gap-1">
            {UNITS.map((u) => (
              <Chip key={u} on={rule !== null && unit === u} onClick={() => setUnit(u)} testId={`repeat-unit-${u}`}>
                {{ day: W.days, week: W.weeks, month: W.months, year: W.years }[u]}
              </Chip>
            ))}
          </div>
          {/* The one row that changes with the unit, always this tall — and
              never empty: nothing repeating yet offers the week's days, the
              way a weekly rule starts; a rule with nothing to choose here says
              itself, as the year's does. */}
          <div className="box-content flex h-8 items-center gap-1 border-t pt-2" style={{ borderColor: 'var(--line)' }}>
            {!rule ? (
              [1, 2, 3, 4, 5, 6, 7].map((w) => (
                <Chip
                  key={w}
                  on={false}
                  label={weekdayLong(w)}
                  testId={`repeat-weekday-${w}`}
                  onClick={() => change({ every: 'week', weekdays: [w] })}
                >
                  {weekdayNarrow(w)}
                </Chip>
              ))
            ) : rule.from === 'done' || unit === 'day' ? (
              <span data-repeat-said className="px-1 text-base text-ink-3">
                {repeatSaid(rule)}
              </span>
            ) : unit === 'week' ? (
              [1, 2, 3, 4, 5, 6, 7].map((w) => {
                const on = rule.weekdays?.includes(w) ?? false
                return (
                  <Chip
                    key={w}
                    on={on}
                    label={weekdayLong(w)}
                    testId={`repeat-weekday-${w}`}
                    onClick={() => {
                      const days = new Set(rule.weekdays ?? [])
                      if (on) days.delete(w)
                      else days.add(w)
                      /* Never none: the last day taken off stays. */
                      if (days.size) change({ weekdays: [...days].sort((a, b) => a - b) })
                    }}
                  >
                    {weekdayNarrow(w)}
                  </Chip>
                )
              })
            ) : unit === 'month' ? (
              <>
                <Chip on={rule.day !== -1} onClick={() => change({ day: ad! })} testId="repeat-month-day">
                  {W.onDay(rule.day !== -1 && rule.day ? rule.day : ad!)}
                </Chip>
                <Chip on={rule.day === -1} onClick={() => change({ day: -1 })} testId="repeat-month-last">
                  {W.lastDay}
                </Chip>
              </>
            ) : (
              <span className="px-1 text-base text-ink-3">{W.onDate(monthDay(rule.month ?? am!, rule.day ?? ad!))}</span>
            )}
          </div>
          <label
            className="box-content flex h-8 items-center justify-between gap-2 border-t pt-2 text-base text-ink-2"
            style={{ borderColor: 'var(--line)' }}
          >
            <span>{W.fromDone}</span>
            <Switch
              on={rule?.from === 'done'}
              said={W.fromDone}
              testId="repeat-from-done"
              onChange={(on) => {
                if (on) change({ from: 'done' })
                else {
                  const { from: _f, ...rest } = base
                  onPick(filled(rest, anchor), false)
                }
              }}
            />
          </label>
        </div>
      </Glass>
    </div>
  )
}

function Step({ label, disabled, onClick, more = false }: { label: string; disabled: boolean; onClick: () => void; more?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center bg-[var(--track)] text-ink-2 transition-colors mouse:hover:bg-[var(--badge)] disabled:opacity-40"
      style={{ borderRadius: 'var(--r-row)' }}
    >
      {/* Drawn, not typed: a − and a + set in the font sit on its
          baseline, a pixel or two off the button's middle. */}
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <path d={more ? 'M2 6h8M6 2v8' : 'M2 6h8'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function Chip({
  on,
  onClick,
  children,
  label,
  testId,
}: {
  on: boolean
  onClick: () => void
  children: React.ReactNode
  label?: string
  testId?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      data-testid={testId}
      onClick={onClick}
      className={`flex h-8 min-w-0 flex-1 items-center justify-center truncate px-1 text-sm transition-colors ${on ? '' : 'mouse:hover:bg-[var(--hover)]'}`}
      style={{
        borderRadius: 'var(--r-row)',
        background: on ? 'var(--accent)' : undefined,
        color: on ? 'var(--on-accent)' : 'var(--ink-2)',
      }}
    >
      {children}
    </button>
  )
}

/**
 * The mark a repeating task carries — the loop, and on a card and the task's
 * own screen the rule's words beside it. On a row the words are in the
 * label and the title: its date column has no room for them.
 */
export function RepeatMark({
  rule,
  words = true,
  glyph = true,
  size = 14,
}: {
  rule: Repeat
  words?: boolean
  /** Off where the place already wears the loop — a fact's own mark. */
  glyph?: boolean
  size?: number
}) {
  const said = repeatSaid(rule)
  return (
    <span data-repeat={said} title={said} aria-label={said} className="flex min-w-0 items-center gap-1 whitespace-nowrap">
      {glyph && <Icon name="repeat" size={size} />}
      {words && <span className="truncate">{said}</span>}
    </span>
  )
}

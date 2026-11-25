import { useId, useState, useRef, useEffect } from 'react'
import { KIT as W } from '../../words/kit.js'
import { Icon } from '../glyphs.jsx'
import { Glass } from '../Glass.jsx'
import { Over, Fluid } from './rows.jsx'
import { inWindow } from './labels.jsx'

/**
 * How urgent a task is, drawn.
 *
 * A hexagon in three bands that fill from the bottom: low, medium, high.
 * Urgent is not a fourth band: it is a different thing from "high, but
 * more", and it is the whole hexagon in the one warm colour the product
 * has — the same one a date that has arrived is drawn in, because both say
 * the same thing to whoever is reading the screen — with an exclamation
 * cut out of it, so whatever it stands on shows through in either theme.
 *
 * `null` draws the three bands unlit, which is what the control looks like
 * before anybody has answered. Where that is noise — a column of grey marks
 * down a list nobody has triaged — it is the caller that leaves it out, not
 * this.
 */
export const PRIORITIES = ['urgent', 'high', 'medium', 'low'] as const
export type Priority = (typeof PRIORITIES)[number]

export function PriorityMark({ value, size = 16 }: { value: Priority | null; size?: number }) {
  /* An id a `url(#…)` can name as it is: React's has colons in it. */
  const cut = `cut${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  if (value === 'urgent') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden style={{ display: 'block' }}>
        <mask id={cut}>
          <rect width="16" height="16" fill="#fff" />
          <path
            fill="#000"
            d="M8.9 4.65a.9.9 0 0 0-1.8 0V8.1a.9.9 0 0 0 1.8 0V4.65ZM8 12.45a1.05 1.05 0 1 0 0-2.1 1.05 1.05 0 0 0 0 2.1Z"
          />
        </mask>
        <path
          mask={`url(#${cut})`}
          d="M8 1.5 13.63 4.75v6.5L8 14.5l-5.63-3.25v-6.5L8 1.5Z"
          fill="var(--due)"
          stroke="var(--due)"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  /* Which of the three are lit, from the bottom. Unlit bands are drawn
     rather than left out: the mark is a gauge, and a gauge with its empty
     part missing is three different shapes instead of one filling up. */
  const lit = value === 'high' ? 3 : value === 'medium' ? 2 : value === 'low' ? 1 : 0
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden style={{ display: 'block' }}>
      {['M2.37 10.25h11.26v1L8 14.5l-5.63-3.25v-1Z', 'M2.37 6.75h11.26v2.5H2.37v-2.5Z', 'M8 1.5l5.63 3.25v1H2.37v-1L8 1.5Z'].map((d, i) => (
        <path key={d} d={d} fill="currentColor" opacity={i < lit ? 1 : 0.18} />
      ))}
    </svg>
  )
}

/** What each one is called, in the order it is read and picked. */
export const PRIORITY_SAID: Record<Priority, string> = {
  urgent: W.urgent,
  high: W.high,
  medium: W.medium,
  low: W.low,
}

export function PriorityPick({
  value,
  said,
  onPick,
  disabled = false,
  size = 16,
  className,
}: {
  /** `undefined` for several tasks at once: no one answer, so no tick —
      `null` would tick "No priority" over tasks that each have one. */
  value: Priority | null | undefined
  /** What this is the priority of, for whoever cannot see the mark. */
  said: string
  onPick: (to: Priority | null) => void
  disabled?: boolean
  /** Sized to what it stands beside: in a row of facts, the date's glyph. */
  size?: number
  className?: string
}) {
  const [at, setAt] = useState<{ x: number; y: number; r: number } | null>(null)
  const [warm, setWarm] = useState(false)
  const mark = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!at) return
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return setAt(null)
      if (!/^[0-4]$/.test(e.key)) return
      e.preventDefault()
      setAt(null)
      onPick(e.key === '0' ? null : PRIORITIES[Number(e.key) - 1]!)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [at, onPick])

  return (
    <>
      <button
        ref={mark}
        /* The word it is on, so one attribute both finds this control and
           says what it is showing. Empty for none. */
        data-priority={value ?? ''}
        aria-label={W.priorityOf(said)}
        aria-haspopup="menu"
        aria-expanded={at !== null}
        disabled={disabled}
        onClick={() => {
          if (at) return setAt(null)
          const box = mark.current?.getBoundingClientRect()
          if (box) setAt({ x: box.left, y: box.bottom, r: box.right })
        }}
        /* A mouse only. A finger's `pointerenter` fires on the tap and
           never leaves, so the brightening would stay on whatever was
           pressed last. */
        onPointerEnter={(e) => e.pointerType === 'mouse' && setWarm(true)}
        onPointerLeave={() => setWarm(false)}
        className={`relative flex size-5 shrink-0 items-center justify-center transition-colors before:absolute before:-inset-1 ${className ?? ''}`}
        /* Brighter under the pointer rather than on a ground of its own —
           the row already says where the hand is, and a second box inside
           it for one glyph is two answers to one question. */
        style={{ color: warm && !disabled ? 'var(--ink)' : 'var(--ink-3)' }}
      >
        <PriorityMark value={value ?? null} size={size} />
      </button>
      {/* The screen is the menu's while it is open — `Over`. Laid down
          before the menu, so the menu is the one thing above it. */}
      {at && <Over onClose={() => setAt(null)} />}
      {at && (
        <div
          data-over
          data-priority-menu
          role="menu"
          className="fixed z-40"
          style={{
            left: inWindow(at.x, 200, at.r),
            /* Flipped up when there is no room below, the way every other
               menu in here is: a picker on the last row of a long list
               opened under the fold and could not be read. */
            top: at.y + 6 + 5 * 36 > window.innerHeight ? undefined : at.y + 6,
            bottom: at.y + 6 + 5 * 36 > window.innerHeight ? window.innerHeight - at.y + 26 : undefined,
            width: 200,
          }}
        >
          {/* Glass, like the calendar and for the same reason: `glass.md`
              names floating panels among the places it goes, and these
              menus are that object at a smaller size. */}
          <Glass data-fluid data-menu radius={16} className="overflow-hidden py-1">
            <Fluid />
            {[...PRIORITIES, null].map((p, i) => (
              <button
                key={p ?? 'none'}
                role="menuitem"
                data-row
                data-priority-pick={p ?? 'none'}
                onClick={() => {
                  setAt(null)
                  onPick(p)
                }}
                className="flex w-full items-center gap-3 px-3 text-left text-base text-ink"
                style={{ height: 'var(--row-h)' }}
              >
                <span className="flex size-4 items-center justify-center text-ink-3">
                  <PriorityMark value={p} />
                </span>
                <span className="min-w-px flex-1 truncate">{p ? PRIORITY_SAID[p] : W.noPriority}</span>
                {value === p && <Icon name="tasks" size={14} className="text-ink-2" />}
                {/* The digit that picks it, where the eye already is. */}
                <span className="shrink-0 text-sm text-ink-3">{p ? i + 1 : 0}</span>
              </button>
            ))}
          </Glass>
        </div>
      )}
    </>
  )
}

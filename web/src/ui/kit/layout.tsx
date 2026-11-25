import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Whether there is room for the product's three columns.
 *
 * One breakpoint and one question — `docs/specs/narrow.md`. Below it the
 * navigation stops being a column: the sidebar folds into a drawer and a
 * project's tools go back to being tabs, because 248 and 212 pixels of
 * navigation are a luxury of width and on a tablet they left the work with
 * three hundred.
 *
 * A media query rather than a resize listener, so it answers once per
 * crossing rather than once per pixel, and it answers before the first paint
 * rather than after it.
 */
export const WIDE = '(min-width: 1024px)'

export function useWide(): boolean {
  const [wide, setWide] = useState(() => {
    try {
      return window.matchMedia(WIDE).matches
    } catch {
      // No matchMedia is a browser old enough that three columns is the
      // kinder guess.
      return true
    }
  })
  useEffect(() => {
    const q = window.matchMedia(WIDE)
    const said = (e: MediaQueryListEvent) => setWide(e.matches)
    q.addEventListener('change', said)
    return () => q.removeEventListener('change', said)
  }, [])
  return wide
}

/**
 * A phone, which is a different question from a narrow window.
 *
 * `WIDE` asks whether there is room for navigation beside the work. This
 * asks whether there is room for the work to have columns at all: at 390 a
 * task row gave its title thirty pixels and its facts two hundred and
 * thirty-six.
 *
 * Two breakpoints and not five, for the reason there was one: every
 * breakpoint is a layout somebody has to keep working. These two are the
 * two questions the product actually has.
 */
export const PHONE = '(max-width: 639px)'

export function usePhone(): boolean {
  const [phone, setPhone] = useState(() => {
    try {
      return window.matchMedia(PHONE).matches
    } catch {
      // No matchMedia is a browser old enough that the wider guess is kinder.
      return false
    }
  })
  useEffect(() => {
    const q = window.matchMedia(PHONE)
    const said = (e: MediaQueryListEvent) => setPhone(e.matches)
    q.addEventListener('change', said)
    return () => q.removeEventListener('change', said)
  }, [])
  return phone
}

/**
 * A width somebody chose, kept on their machine.
 *
 * In `localStorage` and not on the server, and that is the whole argument for
 * this being allowed at all: the design refuses settings, and it is right to —
 * but what it refuses is a team having to agree on an answer. How wide a
 * column is on a 13-inch laptop is not a question the team has an answer to.
 * It never leaves the device, so there is nothing to agree about.
 */
export function useWidth(key: string, initial: number, min: number, max: number) {
  const [width, setWidth] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(key))
      return saved >= min && saved <= max ? saved : initial
    } catch {
      // Private window, blocked storage: the default is a fine answer.
      return initial
    }
  })
  const set = useCallback(
    (next: number) => {
      const held = Math.min(max, Math.max(min, Math.round(next)))
      setWidth(held)
      try {
        localStorage.setItem(key, String(held))
      } catch {
        // Nothing to do and nothing to say: the column still moved.
      }
    },
    [key, min, max],
  )
  return { width, set, initial }
}

/**
 * The same width, with a rung below it where the column is glyphs.
 *
 * Under 150 it snaps to 56 and over 100 it comes back, and nothing stops in
 * between — at 150 a project called "Acme rebrand" is "Acm…", which is a
 * column nobody can use and a thing the product should not let somebody
 * make. `docs/specs/collapsed-sidebar.md`.
 *
 * The two thresholds differ on purpose: with one, a column left sitting
 * exactly on it flickers between the two states while the hand is still.
 *
 * The expanded width is remembered across the collapse, because it was
 * somebody's answer to how much room they wanted and collapsing is a
 * different question.
 */
/*
 * Fifty-six: a 32px glyph with twelve either side, which is the row's own
 * padding.
 */
export const SHUT = 56

/**
 * How long a column takes to change state — the sidebar shutting to its
 * glyphs and the project's column folding into it, on one curve
 * (`--ease-out`), so two columns moving at once move as one thing.
 */
export const COLUMN_MS = 200

export function useColumn(key: string, initial: number, min: number, max: number) {
  const { width, set, initial: start } = useWidth(key, initial, min, max)
  const [shut, setShut] = useState(() => {
    try {
      return localStorage.getItem(`${key}-shut`) === '1'
    } catch {
      return false
    }
  })
  /*
   * Whether the column is travelling between its two states.
   *
   * It shut in one frame: the drag that crossed the threshold was a held
   * hand, a held hand turns the transition off so the edge does not lag the
   * pointer, and so the one moment that is a change of state rather than a
   * change of size jumped from 150 to 56. The travel is on for the length
   * of the change and no longer — `docs/specs/collapsed-sidebar.md`,
   * "Shutting moves".
   */
  const [moving, setMoving] = useState(false)
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null)
  const travel = useCallback((yes: boolean) => {
    if (settle.current) clearTimeout(settle.current)
    setMoving(yes)
    if (yes) settle.current = setTimeout(() => setMoving(false), COLUMN_MS + 40)
  }, [])
  const close = useCallback(
    (yes: boolean, typed = false) => {
      /* A key's answer is not animated. */
      travel(!typed)
      setShut(yes)
      try {
        localStorage.setItem(`${key}-shut`, yes ? '1' : '0')
      } catch {
        // Private window: the column still moved, it just will not be
        // this way tomorrow.
      }
    },
    [key, travel],
  )

  /*
   * Where it was before it was shut, so reopening gives it back.
   *
   * `useWidth` clamps to its own minimum, so by the time a drag reached the
   * collapse it had already overwritten 248 with 200 on the way down — and
   * the column came back sitting right against the threshold, one small
   * movement from shutting again. That is the "it cannot decide" this had:
   * not a flicker, a column that always returned to the edge of the cliff.
   */
  const was = useRef<number | null>(null)
  /* Whether a hand is on the handle. */
  const [held, setHeld] = useState(false)

  /*
   * What a drag to `next` means, which is sometimes a state and not a size.
   *
   * The two thresholds are far apart on purpose — 150 to shut and 190 to
   * open — and that gap is the whole mechanism. Inside it nothing happens,
   * so a hand resting near the edge does not make the column argue with
   * itself, and one gesture can shut it and open it again without letting
   * go: crossing back takes a deliberate forty pixels rather than a jitter.
   *
   * An earlier version locked the gesture after the first flip instead.
   * That killed the judder and made the column impossible to bring back
   * without releasing the button, which is a worse answer to a smaller
   * problem. `docs/specs/collapsed-sidebar.md`.
   */
  const drag = useCallback(
    (next: number, typed = false) => {
      if (shut) {
        if (next > 190) {
          /* The width it had, not the one under the hand: the hand is at
             190 and the column was 248. */
          if (was.current !== null) set(was.current)
          close(false, typed)
        }
        return
      }
      if (next < 150) {
        /* Remembered before the collapse, because `set` would clamp it to
           the minimum and the number worth keeping is the one somebody
           chose. */
        was.current = width
        close(true, typed)
        return
      }
      set(next)
    },
    [shut, close, set, width],
  )

  return {
    width: shut ? SHUT : width,
    shut,
    held,
    /** Travelling between shut and open, so the width eases rather than jumps. */
    moving,
    drag,
    done: () => setHeld(false),
    grab: () => setHeld(true),
    reset: (typed = false) => (close(false, typed), set(start)),
  }
}

/**
 * The edge between two columns, and the way to move it.
 *
 * A one-pixel line to look at and a ten-pixel band to catch, because a
 * one-pixel target is one nobody hits on the first try. Capture is taken on
 * the handle itself: it moves while it is being dragged, and without capture
 * the pointer leaves it after the first few pixels and the drag stops dead.
 *
 * Double-click puts it back. Focused, the arrow keys move it — a column width
 * that can only be set by dragging is one a person who cannot drag is stuck
 * with.
 */
export function Resizer({
  width,
  onChange,
  onReset,
  /** The gesture ended — `useColumn` uses it to arm the next one. */
  onDone,
  /** And began, which is what tells the column not to animate. */
  onGrab,
  min,
  max,
  label,
  side = 'right',
}: {
  width: number
  /** `key` when an arrow said it, which is answered without travel. */
  onChange: (n: number, key?: boolean) => void
  onReset: (key?: boolean) => void
  onDone?: () => void
  onGrab?: () => void
  min: number
  max: number
  label: string
  /** Which edge of its column it stands on. A column on the right of the
      window grows to the left, so there a drag left and ← widen it. */
  side?: 'left' | 'right'
}) {
  const toward = side === 'left' ? -1 : 1
  const from = useRef<{ x: number; width: number } | null>(null)
  const [live, setLive] = useState(false)

  /* The whole window is being dragged on, so the whole window says so — and
     stops selecting the text the pointer crosses on the way. */
  useEffect(() => {
    if (!live) return
    const body = document.body
    const cursor = body.style.cursor
    const select = body.style.userSelect
    body.style.cursor = 'col-resize'
    body.style.userSelect = 'none'
    return () => {
      body.style.cursor = cursor
      body.style.userSelect = select
    }
  }, [live])

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      data-resizer={label}
      className={`group/resizer absolute inset-y-0 z-20 w-3 cursor-col-resize ${side === 'left' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}`}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        from.current = { x: e.clientX, width }
        e.currentTarget.setPointerCapture(e.pointerId)
        setLive(true)
        onGrab?.()
      }}
      onPointerMove={(e) => {
        if (!from.current) return
        onChange(from.current.width + toward * (e.clientX - from.current.x))
      }}
      onPointerUp={() => {
        from.current = null
        setLive(false)
        onDone?.()
      }}
      onPointerCancel={() => {
        from.current = null
        setLive(false)
        onDone?.()
      }}
      onDoubleClick={() => onReset()}
      onKeyDown={(e) => {
        /* Shift for the long way, as every slider does. */
        if (e.key === 'ArrowLeft') onChange(width - (e.shiftKey ? 64 : 16) * toward, true)
        else if (e.key === 'ArrowRight') onChange(width + (e.shiftKey ? 64 : 16) * toward, true)
        else if (e.key === 'Enter' || e.key === ' ') onReset(true)
        else return
        e.preventDefault()
      }}
    >
      {/*
        The line, drawn down the middle of the band it is caught by — and
        only while somebody is reaching for it.
        
        It used to stand there always, which was right when the columns were
        regions of one surface and a rule was the only thing dividing them.
        They are sheets with a gap between them now, so the line sits inside
        the sheet's own edge and reads as a stray stroke down the side of a
        card. The gap says where the column ends; the handle only has to say
        where to take hold of it, which is a thing you need to know when
        your hand is already there.
        
        The group is the band, not the line: the band is ten pixels wide and
        the line is one, so a hover the line itself answered would be a
        target nobody hits. And it shows on focus too — the handle takes the
        keyboard, and an arrow key that moves something invisible is a
        control somebody cannot tell they are holding.
      */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 opacity-0 transition-[background-color,opacity] on-resizer-hover:opacity-100 group-focus-visible/resizer:opacity-100"
        style={{
          background: live ? 'var(--accent)' : 'var(--line-strong)',
          ...(live ? { opacity: 1 } : {}),
        }}
      />
    </div>
  )
}

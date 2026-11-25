import { useState, useRef, useEffect, useCallback, Fragment, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { KIT as W } from '../../words/kit.js'
import { type IconName, Icon } from '../glyphs.jsx'
import { isKey } from '../../data/keys.js'
import { Fluid } from './rows.jsx'
import { Badge } from './controls.jsx'
import { findField } from './fields.jsx'

export function useListKeys<T>(items: T[], onOpen: (item: T) => void): { at: number; setAt: (n: number) => void } {
  /*
   * Nobody, until somebody says so.
   *
   * It started on the first row, so every list opened with one line lit for
   * no reason a person could point at: nothing had been pressed, nothing
   * hovered, and the highlight read as "this one is special" on whatever
   * happened to be first. A cursor is where somebody put it, and before they
   * put it anywhere there is no cursor.
   *
   * The arithmetic below already lands on the first row from here: `min(-1 +
   * 1, …)` and `max(-1 - 1, 0)` are both 0, so the first Down or Up picks up
   * the top. Enter finds nothing at -1 and does nothing, which is right —
   * there is nothing to open.
   *
   * The pointer still moves it, so Down after hovering a row carries on from
   * that row rather than from the top — and the screens put it back to -1
   * when the pointer leaves the list, so the highlight goes out with the
   * hand rather than staying behind it.
   */
  const [at, setAt] = useState(-1)
  const ref = useRef({ items, onOpen })
  ref.current = { items, onOpen }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      const { items: list, onOpen: open } = ref.current
      if (list.length === 0) return

      if (e.key === 'ArrowDown' || isKey(e, 'j')) {
        e.preventDefault()
        setAt((i) => Math.min(i + 1, list.length - 1))
      }
      if (e.key === 'ArrowUp' || isKey(e, 'k')) {
        e.preventDefault()
        setAt((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter') {
        const item = list[Math.min(at, list.length - 1)]
        if (item !== undefined) {
          e.preventDefault()
          open(item)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [at])

  // A list that changed under the cursor must not leave it past the end.
  useEffect(() => {
    setAt((i) => Math.min(i, Math.max(items.length - 1, 0)))
  }, [items.length])

  return { at, setAt: useCallback((n: number) => setAt(n), []) }
}

/**
 * A row of pills on a track: the tabs, and the list/board switch.
 *
 * One component for both because they are one thing — a set where exactly one
 * is chosen — and drawing them separately is how a product ends up with two
 * shapes for the same idea. The selected one is lifted off the track by a
 * hair of shadow, the way a physical switch sits proud of its slot.
 */
/**
 * A row that scrolls sideways, and says so.
 *
 * Six project tabs do not fit a phone — glyphs alone are 268px before the
 * open one has said its name, and an iPhone SE is 320. The row has always
 * scrolled; nothing said it did, so three of the six were simply not there
 * as far as anybody could tell.
 *
 * A mask on the scroller itself, not an element inside it. Four attempts
 * went the other way and each failed differently: a gradient outside the
 * bar is the page's colour over the bar's, one inside it scrolls away with
 * the content, `sticky` inside a flex row stands where the order puts it
 * rather than at the edge, and the bar's own `--track` is five percent
 * black — a veil the tabs show straight through.
 *
 * A mask has none of those problems because it is not a thing in the
 * layout. It fades what is already there, in whatever colour that is, over
 * whatever is behind it, and it cannot be in the wrong place because it is
 * the element's own paint.
 */
export function useSideFade(): (el: HTMLDivElement | null) => void {
  const [row, setRow] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const b = row
    if (!b) return
    let frame = 0
    const measure = () => {
      /* A pixel of slack, as the bars and the column fade use: a row that
         overflows by less than one is a rounding error. */
      const left = b.scrollLeft > 1
      const right = b.scrollWidth - b.clientWidth - b.scrollLeft > 1
      /* Transparent at an edge there is more past, opaque at one there is
         not — so a row that fits is not masked at all. */
      const stops = [left ? 'transparent' : 'black', 'black 32px', `black calc(100% - 32px)`, right ? 'transparent' : 'black'].join(', ')
      b.style.maskImage = left || right ? `linear-gradient(to right, ${stops})` : ''
      b.style.webkitMaskImage = b.style.maskImage
    }
    const soon = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    measure()
    b.addEventListener('scroll', soon, { passive: true })
    /* The row's width and what is in it both change the answer — a tab
       gaining its word when it opens is the second, which a resize observer
       alone never hears. */
    const size = new ResizeObserver(soon)
    size.observe(b)
    const inside = new MutationObserver(soon)
    inside.observe(b, { childList: true, subtree: true, characterData: true })
    return () => {
      cancelAnimationFrame(frame)
      b.removeEventListener('scroll', soon)
      size.disconnect()
      inside.disconnect()
    }
  }, [row])

  /*
   * A callback ref rather than one handed in.
   *
   * The row is only drawn below 1024 — above it the tabs are a column — so
   * a `useRef` passed to this hook is null when the effect first runs and
   * the effect never runs again, because a ref changing is not a render.
   * The measurement then never happens on the one screen it is for.
   *
   * A callback ref is called with the node when it arrives and with null
   * when it goes, which is exactly when this wants to know.
   */
  return setRow
}

export function Segments<T extends string>({
  items,
  value,
  onPick,
  fill = false,
  className = '',
  /** Drop the words below 640 and keep the open one. */
  glyphsWhenNarrow = false,
}: {
  items: {
    key: T
    label: string
    icon?: IconName
    testId?: string | undefined
    /** Anything else the row should carry, for the things that address it. */
    attrs?: Record<string, string> | undefined
    /** A line before this one, for an item that answers a different question. */
    apart?: boolean
    /** What is waiting behind this one, when the choices are places to go. */
    count?: number | undefined
  }[]
  value: T
  onPick: (key: T) => void
  /** Take the width given, sharing it evenly — for a column that resizes. */
  fill?: boolean
  /** Where it stands in the row it is in, which is the caller's to say. */
  className?: string
  glyphsWhenNarrow?: boolean
}) {
  const even = fill && !items.some((it) => it.apart)
  const chosen = items.findIndex((it) => it.key === value)
  return (
    <div
      data-fluid
      className={`relative flex items-start gap-1 p-1 ${fill ? 'w-full' : 'w-max shrink-0'} ${className}`}
      style={{ background: 'var(--track)', borderRadius: 'var(--r-pill)' }}
    >
      {/*
        The chip slides to the answer rather than being redrawn on it.
        
        It was a background on whichever button was on, so choosing was the
        old one going out and the new one coming in — two things where the
        eye expects one to move. Pinned to the answer and not to the pointer,
        because that is what a segmented control says: this one, of these.
      */}
      {/*
        Shared evenly, the chip is drawn by the stylesheet alone: a share of
        the track wide and moved by its place, so it sits four from the
        track on every side whatever the track does after the press. It was
        measured, and a window's body that grew a scrollbar after the press
        narrowed the track under a chip that had been measured wider — New
        conversation and Notifications lost the inset at one end. Sized by
        what they say, the halves do not follow the track, and the measured
        chip stays (and measures again when the track changes size).
      */}
      {even ? (
        <span
          data-glow
          aria-hidden
          className="pointer-events-none absolute top-1 bottom-1 left-1"
          style={{
            width: `calc((100% - ${8 + 4 * (items.length - 1)}px) / ${items.length})`,
            transform: `translateX(calc(${Math.max(0, chosen)} * (100% + 4px)))`,
            opacity: chosen < 0 ? 0 : 1,
            background: 'var(--track-on)',
            boxShadow: 'var(--segment-shadow)',
            borderRadius: 'var(--r-pill)',
            transition: 'transform 140ms var(--ease-out)',
          }}
        />
      ) : (
        <Fluid pinned="[data-on]" tone="chip" />
      )}
      {items.map((it) => {
        const on = it.key === value
        return (
          <Fragment key={it.key}>
            {/* One row of choices, and a line where the question changes.
              Without it the last item reads as one more of the things before
              it, which is exactly what it is not. */}
            {it.apart && <span aria-hidden className="mx-1 my-1 w-px self-stretch bg-line" />}
            <button
              data-testid={it.testId}
              data-pick={it.key}
              data-on={on || undefined}
              type="button"
              {...(it.attrs?.role ? {} : { 'aria-pressed': on })}
              /* The one that is not the answer lights under the pointer, the
               way every other pressable thing does. The chip is the answer,
               and an answer does not need saying twice. */
              {...(on ? {} : { 'data-control': '' })}
              {...it.attrs}
              onClick={() => onPick(it.key)}
              className={`relative flex h-7 items-center gap-2 text-base font-medium ${
                fill ? 'min-w-0 flex-1 justify-center px-1' : 'shrink-0'
              } ${it.icon ? 'pr-3 pl-3' : fill ? '' : 'px-3'}`}
              style={{
                /* Twelve at the sides of the words, as it always was.
                 took it to eight once, reading "the tabs are padded more at
                 the sides" as the chip's own padding; we meant the
                 track's, which is the `p-1` above — four on every side, so
                 the chip sits as far from the track's top as from its ends.
                 The chosen tab is left as it was.

                 The pill, not the card: these sit inside a pill-shaped
                 track and are 28 tall, so a 16 radius left them with flat
                 sides inside round ones. The travelling chip copies this
                 number off whichever button is on, so it is the only
                 place to say it. */
                borderRadius: 'var(--r-pill)',
                letterSpacing: 'var(--track-body)',
                color: on ? 'var(--ink)' : 'var(--ink-2)',
              }}
            >
              {it.icon && <Icon name={it.icon} size={16} />}
              {/*
               * The word, unless the caller says there is no room for it.
               *
               * Six project tabs with their names are 700px and the phone is
               * 390: they scrolled sideways and nothing said so, which is
               * three of the six simply not being there. Glyphs alone fit, and
               * the open one keeps its word so the row still says where you
               * are.
               *
               * Asked for rather than applied to every `Segments`: two
               * segments with short names fit on any phone, and taking their
               * words away makes a switch nobody can read.
               */}
              {glyphsWhenNarrow && it.icon ? (
                <>
                  <span className="hidden sm:inline">{it.label}</span>
                  {/*
                   * The open one keeps its word, whatever that costs the
                   * row: the row scrolls, and the word is how somebody knows
                   * where they are without reading six glyphs.
                   */}
                  {value === it.key && <span className="sm:hidden">{it.label}</span>}
                </>
              ) : (
                it.label
              )}
              {/* What is waiting behind this choice, when the choices are
                rooms rather than ways of looking at one thing. The same
                badge the sidebar and the tabs draw: a tab that says there
                is something in Chat and a room strip that will not say
                which room reads as a number that is stuck. */}
              {it.count ? <Badge count={it.count} /> : null}
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}

/**
 * Where a screen puts the controls that belong on the project's own bar.
 *
 * The list/board switch and the create button belong to the tasks screen and
 * are drawn on the row above it, which the project owns. Passing them up
 * through props would mean the project knowing what every tool needs; a slot
 * lets the tool put them there itself and nobody hold the other's controls.
 */
const Slot = createContext<HTMLElement | null>(null)
export const ToolbarSlot = Slot.Provider

export function Toolbar({ children }: { children: React.ReactNode }) {
  const node = useContext(Slot)
  return node ? createPortal(children, node) : null
}

/**
 * Narrowing the screen it is on: a magnifier that opens into a field.
 *
 * Not a second search — the palette looks across the workspace, this only
 * narrows the room, the Docs or the feed in front of you, so it holds no
 * results of its own. While it holds words it stays open, so a narrowed
 * screen always shows why. Escape empties it and closes it.
 * `docs/specs/find.md`.
 */
export function Find({
  value,
  onChange,
  label,
  testId,
  quiet = false,
}: {
  value: string
  onChange: (v: string) => void
  /** What it narrows, said in the empty field: "Find in this room". */
  label: string
  testId: string
  /** Bare, beside other bare marks — a room's head — rather than a round
      button on a tool's bar. */
  quiet?: boolean
}) {
  const [open, setOpen] = useState(false)
  const field = useRef<HTMLInputElement>(null)
  const shown = open || value !== ''
  useEffect(() => {
    if (open) field.current?.focus()
  }, [open])
  /* Emptied from outside — a found message opened — while the hand is
     elsewhere: back to the magnifier. */
  useEffect(() => {
    if (value === '' && document.activeElement !== field.current) setOpen(false)
  }, [value])
  const shut = () => {
    onChange('')
    setOpen(false)
  }
  /*
   * One element, open or shut, so opening is the magnifier growing into the
   * field rather than a button swapped for a field a size larger — which
   * jumped: the bare one was 32 tall and the field 36, and the marks beside
   * it moved. The same height either way; the width is what changes, over
   * one fifth of a second (`[data-find]` in the theme).
   */
  const side = quiet ? 32 : 36
  return (
    <label
      data-find
      data-open={shown || undefined}
      onClick={() => !shown && setOpen(true)}
      className={`flex shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-full ${
        shown ? 'min-w-px shrink cursor-text pr-1 max-sm:!w-auto max-sm:flex-1' : 'justify-center'
      } ${quiet && !shown ? 'mouse:hover:bg-[var(--hover)]' : ''} text-ink-2`}
      style={{
        width: shown ? 240 : side,
        height: side,
        paddingLeft: shown ? 12 : 0,
        background: shown || !quiet ? 'var(--track)' : undefined,
      }}
    >
      {shown ? (
        <Icon name="search" size={15} style={{ flexShrink: 0 }} />
      ) : (
        <button
          type="button"
          data-control
          data-testid={testId}
          aria-label={label}
          title={label}
          className="flex size-full shrink-0 items-center justify-center"
        >
          <Icon name="search" size={15} />
        </button>
      )}
      {shown && (
        <>
          <input
            {...findField}
            ref={field}
            data-testid={`${testId}-field`}
            aria-label={label}
            placeholder={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                e.stopPropagation()
                shut()
              }
            }}
            /* Left with nothing in it, it closes: an empty open field is a
               control that narrows nothing. */
            onBlur={() => value === '' && setOpen(false)}
            className="min-w-px flex-1 bg-transparent text-base outline-none placeholder:text-[var(--ink-3)]"
            style={{ color: 'var(--ink)' }}
          />
          <button
            type="button"
            aria-label={W.clear}
            data-testid={`${testId}-clear`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault()
              shut()
            }}
            className={`flex shrink-0 items-center justify-center rounded-full mouse:hover:bg-[var(--hover)] ${quiet ? 'size-6' : 'size-7'}`}
          >
            <Icon name="close" size={12} />
          </button>
        </>
      )}
    </label>
  )
}

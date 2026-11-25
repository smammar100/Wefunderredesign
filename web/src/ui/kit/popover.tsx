import { useState, useRef, useLayoutEffect, useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { BAR, MORE } from '../../data/words.js'
import { Icon } from '../glyphs.jsx'
import { asHours } from '../../data/hours.js'
import { usePhone } from './layout.jsx'
import { Over, Fluid } from './rows.jsx'
import { Segments } from './lists.jsx'

/* --------------------------------------------------------------- popover */

/**
 * A panel hung off its own button.
 *
 * Anchored to the button rather than to the screen, because several of these
 * sit on a bar that is portalled into the project's chrome — a panel
 * positioned against the content below would open a column away from the
 * thing that opened it.
 *
 * Closing is bound on `pointerdown`, captured, so a click on something that
 * stops propagation still shuts it. Escape closes it from anywhere, which is
 * the key everybody presses to get out of something.
 */
/**
 * How long a surface takes to arrive, and the same to leave.
 *
 * Two numbers, and what separates them is distance rather than taste:
 * `SHOWING` is a thing appearing where it already is — a menu under the
 * button that opened it — and `SLIDING` is a panel travelling its own width
 * in from the edge it lives on. The same speed over three hundred pixels is
 * a different length of time, and one number for both means either the menu
 * is slow or the panel is flicked.
 *
 * Both are under the 300ms at which a piece of interface starts reading as
 * slow, and above the point where it reads as a repaint rather than as
 * something moving.
 *
 * Each goes out at the speed it came in. Quicker on the way out is a common
 * trick and it is wrong here for the same reason the path is the same: the
 * surface is one object, and an object that leaves faster than it arrives
 * is two.
 */
export const SHOWING = 150
export const SLIDING = 240

/**
 * Kept in the document for as long as it takes to leave.
 *
 * React unmounts the moment the flag goes false, so a panel that was told to
 * animate out was gone before the first frame of it — everything in this
 * product appeared and disappeared between frames. This holds the node while
 * it plays its way out and hands back the two things the caller needs: `there`
 * to render at all, and `shown` for the values it transitions between.
 *
 * Transitions and not keyframes, which is the whole reason this is a state
 * flag rather than an animation: pressing the button again halfway out
 * retargets from where the surface actually is. A keyframe restarts from its
 * first frame, so a panel caught on the way out jumps back to small and grows
 * again — the one moment somebody is looking straight at it.
 *
 * **The `ref` goes on the surface itself**, and it is not optional: it is how
 * opening starts in the frame of the press rather than a frame and a half
 * after it.
 */
export function useShown(open: boolean, ms: number): { there: boolean; shown: boolean; ref: React.RefObject<HTMLDivElement | null> } {
  const [there, setThere] = useState(open)
  /* Starts at whatever it was born as, so a panel that is open when the
     screen is drawn is simply open. A screen that animates itself together
     on the way in is a screen being assembled rather than shown. */
  const [shown, setShown] = useState(open)
  const node = useRef<HTMLDivElement | null>(null)

  /*
   * Opening puts it in the document in this same commit.
   *
   * Setting state while rendering makes React run this component again
   * before it commits, so the surface is painted once at its "from" values
   * and the transition has somewhere to travel from. Left to an effect, the
   * node arrives a frame later already at its final values and simply
   * appears — which is the thing being fixed.
   */
  if (open && !there) setThere(true)
  /*
   * Shutting starts in this same render as well, and for the opposite
   * reason: it has been sitting at the values it is leaving from for as
   * long as it has been open, so there is nothing to paint first. Left to
   * the effect, the frame after the press is a frame in which nothing
   * happens — which is most of what "it does not feel smooth" is.
   */
  if (!open && shown) setShown(false)

  /*
   * The from-values are made real, and then replaced, inside one frame.
   *
   * A transition needs the browser to have worked out where the surface is
   * before it is told where to go. Waiting a frame for that is a frame in
   * which the press did nothing — 26ms measured, which is exactly the lag
   * that stops an interface feeling direct. Reading the box forces the
   * from-values to be resolved now; setting state from a layout effect
   * re-renders before the paint, so the to-values land in the same frame and
   * the browser has both. This is the one place in the product that touches
   * the DOM to make the renderer behave, and it is why the ref is required.
   */
  useLayoutEffect(() => {
    if (!open || shown) return
    node.current?.getBoundingClientRect()
    setShown(true)
  }, [open, shown])

  useEffect(() => {
    if (open) return
    // Cleared by this effect's own cleanup if it opens again first, so a
    // reopened panel is never unmounted by the leave it interrupted.
    const t = setTimeout(() => setThere(false), ms)
    return () => clearTimeout(t)
  }, [open, ms])

  return { there, shown, ref: node }
}

export function Popover({
  label,
  said,
  width = 300,
  align = 'left',
  shape = 'pill',
  testId,
  sheet = true,
  inline = false,
  open: held,
  onOpenChange,
  fit = false,
  panelLabel,
  children,
}: {
  /**
   * The button's face. Says what is on, so the panel need not be opened.
   * `null` draws no button: the panel is opened from somewhere else — a
   * long press on a message — through `open`.
   */
  label: React.ReactNode | null
  /** What the button is called, for a face that is a picture and no words. */
  said?: string
  width?: number
  /**
   * Which edge the panel hangs from.
   *
   * A panel is wider than the button that opens it, so it has to grow into
   * the screen rather than off it: from the left for a button on the left of
   * a bar, from the right for one on the right.
   */
  align?: 'left' | 'right'
  /**
   * `bare` hands the face to the caller.
   *
   * The pill is what a button on a bar looks like, and one floating over the
   * work is a different shape with a material behind it. Rather than teach
   * this component about either, `bare` draws no chrome at all and keeps the
   * one thing it is for: opening, and knowing when to shut.
   */
  shape?: 'pill' | 'bare'
  testId?: string
  /**
   * Whether a phone gets it as a sheet from the foot of the screen. A menu
   * of two short rows under a button in a corner is better as what it is
   * on a desk — the sheet is for answers a thumb has to reach many of.
   */
  sheet?: boolean
  /**
   * A `bare` face that stands in a line of text — a heading that is its own
   * menu. Inline, so the line keeps its baseline: a block button inside a
   * heading broke the line in two and moved the words.
   */
  inline?: boolean
  /**
   * Opened and shut from outside, for a panel that has no button of its
   * own. Left out, the button opens it and the panel keeps its own state.
   */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * A phone's sheet the height of what it holds, up to the four fifths
   * every sheet opens at. For an action sheet over a message: the message
   * the actions are about has to stay in view above it, and a sheet drawn
   * tall covers it with glass that holds nothing.
   */
  fit?: boolean
  /** What the panel is called, for one opened without a button to name it. */
  panelLabel?: string
  children: (close: () => void) => React.ReactNode
}) {
  const phone = usePhone() && sheet
  const [own, setOwn] = useState(false)
  const open = held ?? own
  const latest = useRef(open)
  latest.current = open
  const setOpen = useCallback(
    (next: boolean | ((was: boolean) => boolean)) => {
      const v = typeof next === 'function' ? next(latest.current) : next
      if (held === undefined) setOwn(v)
      onOpenChange?.(v)
    },
    [held, onOpenChange],
  )
  /*
   * How far down the sheet has been dragged, in pixels.
   *
   * `null` while nothing is holding it, so the transition can be on for
   * the arrival and off for the drag: a sheet that eases toward the finger
   * lags behind it, and a sheet that snaps back without easing jumps.
   */
  const [drag, setDrag] = useState<number | null>(null)
  const from = useRef(0)
  const { there, shown, ref } = useShown(open, SHOWING)
  const box = useRef<HTMLSpanElement>(null)
  /*
   * Where the button is, because the panel is drawn out of the page.
   *
   * It used to hang off the button as an absolutely positioned child, which
   * works until the button is inside something that clips — and `Panel`
   * clips, because that is how its corners are round. Put the time picker in
   * a task's facts panel and the menu opened, twenty rows of it, entirely
   * invisible. `aria-expanded` said true and there was nothing on the screen.
   *
   * So it goes to the body and is placed from the button's own rectangle.
   * Fixed rather than absolute, like the status menu, which has the same job
   * and the same answer: it closes on a press outside, so it is never open
   * long enough for a scroll to carry it away from what it belongs to.
   */
  const [at, setAt] = useState<{
    left: number
    top: number
    tall: number
    from: 'top' | 'bottom'
  } | null>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref is the opener's, listed so a popover moved to another opener is placed again
  useEffect(() => {
    if (!open) return setAt(null)
    /*
     * And it has to fit on the screen.
     *
     * Hanging off the button it was clipped by whatever contained it, which
     * was wrong and at least bounded. Out of the page it is bounded by
     * nothing: a menu opened near the foot of the window ran off the bottom
     * with no way to reach the rest of it.
     *
     * Below when there is room, above when there is not, and never taller
     * than the room it has — a menu that scrolls is a menu, and one drawn
     * past the edge is a menu with rows nobody can reach.
     */
    const place = () => {
      const b = box.current?.getBoundingClientRect()
      if (!b) return
      const gap = 6
      const edge = 12
      const under = window.innerHeight - b.bottom - gap - edge
      const over = b.top - gap - edge
      const above = under < 200 && over > under
      setAt({
        left: Math.max(edge, Math.min(align === 'right' ? b.right - width : b.left, window.innerWidth - width - edge)),
        top: above ? b.top - gap : b.bottom + gap,
        tall: Math.max(120, above ? over : under),
        from: above ? 'bottom' : 'top',
      })
    }
    place()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', key)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('keydown', key)
      window.removeEventListener('resize', place)
    }
  }, [open, align, width, ref, setOpen])

  return (
    <span ref={box} className="relative shrink-0">
      {label === null ? null : shape === 'bare' ? (
        <button
          data-testid={testId}
          aria-expanded={open}
          {...(said ? { 'aria-label': said, title: said } : {})}
          onClick={() => setOpen((v) => !v)}
          className={inline ? 'inline-flex max-w-full' : 'flex shrink-0'}
        >
          {label}
        </button>
      ) : (
        <button
          data-testid={testId}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-7 shrink-0 items-center gap-2 pr-2 pl-3 text-base font-medium bg-track text-ink"
          style={{
            borderRadius: 'var(--r-row)',
            letterSpacing: 'var(--track-body)',
          }}
        >
          {label}
          <Icon name="updown" size={14} className="text-ink-2" />
        </button>
      )}
      {/* The screen is the menu's while it is open — `Over`. In the page
          rather than beside the panel: the panel is drawn out of the page,
          and a sheet left behind in a row is a sheet inside whatever clips
          that row. */}
      {there && at && createPortal(<Over onClose={() => setOpen(false)} />, document.body)}
      {there &&
        at &&
        createPortal(
          <div
            ref={ref}
            /* Scrolls as a sheet, because it is as tall as its answers and
             the screen decides how much of that fits: at 390 the panel ran
             past the foot and `Reset` was under the edge with no way to
             reach it. On a laptop it is sized to fit and has nothing to
             scroll. */
            className={`fixed z-40 ${phone ? 'overflow-y-auto overscroll-contain' : 'overflow-hidden'}`}
            data-over
            data-popover
            {...(panelLabel ? { role: 'dialog', 'aria-label': panelLabel } : {})}
            /* Its own surface, not the list's. `Panel` is the ground a group of
             rows sits on; hung over the work it read as see-through, because
             it is the same grey as the thing behind it. A floating panel has
             to be a layer: opaque, raised, with an edge. */
            style={{
              /*
               * A sheet from the foot of the screen on a phone.
               *
               * A panel hung off its button is right where there is room
               * beside it. On 390 there is none: it opened in the top
               * corner, as wide as the phone minus a margin and nearly as
               * tall, and the "menu" was a second screen pretending to be
               * one. It also put the answers at the far end of the reach of
               * whichever hand is holding the thing.
               *
               * So below 640 it comes up from the bottom, full width,
               * cornered at the top only — the shape that says the rest of
               * it is off-screen rather than that it is a card somebody has
               * placed.
               */
              ...(phone
                ? {
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 'auto' as const,
                    /* Opened at four fifths of the screen, not at the height
                     of its contents: a sheet that rises to whatever it holds
                     opened a different height for every menu, often a short
                     strip at the very foot, and read as a toast more than a
                     place to choose in. TRA-96. */
                    ...(fit ? { maxHeight: '80dvh' } : { height: '80dvh' }),
                    width: 'auto' as const,
                  }
                : {
                    left: at.left,
                    ...(at.from === 'bottom' ? { bottom: window.innerHeight - at.top } : { top: at.top }),
                    maxHeight: at.tall,
                    width,
                  }),
              /* Glass as a sheet, the way the calendar and the pickers are
               glass: `glass.md` names floating panels, and a sheet over
               the work is the largest one of those. The lens is the one in
               the tokens, applied here rather than through `Glass` because
               the panel is also the scroll container and the drag target,
               and splitting those across two boxes is two things to keep
               in step. */
              background: phone ? 'var(--glass-tint)' : 'var(--surface)',
              backdropFilter: phone ? 'blur(var(--glass-blur)) saturate(var(--glass-saturate))' : undefined,
              WebkitBackdropFilter: phone ? 'blur(var(--glass-blur)) saturate(var(--glass-saturate))' : undefined,
              /* Cornered at the top only: the foot of it is the foot of the
               screen, and a rounded corner there draws a card floating on
               nothing. */
              borderRadius: phone ? 'var(--r-panel) var(--r-panel) 0 0' : 'var(--r-card)',
              boxShadow: phone ? 'var(--glass-shadow)' : 'var(--float-shadow)',
              border: 'none',
              borderTop: phone ? '1px solid var(--glass-edge)' : undefined,
              /*
               * It grows from the button that opened it, so it comes from
               * somewhere rather than appearing over the work.
               *
               * From 0.97 and never from nothing: things in the world do not
               * come out of a point, and a panel that does reads as an effect
               * rather than as something opening. It leaves the same way it
               * arrived — a surface that comes from the right and goes out the
               * bottom is two different objects.
               */
              /* It grows from the corner of the button that opened it, which
               is the bottom one when it had to open upwards. */
              transformOrigin: `${at.from === 'bottom' ? 'bottom' : 'top'} ${align === 'right' ? 'right' : 'left'}`,
              opacity: shown ? 1 : 0,
              /* It slides rather than grows: a sheet comes from the edge it
               is attached to, and the same movement takes it back. A scale
               from the corner of a button is the wrong story for something
               the width of the screen. */
              transform: shown ? (drag ? `translateY(${drag}px)` : 'translateY(0) scale(1)') : phone ? 'translateY(100%)' : 'scale(0.97)',
              /* Nothing while a finger is on it: the sheet is where the
               finger is, and an eased follow is a sheet trailing behind
               the hand that is holding it. */
              transition: drag !== null ? 'none' : `opacity ${SHOWING}ms var(--ease-out), transform ${SHOWING}ms var(--ease-out)`,
              /* Nothing to press on the way out: a click landing on a panel
               that is leaving is a click nobody aimed. */
              ...(shown ? null : { pointerEvents: 'none' as const }),
            }}
          >
            {phone && (
              /*
               * The two ways out a sheet has on this platform: the bar you
               * pull and the cross you press.
               *
               * The bar is not decoration — it is what says the thing can be
               * moved, and without it a sheet that answers a downward drag
               * is a gesture nobody is told about. The cross is for the hand
               * that does not know the gesture, and for the one holding the
               * phone in a way that cannot reach down.
               */
              <div
                data-sheet-grip
                className="sticky top-0 z-10 flex shrink-0 items-center justify-center pt-2 pb-1"
                style={{ touchAction: 'none' }}
                onPointerDown={(e) => {
                  if (e.pointerType === 'mouse') return
                  e.currentTarget.setPointerCapture(e.pointerId)
                  from.current = e.clientY
                  setDrag(0)
                }}
                onPointerMove={(e) => {
                  if (drag === null) return
                  /* Down only. Dragging a sheet up is pulling at something
                   already against its stop, and following that would lift
                   it off the edge it belongs to. */
                  setDrag(Math.max(0, e.clientY - from.current))
                }}
                onPointerUp={() => {
                  if (drag === null) return
                  /* A third of the way down, or a short way with intent —
                   the same threshold the platform's own sheets use, which
                   is "far enough that it was not a scroll". */
                  const far = drag > Math.min(120, window.innerHeight / 6)
                  setDrag(null)
                  if (far) setOpen(false)
                }}
                onPointerCancel={() => setDrag(null)}
              >
                <span
                  aria-hidden
                  className="bg-ink-3"
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 999,
                    opacity: 0.4,
                  }}
                />
                <button
                  type="button"
                  aria-label={BAR.close}
                  data-sheet-close
                  onClick={() => setOpen(false)}
                  className="absolute top-2 right-3 flex size-8 items-center justify-center bg-track text-ink-2"
                  style={{ borderRadius: 999 }}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            )}
            {children(() => setOpen(false))}
          </div>,
          document.body,
        )}
    </span>
  )
}

/** A line in a popover: what it is on the left, the answer on the right. */
/**
 * One answer out of a few, on a row that says what the question is.
 *
 * Two answers are a pair of segments and more than two are a menu. Not a
 * preference: with two, the alternative is the thing you are not looking at,
 * and a dropdown hides it behind a click to show you what you already have.
 * The segments put both on screen, so choosing is a glance and a press
 * instead of open, read, press.
 *
 * Decided here rather than at each call site, so the next two-answer
 * question gets it without anybody choosing again — and so nobody has to
 * notice that one of five rows is drawn differently and wonder why.
 *
 * The question sits above its answer rather than beside it. Side by side,
 * the answer got whatever width the longest question left over, so the
 * controls in a column of these ended at five different places and the
 * longest of them — "Finished work" and its pair — had nowhere to go. Above,
 * every answer has the whole width and they line up.
 */
export function Choice<T extends string>({
  said,
  value,
  onPick,
  options,
  testId,
}: {
  said: string
  value: T
  onPick: (v: T) => void
  /** A `testId` per option, for the ones a test reaches for by name. */
  options: { id: T; label: string; testId?: string }[]
  testId?: string
}) {
  if (options.length === 2) {
    return (
      <div data-testid={testId} role="radiogroup" aria-label={said} className="flex flex-col gap-2 px-4 pt-3 pb-1">
        <span className="text-base text-ink-2">{said}</span>
        {/* The same sliding chip as the switch on the bar above: two
            answers or six, it is one control and it moves. */}
        {/* A pill, as the tabs over a list are (Files' kinds, the bar's
            switch): one shape for "one of these", wherever it stands. */}
        <Segments
          fill
          items={options.map((o) => ({
            key: o.id,
            label: o.label,
            testId: o.testId,
            attrs: { role: 'radio', 'aria-checked': String(o.id === value) },
          }))}
          value={value}
          onPick={onPick}
        />
      </div>
    )
  }

  return (
    <label className="flex flex-col gap-2 px-4 pt-3 pb-1">
      <span className="text-base text-ink-2">{said}</span>
      <select
        data-testid={testId}
        aria-label={said}
        value={value}
        onChange={(e) => onPick(e.target.value as T)}
        className="w-full rounded-[var(--r-row)] px-2 text-base bg-track text-ink"
        style={{ height: '32px' }}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/**
 * How long something took, chosen rather than typed.
 *
 * It was a field that took `1h 30m` and parsed it. That works and it is
 * still typing: the one number anybody logs is a quarter of an hour or a
 * multiple of it, and asking a person to spell that out — twice a day, in a
 * syntax they have to learn — is the interface making them do the work.
 *
 * So: a menu, and picking from it *is* the logging. Two presses, no commit
 * button and nothing to get wrong.
 *
 * Quarter hours up to four, then whole ones to eight. Fine where the
 * difference is real — the gap between 15 and 30 minutes is most of what
 * gets logged — and coarse past the point where nobody is counting minutes
 * any more. Twenty rows, which is a list somebody can look down.
 */
const HOW_LONG: readonly number[] = [...Array.from({ length: 16 }, (_, i) => (i + 1) * 15), 300, 360, 420, 480]

export function HowLong({
  onPick,
  testId,
  align = 'left',
  filled = false,
  face,
  said = MORE.logTime,
}: {
  onPick: (minutes: number) => void | Promise<void>
  testId?: string
  align?: 'left' | 'right'
  /** What stands where "Log time" does — an entry's own length, changed by
      picking another. */
  face?: ReactNode
  /** What it is, for whoever cannot see it. */
  said?: string
  /** On a ground and forty tall — in a phone's sheet, where it is pressed
      with a thumb rather than pointed at. */
  filled?: boolean
}) {
  /* Where the keyboard is, so the travelling light can stand there when the
     pointer is somewhere else entirely — the same `also` the task lists use.
     A menu that opens focused on a row and shows nothing is a menu somebody
     has to press an arrow key to find their way into. */
  const [at, setAt] = useState(0)
  return (
    <Popover
      shape="bare"
      align={align}
      width={148}
      said={said}
      {...(testId ? { testId } : {})}
      label={
        face ?? (
          /* `data-control` on the span and not on the button: the bare face
           has no shape of its own, so the wash would be a sharp rectangle
           hugging the words. Given a padded, rounded ground it reads. */
          <span
            data-control
            className={
              filled
                ? 'flex h-10 items-center gap-2 pr-4 pl-3 text-base font-medium'
                : 'flex h-6 items-center gap-1 pr-2 pl-1 text-base font-medium'
            }
            style={{
              color: 'var(--accent)',
              borderRadius: filled ? 'var(--r-row)' : 'var(--r-field)',
              ...(filled ? { background: 'var(--track)' } : {}),
            }}
          >
            <Icon name="plusThin" size={16} />
            {MORE.logTime}
          </span>
        )
      }
    >
      {(close) => (
        <div
          data-fluid
          role="menu"
          data-menu
          className="relative max-h-[248px] overflow-y-auto py-1"
          /*
           * Up and down walk it, which is what a menu is expected to do and
           * what twenty rows of Tab is not. Enter and Space are the button's
           * own; Escape is the popover's.
           */
          onKeyDown={(e) => {
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
            e.preventDefault()
            const rows = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[data-how-long]'))
            const at = rows.indexOf(document.activeElement as HTMLButtonElement)
            const next = e.key === 'ArrowDown' ? at + 1 : at - 1
            rows[(next + rows.length) % rows.length]?.focus()
          }}
        >
          {/* The same travelling light every other menu in the product has,
              and it stands on the keyboard's row when no pointer is over
              one. */}
          <Fluid also="[data-lit]" />
          {HOW_LONG.map((m, i) => (
            <button
              key={m}
              role="menuitem"
              data-row
              data-how-long={m}
              /* The hand lands on the first one, so the keyboard starts
                 inside the menu rather than wherever it was before it
                 opened. A quarter of an hour is also the commonest answer. */
              autoFocus={i === 0}
              data-lit={i === at ? '' : undefined}
              onFocus={() => setAt(i)}
              onClick={() => {
                close()
                void onPick(m)
              }}
              className="relative flex h-8 w-full items-center px-3 text-left text-base tabular-nums text-ink"
              style={{ letterSpacing: 'var(--track-body)' }}
            >
              {asHours(m)}
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}

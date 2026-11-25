import { useState, useRef, useCallback, useLayoutEffect, useEffect } from 'react'

/* ------------------------------------------------------------------ rows */

/**
 * The unit almost everything is made of.
 *
 * A row, not a card. Cards need borders and shadows to separate them, and a
 * list of forty bordered cards is a screen of lines with work hidden between
 * them. A row separates by being a row.
 */
export function Row({
  children,
  selected = false,
  onClick,
  rail = false,
  as = 'div',
  className = '',
  style,
  ...rest
}: {
  children: React.ReactNode
  selected?: boolean
  onClick?: () => void
  /** A 2px mark at the left edge: for navigation, where "where am I" matters. */
  rail?: boolean
  as?: 'div' | 'button'
} & React.HTMLAttributes<HTMLElement>) {
  const Tag = (onClick ? 'button' : as) as 'button'
  return (
    <Tag
      data-row
      data-selected={selected || undefined}
      onClick={onClick}
      className={`group relative flex w-full shrink-0 items-center gap-2 rounded-[var(--r-tile)] px-2 text-left ${
        rail ? 'before:absolute before:top-2 before:bottom-2 before:left-0 before:w-1 before:rounded-full' : ''
      } ${className}`}
      style={{
        height: 'var(--row-h)',
        /* Every row at full strength, and the ground alone says which one
           you are on. Dimming the others read as a list where most of the
           names were half-disabled — a place you could go is not a place
           you may not. */
        color: 'var(--ink)',
        background: selected ? 'var(--hover)' : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/** What a row shows on the right, and only while it is reached for. */
export function RowActions({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1 mouse:opacity-0 transition-opacity on-group-hover:opacity-100 group-focus-within:opacity-100">
      {children}
    </span>
  )
}

/**
 * One highlight for a list, and it travels between the rows.
 *
 * Every row drawing its own ground and dropping it again makes one movement
 * of the hand into three states: a row lighting, a gap of nothing, the next
 * row lighting. This is the same ground moved — the eye follows it instead of
 * finding it again — and it takes the shape of whatever it is on, which is
 * why a strip shorter than a row and a sidebar row inset from the edge both
 * work without being told about.
 *
 * It reads the pointer itself rather than being handed a state per row: the
 * only thing it needs is what the pointer is over, and every list already
 * says which of its children are rows. `also` is for the lists a keyboard
 * walks as well — the mark it leaves is where the highlight goes when the
 * pointer is somewhere else entirely.
 *
 * The host has to be positioned and is usually the scroller, so the
 * highlight scrolls with the rows it is measured against.
 *
 */
/*
 * Where the pointer is, for the moments nothing has told us.
 *
 * A highlight follows `pointerover`, and a pointer that has not moved sends
 * none: coming back from a task, the rows under it are new elements and the
 * last thing entered is gone from the document, so every list went dark
 * until the hand moved. The browser knows where the pointer is and will say
 * if asked, so this remembers where to ask about.
 *
 * One listener for every `Fluid` there is, and it only writes two numbers.
 */
let mouseX = -1
let mouseY = -1

/*
 * What is under the pointer, asked once for everybody who asks at once.
 *
 * Every `Fluid` asks after every render, and on a board a render draws
 * several of them — each with its own hit test of the whole screen, whose
 * cost grows with what is on it: six milliseconds a call over a board of
 * 900 cards, nine calls on picking a card up. Asked at one place
 * in one commit, the answer is the same for all of them — a glow has no
 * pointer events — so the first asks and the rest are told. Forgotten as
 * soon as the commit's own work is done, so nothing that changes the
 * screen afterwards is answered from before it.
 */
let hit: { x: number; y: number; el: Element | null } | null = null
function underPointer(x: number, y: number): Element | null {
  if (hit && hit.x === x && hit.y === y) return hit.el
  const el = document.elementFromPoint(x, y)
  if (!hit) queueMicrotask(() => (hit = null))
  hit = { x, y, el }
  return el
}

/*
 * And a way to say “forget where the pointer is until it moves again”.
 *
 * The remembered position is what keeps a highlight alive across a
 * re-render, and just after a drag it is exactly wrong: the card lands
 * under a cursor that has not moved, its column rebuilds, every `Fluid`
 * re-asks what is beneath those coordinates, and the card arrives already
 * lit. The hand never pointed at it — the card was put there — so the
 * highlight answers a question nobody asked.
 *
 * This blanks the memory, and the next real `pointermove` restores it. A
 * hand that genuinely moves onto the card lights it the usual way.
 */
let waiting = false
export function holdUntilMoved() {
  waiting = true
  mouseX = -1
  mouseY = -1
  /* And for the hovers drawn by CSS, which this memory does not reach: a
     `:hover` is the browser's own answer and is re-asked when things move
     under a still pointer. `[data-still]` lets the stylesheet stand them
     down until the hand moves — `theme.css`. */
  document.documentElement.dataset.still = ''
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      /*
       * A mouse only.
       *
       * A finger produces `pointermove` as well, so a tap wrote these two
       * numbers and the travelling highlight went to whatever was under
       * the thumb — and stayed there, because nothing follows a finger
       * that has left the glass. A phone's answer to "where is the
       * pointer" is that there is not one.
       */
      if (e.pointerType !== 'mouse') return
      const woke = waiting
      waiting = false
      if ('still' in document.documentElement.dataset) delete document.documentElement.dataset.still
      mouseX = e.clientX
      mouseY = e.clientY
      /* The boundary events of this very move came first and were held
         back (see `over`), so every highlight is asked once, now, what is
         under the hand. */
      if (woke) document.dispatchEvent(new Event('hand-moved'))
    },
    { capture: true, passive: true },
  )
}

/**
 * Which highlight a row belongs to: the nearest one above it.
 *
 * A `[data-row]` is not the property of every host it happens to be inside
 * of. The workspace switcher's rows sit in a panel floating over the
 * sidebar, and that panel is inside the scroller the column's own highlight
 * is hosted on — so the column claimed them, measured them with
 * `offsetLeft`, which answers in the panel's coordinates and not the
 * scroller's, and drew the light in the corner of the sidebar fifty pixels
 * from the row it meant.
 *
 * A glow is always a direct child of its own host, so walking up and
 * stopping at the first one answers whose row this is without anybody
 * having to declare it. A menu over a list lights its own rows; the list
 * underneath lets go.
 */
/**
 * The screen belongs to a menu while it is open.
 *
 * A menu closed on a press anywhere outside it and let that press through,
 * so pressing the list behind an open status menu shut the menu and opened
 * whatever task was under the finger — two things from one press, and the
 * second was never asked for. The rows underneath lit under the pointer as
 * well, because the hand was over the page and the page did not know a menu
 * was on it.
 *
 * So a menu lays a sheet over everything first. The press that closes it
 * lands here and goes no further, and `Fluid` lets go of anything under a
 * `[data-over]`, so nothing lights behind it either. One press, one thing.
 *
 * It closes on the release, not the press: a sheet taken away under a finger
 * that is still down hands the release to whatever was underneath, which is
 * the press going through by another road. The press itself is refused so
 * nothing is selected and nothing takes focus on the way.
 */
export function Over({ onClose }: { onClose: () => void }) {
  return (
    <div
      data-over
      aria-hidden
      className="fixed inset-0 z-40"
      /*
       * And it stops what lands on it from going on.
       *
       * The sheet is drawn over the page but it is still a child of the row
       * the menu was opened from, in the document and in the tree above it —
       * so a press that landed on the sheet arrived at the row a moment
       * later and opened the task anyway. Covering the page is not the same
       * as answering for it.
       */
      onPointerDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }}
    />
  )
}

/**
 * Whether what the hand is actually on is drawn over this list.
 *
 * A menu is `fixed` but it is still a child of the row it was opened from,
 * so asked "what is the nearest row to this?" of a pointer sitting on a
 * menu, a list answers with the row underneath — and lights it. Anything
 * over the page says so with `data-over`: the sheet a menu lays down, and
 * the menu itself. A list whose own highlight is inside that sheet is not
 * underneath it, which is how a menu still lights its own rows.
 */
function overlaid(it: Element | null | undefined, host: Element): boolean {
  const sheet = it?.closest('[data-over]')
  return !!sheet && !sheet.contains(host)
}

/** A row folded away or shut out of reach: not one to light. */
function gone(row: Element): boolean {
  return !!row.closest('[inert], [hidden]')
}

function owner(row: Element): Element | null {
  for (let p = row.parentElement; p; p = p.parentElement) {
    if (p.querySelector(':scope > [data-glow]')) return p
  }
  return null
}

export function Fluid({
  what = '[data-row]',
  also,
  pinned,
  tone = 'wash',
}: {
  /** Which children are rows. */
  what?: string
  /** What is lit when the pointer is elsewhere — a keyboard's cursor. */
  also?: string
  /**
   * Sits on this and does not follow the pointer at all.
   *
   * For the chip in a segmented control: it is the answer rather than the
   * pointer, and it slides from the old answer to the new one, which is the
   * whole of what a segmented control is for.
   */
  pinned?: string
  /**
   * `wash` is the ground under a pointer; `chip` is a raised surface.
   *
   * `over` is the wash drawn on top, for rows that have a ground of their
   * own. A board card sits on `--surface` and casts a little, so a highlight
   * behind it is behind something opaque and invisible — the only way for
   * the same travelling light to reach a card is over it.
   */
  tone?: 'wash' | 'chip' | 'over'
}) {
  type At = { x: number; y: number; w: number; h: number; r: string; moved: boolean; danger: boolean }
  const [at, setAt] = useState<At | null>(null)
  const on = useRef<HTMLElement | null>(null)
  /*
   * Which element the chip was last sitting on.
   *
   * A chip travels when the *answer* changes and is placed when the bar
   * underneath it is merely rebuilt. Those look identical from inside here —
   * both are "the thing I am on is in a different place" — and they are told
   * apart by whether it is a different thing. A press moves the answer to
   * another button — a different element, so the chip travels to it. A bar
   * arriving with one more list on it leaves the answer on the very same
   * button and only moves that button across the screen, so the chip is
   * placed.
   *
   * Without that, opening a project slid the chip from wherever it first
   * landed to wherever the lists put it a moment later, on a navigation
   * nobody asked to be animated.
   */
  const was = useRef<HTMLElement | null>(null)
  /*
   * The list is whatever this is inside of.
   *
   * It used to be handed a ref to it, and a ref to a parent is not attached
   * until after this component's own layout effect has run — so on the
   * first render the host was null, nothing was measured, and a segmented
   * control's chip was invisible until anything at all caused a second
   * render. Coming back from a task was exactly that: four controls with no
   * answer showing until the hand moved.
   *
   * Its own node is attached before its own effects, so asking for the
   * parent of that always works, and no caller has to hold a ref.
   */
  const self = useRef<HTMLDivElement>(null)

  const put = useCallback(() => {
    const host = self.current?.parentElement ?? null
    /*
     * What the pointer is on, asked of the document when what it was on is
     * gone. That is the whole of the "it goes dark until I move the mouse"
     * fault: the rows are new elements and nothing fires for a hand that
     * did not move.
     */
    /*
     * And nothing of this list's is lit while a menu is open over it — not
     * the row under the hand and not the one a keyboard left its cursor on.
     * A list that keeps a light while a menu has the screen is a second
     * answer to "where am I", given by the thing that is not being used.
     */
    /* `waiting` means the pointer's last known place is stale on purpose
       — something moved under it rather than it moving. */
    const top = host && !waiting && mouseX >= 0 ? underPointer(mouseX, mouseY) : null
    const covered = !!host && overlaid(top, host)
    let under = on.current
    if (!pinned && host && (!under || !host.contains(under)) && mouseX >= 0) {
      const found = (covered ? null : top?.closest(what)) as HTMLElement | null
      under = found && owner(found) === host ? found : null
      on.current = under
    }
    if (under && gone(under)) {
      under = null
      on.current = null
    }
    const it = pinned
      ? ((host?.querySelector(pinned) as HTMLElement | null) ?? null)
      : covered
        ? null
        : (under ?? (also ? ((host?.querySelector(also) as HTMLElement | null) ?? null) : null))
    /*
     * Lit by the keyboard's cursor rather than by a hand: placed, not
     * travelled. A key is pressed many times a minute and the row it lands
     * on is the answer to that press, so a light gliding there is the
     * interface lagging behind the key — "nothing a key does is animated".
     */
    const keyed = !pinned && !under
    setAt((had) => {
      if (!host || !it || owner(it) !== host) {
        was.current = null
        return had === null ? had : null
      }
      /*
       * Measured against the host, which is what the glow is drawn inside.
       *
       * `offsetTop` is relative to the nearest *positioned* ancestor, and
       * a scrolling pane is usually `static` — so in a menu both the rows
       * and the glow report their distance from the menu's own box, which
       * does not move when the pane scrolls. The rows move anyway, because
       * they are laid out inside the pane; the glow does not, because it
       * is placed by a transform built from that unmoved number.
       *
       * Measured: the row at viewport 333, the glow at 573, the pane
       * scrolled 240 — the glow left behind by exactly the scroll, which
       * is the "the hover stays and the content moves" of the report.
       *
       * Rectangles are in the viewport's terms and so agree whatever is
       * scrolling between them, and adding the host's own scroll converts
       * back into the host's content box, which is the frame a child
       * absolutely positioned in it actually uses.
       */
      const hb = host.getBoundingClientRect()
      const ib = it.getBoundingClientRect()
      /*
       * Inside the host's border, which is where a child is placed from.
       *
       * `getBoundingClientRect` measures to the outside of the border and
       * an absolutely positioned child is laid out from the padding edge,
       * so a host with a one-pixel border puts the glow one pixel below
       * every row. The status menu has one, and a test asking for
       * sub-pixel agreement caught it at 232 against 231.
       *
       * Not rounded, either: a row can sit on a half pixel and the browser
       * draws fractions, so rounding is one more way to be one off.
       */
      const edgeX = parseFloat(getComputedStyle(host).borderLeftWidth) || 0
      const edgeY = parseFloat(getComputedStyle(host).borderTopWidth) || 0
      const next: At = {
        x: ib.left - hb.left - edgeX + host.scrollLeft,
        y: ib.top - hb.top - edgeY + host.scrollTop,
        w: it.offsetWidth,
        h: it.offsetHeight,
        r: getComputedStyle(it).borderRadius,
        /* Appearing is not travelling: coming from nowhere it is placed and
           faded in, because a highlight crossing the screen answers a hand
           that did not move. Nor is a bar being rebuilt under a chip that is
           still on the same answer — see `was` above. */
        moved: had !== null && (!pinned || was.current !== it) && !keyed,
        /* A red row — a menu's Delete — is lit red, so the light says what
           pressing will do rather than greying the one word that warns. */
        danger: it.matches('[data-danger], .text-danger'),
      }
      was.current = it
      return had &&
        had.x === next.x &&
        had.y === next.y &&
        had.w === next.w &&
        had.h === next.h &&
        had.r === next.r &&
        had.danger === next.danger
        ? had
        : next
    })
  }, [also, pinned, what])

  /* After every render, because everything that moves a row moves this: a
     band folded, a project added, the panel beside the list opening. Two
     reads and a compare is cheaper than working out which it was. */
  useLayoutEffect(put)

  /*
   * And whenever the host changes size without a render of this.
   *
   * A window's body that grows a scrollbar — a mouse plugged in shows them
   * — narrows a segmented control after the press was drawn: the halves
   * shrink and the chip, measured before, stood past the one on, flush
   * with the track's end. New conversation, where the tab's own list
   * arriving was what brought the scrollbar.
   */
  useEffect(() => {
    const host = self.current?.parentElement
    if (!host || typeof ResizeObserver === 'undefined') return
    const watch = new ResizeObserver(() => put())
    watch.observe(host)
    return () => watch.disconnect()
  }, [put])

  useEffect(() => {
    const host = self.current?.parentElement
    if (!host || pinned) return
    /*
     * The gap between two rows belongs to the nearer of them.
     *
     * A navigation with two pixels between its rows put the pointer over
     * nothing twice on the way down, and over nothing means the highlight
     * goes out — so crossing from one row to the next was light, dark,
     * light, and the light did not travel, because a thing appearing from
     * nowhere is placed rather than moved. Two pixels of gap, and the
     * whole of the movement lost.
     *
     * So: what the pointer is on, or failing that what it is nearest, and
     * only while that is near enough to be a gap. A heading between two
     * sections is not a gap, and the highlight leaves rather than sitting
     * on a row the pointer has walked away from.
     */
    const near = (x: number, y: number, target: Element | null): HTMLElement | null => {
      if (overlaid(target, host)) return null
      const it = target?.closest?.(what) as HTMLElement | null
      if (it) return owner(it) === host ? it : null
      /* On a control of its own — a heading's plus — the control answers
         the pointer, not the row beside it: bridging to the row lit the
         room under the Chat heading while the hand was on its plus. */
      if (target?.closest?.('button, a, [data-control]')) return null
      let best: HTMLElement | null = null
      let closest = Infinity
      /*
       * Between two rows, not past the last of them.
       *
       * The tolerance below is for the gap *between* rows — two pixels of
       * it put the pointer over nothing on the way down a list, and over
       * nothing means the light goes out, so crossing from one row to the
       * next flickered. A gap belongs to the nearer of the two rows that
       * make it.
       *
       * The padding at the ends of a list is not that gap. It is four
       * pixels of `py-1` with a row on one side and the edge of the pane
       * on the other, and bridging it lit the last row while the pointer
       * sat under it on nothing — which is what a scrolled menu looks
       * like when it has been scrolled to its end. So the bridge is only
       * offered where there is something on both sides.
       */
      let above = false
      let below = false
      for (const row of host.querySelectorAll(what)) {
        if (owner(row) !== host) continue
        const b = row.getBoundingClientRect()
        if (b.bottom <= y) above = true
        if (b.top >= y) below = true
        const dx = Math.max(b.left - x, 0, x - b.right)
        const dy = Math.max(b.top - y, 0, y - b.bottom)
        const d = Math.hypot(dx, dy)
        if (d < closest) {
          closest = d
          best = row as HTMLElement
        }
      }
      if (!above || !below) return null
      return closest <= 6 ? best : null
    }
    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      /*
       * Not while holding. A browser fires `pointerover` when a row arrives
       * under a pointer that has not moved — a column opening, a card
       * landing — and that is the very thing the hold is for. The move that
       * ends the hold asks again (`hand-moved`).
       */
      if (waiting) return
      mouseX = e.clientX
      mouseY = e.clientY
      const it = near(e.clientX, e.clientY, e.target as Element | null)
      if (it === on.current) return
      on.current = it
      put()
    }
    /*
     * And on through what is not a row.
     *
     * `pointerover` fires once, on the way into an element. Up from the
     * first row of a section the pointer entered the heading two pixels
     * from the row — near enough to be the gap, so the row stayed lit —
     * and then crossed the whole heading without another event: the row
     * stayed lit under nothing, or caught halfway to the row above. Over
     * anything that is not a row the question is asked again as the
     * pointer moves; over a row it never needs to be, and the move costs
     * one `closest`.
     */
    const between = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || waiting) return
      if ((e.target as Element | null)?.closest?.(what)) return
      over(e)
    }
    /*
     * Leaving carries its own position, and has to.
     *
     * A boundary event fires before the move that caused it, so the two
     * numbers up there still say where the pointer was — inside this list.
     * Asked with those, the document answers "a row of yours" and the
     * highlight comes straight back on, which read as a list that could not
     * let go.
     */
    const away = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mouseX = e.clientX
      mouseY = e.clientY
      on.current = null
      put()
    }
    /*
     * Scrolling moves the rows under a hand that has not moved.
     *
     * `pointerover` is the only thing that says which row is under the
     * pointer, and scrolling fires none: the wheel turns, the list travels,
     * and the highlight stays on the row it was on — which is now somewhere
     * else and under nothing. In a menu of labels that is a lit row three
     * above the pointer, and it looks like the list has stopped answering.
     *
     * So the question is asked again from where the pointer last was.
     * `elementFromPoint` is what stands in for the event's own target:
     * nothing is moving but the content, so the coordinates are still good
     * and only what is under them has changed.
     *
     * Heard on the document, which is the one place that hears all of
     * them. `scroll` does not bubble, so a listener on the host catches
     * only the host's own scrolling — and the host is sometimes the pane
     * and sometimes the box around one. Captured at the document it
     * arrives either way, and the handler is cheap: two numbers and a hit
     * test, on an event the browser already coalesces to a frame.
     */
    const scrolled = (e: Event) => {
      /* Before the pointer has ever moved there is nothing to re-ask
         about — `-1`, which is what these start at — and `waiting` says
         the same thing about the moments after a drop. */
      if (waiting || mouseX < 0 || mouseY < 0) return
      /*
       * Only a scroll that can have moved these rows: the window's, or a
       * box this list is in or that is in this list.
       *
       * Every `Fluid` on the screen asked again on every scroll anywhere,
       * and asking is a hit test whose cost grows with what is on the
       * screen. A board column scrolling under a carried card scrolls on
       * every frame, so the sidebar's lists re-asked about rows that had
       * not moved — measured on a column of 600, 380 hit tests in four
       * seconds of carrying, two milliseconds each.
       */
      const box = e.target
      if (box instanceof Element && !box.contains(host) && !host.contains(box)) return
      const it = near(mouseX, mouseY, underPointer(mouseX, mouseY))
      /*
       * And only this host's own answer is acted on.
       *
       * Every `Fluid` on the screen hears this — there are four while a
       * label menu is open, one per list that has rows — and for all but
       * one of them the pointer is over somebody else's row, which `near`
       * correctly answers as nothing. Acting on that nothing is the bug it
       * replaced: the three that own no row blanked the highlight the
       * moment after the one that owns it had lit it.
       *
       * So nothing happens unless something changed *here*: either this
       * host was lit and is not any more, or it has a row to light now.
       */
      if (it === on.current) return put()
      on.current = it
      put()
    }
    host.addEventListener('pointerover', over)
    host.addEventListener('pointermove', between)
    host.addEventListener('pointerleave', away)
    document.addEventListener('scroll', scrolled, { capture: true, passive: true })
    document.addEventListener('hand-moved', scrolled)
    /* The rows move under it when the window does, and nothing re-renders
       to say so. */
    const eye = new ResizeObserver(put)
    eye.observe(host)
    /*
     * Nor when rows come and go from somebody else's render. A project's
     * tools are drawn into the sidebar from the project's own screen (a
     * portal), so leaving the project took them away — or folded them shut
     * — without the sidebar rendering again, and the light stayed on where
     * the hovered tool had been, under nothing.
     */
    const rows = new MutationObserver(() => {
      if (on.current && (!host.contains(on.current) || gone(on.current))) on.current = null
      put()
    })
    rows.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-open', 'inert', 'hidden'] })
    return () => {
      rows.disconnect()
      host.removeEventListener('pointerover', over)
      host.removeEventListener('pointermove', between)
      host.removeEventListener('pointerleave', away)
      document.removeEventListener('scroll', scrolled, { capture: true })
      document.removeEventListener('hand-moved', scrolled)
      eye.disconnect()
    }
  }, [what, pinned, put])

  return (
    <div
      ref={self}
      data-glow
      aria-hidden
      className="pointer-events-none absolute top-0 left-0"
      style={{
        width: at?.w ?? 0,
        height: at?.h ?? 0,
        borderRadius: at?.r,
        transform: `translate(${at?.x ?? 0}px, ${at?.y ?? 0}px)`,
        background: tone === 'chip' ? 'var(--track-on)' : at?.danger ? 'var(--danger-wash)' : 'var(--hover)',
        boxShadow: tone === 'chip' ? 'var(--segment-shadow)' : undefined,
        zIndex: tone === 'over' ? 1 : undefined,
        opacity: at ? 1 : 0,
        /*
         * Travelling fades and moves; appearing only fades; an answer that is
         * simply already chosen does neither.
         *
         * The chip on a segmented control is not a highlight arriving, it is
         * the state of the control — and fading it up from nothing every time
         * a screen is drawn is an animation on a navigation. Opening a
         * project, the one thing on the bar lit itself a tenth of a second
         * after the bar, which is exactly the "transitions are jerky" this
         * product keeps removing. A pointer's highlight still fades, because
         * that one really is arriving.
         */
        transition: at?.moved
          ? 'transform 140ms var(--ease-out), width 140ms var(--ease-out), height 140ms var(--ease-out), opacity 90ms var(--ease-out)'
          : pinned
            ? 'none'
            : 'opacity 90ms var(--ease-out)',
      }}
    />
  )
}

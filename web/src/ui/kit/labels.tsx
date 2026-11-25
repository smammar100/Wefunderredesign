import { useState, useRef, useEffect } from 'react'
import { HEADS, PLACES, PROJECT, SAYS } from '../../data/words.js'
import { KIT as W } from '../../words/kit.js'
import { Icon } from '../glyphs.jsx'
import { Glass } from '../Glass.jsx'
import { TINT_AT, LIST_TINTS, TINT_SAID } from './marks.jsx'
import { Over, Fluid } from './rows.jsx'
import { Hairline } from './page.jsx'
import { findField } from './fields.jsx'

/** A label's colour, from its own id — the way a face's tint and a project's
    mark are. A workspace that has to agree on a colour for "bug" is a
    workspace having a meeting about a colour. */
/**
 * Where a menu opens, kept inside the window.
 *
 * Each of these laid itself at the trigger's left edge with a fixed width,
 * and flipped upward when it would run past the bottom — so the vertical
 * axis was handled and the horizontal was not. A control near the right of
 * the window opened a menu that went off it: the names were there and the
 * half of them past the edge could not be reached or read.
 *
 * Hung from the trigger's other edge when it will not fit, rather than
 * slid left by however much it overhangs.
 *
 * Sliding was the first answer and it keeps the menu on the screen, which
 * is the easy half. What it loses is the thing a menu's position is for:
 * at 900 the assignee's menu sat a hundred and sixty-four pixels left of
 * the face that opened it and overhung it by thirty-two on the right, so
 * neither edge lined up with anything and it read as having appeared
 * somewhere at random.
 *
 * Flipping keeps an edge on the trigger. The menu is then to the left of
 * the control instead of the right, which is what every menu near the
 * right of a window does, and the corner it grows from still says which
 * control it belongs to. Sliding only remains for the case flipping
 * cannot help — a trigger so far left that the flipped menu would run off
 * that side instead.
 */
export function inWindow(x: number, width: number, right?: number): number {
  const margin = 8
  const room = window.innerWidth - margin
  if (x + width <= room) return Math.max(margin, x)
  /* `right` is the trigger's far edge: the flipped menu ends there. */
  if (right !== undefined && right - width >= margin) return right - width
  return Math.max(margin, room - width)
}

export function tintOf(id: string): string {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 100_000
  return `var(--tint-${hash % 10})`
}

export type Label = {
  id: string
  name: string
  /**
   * One of `LIST_TINTS`, or null for the one its id works out.
   *
   * Null is the ordinary state, not a missing answer: a label nobody gave a
   * colour to has the colour it always had.
   */
  color?: string | null
}

/** One word, in its own colour. */
/**
 * A word in its own colour, as a pill.
 *
 * It was a seven-pixel dot and grey text — the colour said which label and
 * the word said what it meant, so reading one took two glances at two
 * things an inch apart. The colour is the ground now and the word sits in
 * it, which is one object instead of two.
 *
 * Drawn the way a project's mark is: the tint washed down for the ground
 * and carried at full strength by what sits on it. A solid fill was the
 * first answer and it shouted — ten saturated pills down a column is a
 * column of colour with words in it, and the words are the part being read.
 *
 * The wash is the same `--mark-space` and `--mark-wash-pct` the marks use,
 * which the two themes set differently: the same mix is a different colour
 * on a dark ground than on a light one, and `theme.css` says why. Built
 * here rather than declared at `:root`, because a declaration there is
 * resolved before there is any tint to put in it.
 *
 * `--tint-N-ink` for the word: the plain tints are chosen to be seen
 * against a page, and on a wash of themselves they vanish.
 */
export function LabelChip({
  label,
  size = 13,
  /**
   * Whether it may give up width when the row has not got it.
   *
   * `shrink-0` by default, because a chip that narrows in a panel with room
   * to spare is a chip being squeezed for no reason. On a list row there is
   * a fixed column and two of them plus a count rarely fit it — "Bug" and
   * "Improvement" need about 160 of 150 — so the *last* one is allowed to
   * narrow and its own ellipsis does the rest. Only the last: let both
   * shrink and the shortfall is divided between them, which turns a
   * three-letter word into "B…" to save a long one that still does not
   * fit.
   */
  tight = false,
}: {
  label: Label
  size?: number
  tight?: boolean
}) {
  /*
   * The colour it was given, or the one its id works out.
   *
   * The hash is not a fallback in the sense of a worse answer — it is what
   * every label had before a colour could be chosen, and it still decides
   * for every label nobody has an opinion about. What choosing adds is the
   * three words a workspace starts with looking like what they mean:
   * The labels spec has the argument and a overruling of
   * it.
   */
  let hash = 0
  for (const ch of label.id) hash = (hash * 31 + ch.charCodeAt(0)) % 100_000
  const chosen = label.color ? TINT_AT.get(label.color) : undefined
  const n = chosen ?? hash % 10
  return (
    <span
      data-label={label.id}
      /* A mark on a row, not a passage in it: `auto` over text is the
         I-beam for selecting it, and a word nobody copies advertising
         itself as reachable is the same fault the task's number had. The
         row under it is a link, and that is what the hand is aiming at. */
      className={`inline-flex h-5 cursor-default items-center px-2 font-medium select-none ${tight ? 'min-w-0 shrink' : 'shrink-0'}`}
      style={{
        fontSize: size - 1,
        color: `var(--tint-${n}-ink)`,
        background: `color-mix(in var(--mark-space), var(--tint-${n}) var(--mark-wash-pct), transparent)`,
        borderRadius: 'var(--r-pill)',
        letterSpacing: 'var(--track-body)',
      }}
    >
      {/*
        The word in a box of its own, so it can be shortened.
        
        `truncate` was on the chip, and a chip is `inline-flex`: a flex
        container cannot apply `text-overflow` to what is inside it, so the
        rule was inert and the text was simply cut by the chip's `overflow`
        — "Improvemen" with the last letter sliced and no ellipsis to say
        anything was missing. Measured: `text-overflow: ellipsis` computed
        on the chip, the content overflowing it, and no ellipsis drawn.
        
        A block child is something the rule can act on, which is what makes
        the shortening a decision rather than an accident.
      */}
      <span className="truncate" title={label.name}>{label.name}</span>
    </span>
  )
}

/**
 * The words on a task, and the way to change them.
 *
 * Offers what exists before it offers to make a new one, matching as you
 * type: the workspace with ninety labels and no two people using the same
 * three is what every tool with labels ends up as, and the only thing that
 * answers it is showing the person who would have typed "Bugs" that "bug"
 * is already there.
 */
export function LabelPick({
  all,
  value,
  said,
  onPick,
  onMake,
  disabled = false,
  face,
}: {
  all: Label[]
  value: Label[]
  /** What these are the labels of, for whoever cannot see the chips. */
  said: string
  /*
   * The whole set afterwards, as labels rather than ids.
   *
   * A label made this second is not in `all` yet — the list is refetched
   * after the request — so handing back ids made the screen drop the one just
   * created and put it back a moment later. The picker knows the objects; it
   * passes them.
   */
  onPick: (labels: Label[]) => void
  onMake: (name: string, color?: string | null) => Promise<Label | null>
  disabled?: boolean
  /** What the trigger draws instead of the chips — the selection bar's
      glyph, where the chips of several tasks are no one answer. */
  face?: React.ReactNode
}) {
  const [at, setAt] = useState<{ x: number; y: number; r: number } | null>(null)
  const [typed, setTyped] = useState('')
  /** The colour for the one being made, or null to let its id decide. */
  const [picked, setPicked] = useState<string | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const on = new Set(value.map((l) => l.id))
  const matching = all.filter((l) => l.name.toLowerCase().includes(typed.trim().toLowerCase()))
  const exact = all.some((l) => l.name.toLowerCase() === typed.trim().toLowerCase())

  /* Shut by Escape wherever the focus is — after a tick it is on the row,
     not in the field, and the field was the only place that listened. */
  useEffect(() => {
    if (!at) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setAt(null)
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [at])

  const toggle = (l: Label) => {
    onPick(on.has(l.id) ? value.filter((x) => x.id !== l.id) : [...value, l])
  }

  return (
    <>
      <button
        ref={trigger}
        data-labels
        aria-label={W.labelsOn(said)}
        aria-haspopup="menu"
        aria-expanded={at !== null}
        disabled={disabled}
        onClick={() => {
          if (at) return setAt(null)
          setTyped('')
          setPicked(null)
          const box = trigger.current?.getBoundingClientRect()
          if (box) setAt({ x: box.left, y: box.bottom, r: box.right })
        }}
        className="flex min-w-px items-center gap-2 text-base"
        style={{ color: face ? 'var(--ink-3)' : value.length ? 'var(--ink)' : 'var(--ink-3)' }}
      >
        {face ? (
          face
        ) : value.length === 0 ? (
          <span>{HEADS.none}</span>
        ) : (
          value.slice(0, 3).map((l) => <LabelChip key={l.id} label={l} size={14} />)
        )}
        {!face && value.length > 3 && <span className="text-ink-3">+{value.length - 3}</span>}
      </button>
      {/* The screen is the menu's while it is open — `Over`. Laid down
          before the menu, so the menu is the one thing above it. */}
      {at && <Over onClose={() => setAt(null)} />}
      {at && (
        <div
          data-over
          data-label-menu
          role="menu"
          className="fixed z-40"
          style={{
            left: inWindow(at.x, 240, at.r),
            top: at.y + 6,
            width: 240,
          }}
        >
          {/* Glass, like the calendar and for the same reason: `glass.md`
              names floating panels among the places it goes, and these
              menus are that object at a smaller size. */}
          <Glass data-fluid radius={16} className="overflow-hidden py-1">
            <input
              {...findField}
              data-testid="label-search"
              autoFocus={window.matchMedia('(pointer: fine)').matches}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setAt(null)
                if (e.key === 'Enter' && typed.trim() && !exact) {
                  e.preventDefault()
                  void onMake(typed.trim(), picked).then((made) => {
                    if (made) onPick([...value, made])
                    setTyped('')
                    setPicked(null)
                  })
                }
              }}
              placeholder={PLACES.findOrMakeOne}
              className="w-full bg-transparent px-3 py-2 text-base outline-none text-ink"
            />
            {/* Edge to edge: it separates the field from the list, not one row
              from the next, so it is not inset to where a row's words start. */}
            <Hairline inset={0} />
            {/* `relative`, so the glow inside is positioned against this pane
              rather than against the menu's own box. Static, both it and
              the rows measure from a box that does not scroll — the rows
              move with the pane anyway and the glow, placed from that
              number, stays behind by exactly the scroll. */}
            <div className="relative max-h-[240px] overflow-y-auto py-1" data-menu data-reads-down>
              <Fluid />
              {matching.map((l) => (
                <button
                  key={l.id}
                  role="menuitemcheckbox"
                  aria-checked={on.has(l.id)}
                  data-row
                  data-label-pick={l.id}
                  onClick={() => toggle(l)}
                  className="flex w-full items-center gap-3 px-3 text-left text-base text-ink"
                  style={{ height: 'var(--row-h)' }}
                >
                  <span
                    aria-hidden
                    className="block shrink-0"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      /* Its own colour if it was given one, so the row and the
                       chip on a task are the same label to look at. */
                      background: l.color ? `var(--tint-${TINT_AT.get(l.color) ?? 0})` : tintOf(l.id),
                    }}
                  />
                  <span className="min-w-px flex-1 truncate">{l.name}</span>
                  {on.has(l.id) && <Icon name="tasks" size={14} className="text-ink-2" />}
                </button>
              ))}
              {/* Offered last, after everything that already exists — the whole
                point of the search above. */}
              {typed.trim() && !exact && (
                <>
                  <button
                    data-row
                    data-testid="label-make"
                    onClick={() =>
                      void onMake(typed.trim(), picked).then((made) => {
                        if (made) onPick([...value, made])
                        setTyped('')
                        setPicked(null)
                      })
                    }
                    className="flex w-full items-center gap-3 px-3 text-left text-base text-ink-2"
                    style={{ height: 'var(--row-h)' }}
                  >
                    <span
                      aria-hidden
                      className="block shrink-0"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: picked ? `var(--tint-${TINT_AT.get(picked) ?? 0})` : 'var(--ink-3)',
                      }}
                    />
                    <span className="min-w-px flex-1 truncate">{W.makeNamed(typed.trim())}</span>
                  </button>
                  {/*
                  The ten, under the words that make it.
                  
                  Offered only while something is being made, because that is
                  the one moment the answer is wanted: a colour on a label
                  that already exists is a second control on every row of a
                  menu that is a list of words. Nothing picked is a real
                  answer and the ordinary one — the label then takes the
                  colour its id works out, which is what every label had
                  before this existed.
                */}
                  <div
                    data-testid="label-colours"
                    role="radiogroup"
                    aria-label={PROJECT.itsColour}
                    className="flex flex-wrap gap-2 px-3 pt-1 pb-2"
                  >
                    {LIST_TINTS.map(([name], i) => (
                      <button
                        key={name}
                        role="radio"
                        aria-checked={picked === name}
                        aria-label={TINT_SAID[name] ?? name}
                        data-label-colour={name}
                        onClick={() => setPicked(picked === name ? null : name)}
                        className="block shrink-0"
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          background: `var(--tint-${i})`,
                          /* The chosen one wears a ring rather than growing:
                           ten swatches that change size are ten things that
                           move when one is pressed. */
                          outline: picked === name ? '2px solid var(--ink)' : 'none',
                          outlineOffset: 2,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
              {matching.length === 0 && !typed.trim() && <div className="px-3 py-2 text-base text-ink-3">{SAYS.noLabelsYet}</div>}
            </div>
          </Glass>
        </div>
      )}
    </>
  )
}

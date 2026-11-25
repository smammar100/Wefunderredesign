import { KIT as W } from '../../words/kit.js'
import { type AgentFace } from '@tracker/shared-schema'
import { agentFaceSvg } from '../../data/agentFaces.js'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Icon, type IconName } from '../glyphs.jsx'

/**
 * A written document's mark: its glyph, white, on its colour — the doc on
 * the accent until somebody chooses — `docs/specs/docs.md`, "A document's
 * mark". Filled, as every tile in the Files list is; one place draws it,
 * so the list, the card, the document's head and the palette agree.
 */
export function DocMark({ icon, tint, size }: { icon: string | null; tint: number | null; size: number }) {
  return (
    <span
      data-doc-mark={icon ?? 'doc'}
      data-doc-tint={tint ?? 'own'}
      className="flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        background: tint == null ? 'var(--accent)' : `var(--face-${tint})`,
        borderRadius: size >= 40 ? 'var(--r-row)' : 8,
        color: '#fff',
      }}
    >
      <Icon name={(icon ?? 'doc') as IconName} size={Math.round(size * 0.42)} />
    </span>
  )
}

/* ----------------------------------------------------------------- marks */

/**
 * Where a piece of work has got to, as a shape rather than a word.
 *
 * A ring that fills as it moves along. It reads at a glance in a list of
 * forty, which a coloured word does not, and it takes the space of a
 * character.
 */
/**
 * The mark on a list, and on every task in it.
 *
 * It used to be worked out from the list's name — "Doing" or "Review" got
 * the half-filled ring and everything else got the empty one — so Doing and
 * In review were the same picture, and renaming a list changed what its
 * tasks looked like. The list carries its own mark now.
 *
 * Before that it was a ring with an arc drawn part of the way round it and
 * nothing to say which arc meant what. Nobody read it that way: an unclosed
 * ring at eighteen pixels is a spinner, and a spinner beside a task says the
 * row is loading. It was asked about, which is the whole evidence needed —
 * a status somebody has to ask about is not one. The difference now is that
 * the arc has a name beside it in the menu that sets it.
 */
const MARKS: Record<string, { glyph: React.ComponentProps<typeof Icon>['name']; lit: boolean }> = {
  // Before anybody has picked it up, so grey and drawn broken.
  backlog: { glyph: 'statusBacklog', lit: false },
  open: { glyph: 'statusOpen', lit: false },
  started: { glyph: 'statusStarted', lit: true },
  doing: { glyph: 'statusDoing', lit: true },
  review: { glyph: 'statusReview', lit: true },
  done: { glyph: 'tasks', lit: true },
  // An ending rather than a stage, so it is grey: nothing about it is live.
  stopped: { glyph: 'statusStopped', lit: false },
}

/**
 * The seven, in the order the work goes round the ring.
 *
 * Beside the table that draws them, because they are the same six: the
 * picker offering a mark the renderer does not know is a list with an empty
 * ring and nobody able to say why. Two screens set this — the dialog that
 * makes a list and the project's settings — and one order between them.
 */
export const LIST_MARKS: readonly (readonly [string, string])[] = [
  ['backlog', W.backlog],
  ['open', W.notStarted],
  ['started', W.started],
  ['doing', W.inProgress],
  ['review', W.almostDone],
  ['done', W.finished],
  ['stopped', W.stopped],
]

/**
 * The sixteen a project's mark can be, in the order they are offered.
 *
 * The same sixteen the server offers — `MarkIcon` in `shared-schema`, which
 * is where the refusal is written and therefore where the truth is. Here as
 * a plain list rather than imported, because importing the schema package
 * into the browser brings zod with it: fifteen kilobytes for sixteen
 * strings, on a product with a two-hundred-millisecond budget. The e2e
 * presses every one of them and the server answers, so the two lists cannot
 * drift without a test going red.
 */
export const PROJECT_MARKS: readonly IconName[] = [
  'globe',
  'rocket',
  'briefcase',
  'code',
  'palette',
  'camera',
  'book',
  'chart',
  'target',
  'bolt',
  'star',
  'heart',
  'home',
  'bag',
  'leaf',
  'music',
]

/* What each is called under the pointer: what the project is about, not
   the glyph's own name — "cal" was what the tooltip said. */
export const MARK_SAID: Partial<Record<IconName, string>> = {
  globe: W.website,
  rocket: W.launch,
  briefcase: W.client,
  code: W.code,
  palette: W.design,
  camera: W.photo,
  book: W.writing,
  chart: W.growth,
  target: W.goal,
  bolt: W.sprint,
  star: W.favourite,
  heart: W.care,
  home: W.home,
  bag: W.shop,
  leaf: W.nature,
  music: W.music,
}

/**
 * The ten a mark can be given, in the order they go round the wheel.
 *
 * The tints the product already has — a project's tile and a person's avatar
 * are drawn in them. Ten the eye can name rather than a picker: a hundred
 * greens are one thing nobody can learn, and a second palette beside the
 * first is two products.
 */
export const LIST_TINTS: readonly (readonly [string, string])[] = [
  ['red', 'var(--tint-0)'],
  ['orange', 'var(--tint-1)'],
  ['yellow', 'var(--tint-2)'],
  ['green', 'var(--tint-3)'],
  ['teal', 'var(--tint-4)'],
  ['blue', 'var(--tint-5)'],
  ['indigo', 'var(--tint-6)'],
  ['purple', 'var(--tint-7)'],
  ['pink', 'var(--tint-8)'],
  ['grey', 'var(--tint-9)'],
]

const TINT = new Map(LIST_TINTS)

/** What each of the ten is called, under the pointer — the name a label
    stores, in English. */
export const TINT_SAID: Readonly<Record<string, string>> = {
  red: W.red,
  orange: W.orange,
  yellow: W.yellow,
  green: W.green,
  teal: W.teal,
  blue: W.blue,
  indigo: W.indigo,
  purple: W.purple,
  pink: W.pink,
  grey: W.grey,
}

/**
 * The same ten by name, as the index the chip paints with.
 *
 * A label stores the word — `red` — and the chip wants `--tint-0`; keeping
 * the order in one place is what stops the two drifting into disagreement
 * about which red is red.
 */
/**
 * The two rails a mark is chosen on: sixteen glyphs, then the ten tints,
 * each led by "its own look" drawn as what it does rather than as a swatch.
 *
 * One picker for everything that wears a chosen mark — a project
 *  and a document (`docs/specs/docs.md`, "A
 * document's mark"). It was written inside the project's settings; a
 * document asking the same question was going to be a second copy of it,
 * and two pickers for one question drift.
 *
 * Each press is the change — no Save and no Cancel — and pressing the one
 * already on does nothing.
 */
export function MarkRails({
  icon,
  tint,
  ownIcon,
  ownTintIcon,
  ownTint,
  onIcon,
  onTint,
  iconSaid,
  tintSaid,
  ownSaid,
  iconAttrs,
  tintAttrs,
}: {
  /** What is chosen now; null is its own look. */
  icon: string | null
  tint: number | null
  /** The glyph its own look has, drawn in the first cell of the glyph rail. */
  ownIcon: IconName
  /** And the first cell of the colour rail: the glyph, in its own colour. */
  ownTintIcon: IconName
  ownTint: string
  onIcon: (icon: IconName | null) => void
  onTint: (tint: number | null) => void
  iconSaid: string
  tintSaid: string
  ownSaid: string
  /** What the tests and the screen's own code address each rail by. */
  iconAttrs?: Record<string, string>
  tintAttrs?: Record<string, string>
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        {...iconAttrs}
        role="radiogroup"
        aria-label={iconSaid}
        className="flex max-w-full min-w-0 flex-wrap items-center gap-1 p-1 bg-track"
        style={{ borderRadius: 'var(--r-panel)' }}
      >
        {[null, ...PROJECT_MARKS].map((name) => {
          const on = (icon ?? null) === name
          return (
            <Fragment key={name ?? 'hashed'}>
              {name === PROJECT_MARKS[0] && <span aria-hidden className="mx-1 my-2 w-px self-stretch bg-line" />}
              <button
                type="button"
                role="radio"
                data-mark-pick={name ?? 'hashed'}
                aria-label={name ? (MARK_SAID[name] ?? name) : ownSaid}
                title={name ? (MARK_SAID[name] ?? name) : ownSaid}
                aria-checked={on}
                {...(on ? {} : { 'data-control': '' })}
                onClick={() => !on && onIcon(name)}
                className="flex size-7 items-center justify-center"
                style={{
                  borderRadius: 'var(--r-pill)',
                  background: on ? 'var(--track-on)' : 'transparent',
                  boxShadow: on ? 'var(--control-shadow)' : undefined,
                }}
              >
                <Icon name={name ?? ownIcon} size={16} style={{ color: on ? 'var(--ink)' : 'var(--ink-2)' }} />
              </button>
            </Fragment>
          )
        })}
      </div>

      <div
        {...tintAttrs}
        role="radiogroup"
        aria-label={tintSaid}
        className="flex max-w-full min-w-0 flex-wrap items-center gap-1 p-1 bg-track"
        style={{ borderRadius: 'var(--r-panel)' }}
      >
        {[null, ...LIST_TINTS.map((_, i) => i)].map((i) => {
          const on = (tint ?? null) === i
          const said = i === null ? ownSaid : (TINT_SAID[LIST_TINTS[i]?.[0] ?? ''] ?? LIST_TINTS[i]?.[0] ?? '')
          return (
            <Fragment key={i ?? 'hashed'}>
              {i === 0 && <span aria-hidden className="mx-1 my-2 w-px self-stretch bg-line" />}
              <button
                type="button"
                role="radio"
                data-tint-pick={i ?? 'hashed'}
                aria-label={said}
                title={said}
                aria-checked={on}
                {...(on ? {} : { 'data-control': '' })}
                onClick={() => !on && onTint(i)}
                className="flex size-7 items-center justify-center"
                style={{
                  borderRadius: 'var(--r-pill)',
                  background: on ? 'var(--track-on)' : 'transparent',
                  boxShadow: on ? 'var(--control-shadow)' : undefined,
                }}
              >
                {/* Its own look is drawn as what it does and not as a
                    colour: a swatch there would be a lie — it is not
                    orange, it is "whatever it would have been". */}
                {i === null ? (
                  <Icon name={ownTintIcon} size={15} style={{ color: ownTint }} />
                ) : (
                  <span className="size-4 rounded-full" style={{ background: `var(--tint-${i})`, opacity: on ? 1 : 0.7 }} />
                )}
              </button>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

export const TINT_AT = new Map(LIST_TINTS.map(([name], i) => [name, i]))

/**
 * The mark, in the colour the list was given or in the one it works out.
 *
 * No colour is not the absence of one: it means the mark decides, which is
 * what it always did — a stage is the accent, an ending is grey. Given one,
 * the mark is that colour whatever it is: a list marked Not started in red
 * is red, because the person said so, and a rule that kept the grey for
 * endings would make the setting a lie half the time.
 */
export function Dot({ icon, color }: { icon: string | null; color?: string | null | undefined }) {
  const mark = MARKS[icon ?? 'open'] ?? MARKS.open!
  return (
    <Icon
      name={mark.glyph}
      size={18}
      style={{
        color: (color ? TINT.get(color) : undefined) ?? (mark.lit ? 'var(--accent)' : 'var(--n-6)'),
      }}
    />
  )
}

/**
 * One of the premade faces an agent can wear.
 * The art is a constant of this product, never anything a person typed, so
 * it is set as markup; `theme.css` (`.af`) says when its parts move.
 */
export function AgentFaceMark({
  id,
  size,
  live = false,
  title,
  at = 0,
}: {
  id: AgentFace
  size: number
  live?: boolean
  title?: string
  /** Seconds into its loop it starts, so faces side by side are not in step. */
  at?: number
}) {
  /* A face moves only while it can be seen: six loops on every working
     agent of a long list, scrolled away, were frames spent on nothing. */
  const self = useRef<HTMLSpanElement>(null)
  const [seen, setSeen] = useState(true)
  useEffect(() => {
    const el = self.current
    if (!live || !el || typeof IntersectionObserver === 'undefined') return
    const eye = new IntersectionObserver(([e]) => setSeen(e!.isIntersecting))
    eye.observe(el)
    return () => eye.disconnect()
  }, [live])
  return (
    <span
      ref={self}
      data-agent-face={id}
      data-live={live && seen ? '' : undefined}
      role="img"
      aria-label={title}
      title={title}
      className="af"
      style={{ width: size, height: size, ['--af-at' as string]: `${-at}s` }}
      dangerouslySetInnerHTML={{ __html: agentFaceSvg(id, 'aria-hidden="true" focusable="false"') }}
    />
  )
}

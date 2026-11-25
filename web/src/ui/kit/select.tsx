import { KIT as W } from '../../words/kit.js'
import { Icon } from '../glyphs.jsx'
import { quietLook } from './controls.jsx'

/**
 * One answer out of several, in the space of one.
 *
 * A segmented control shows every option at once and is right when there are
 * three and you are choosing between them. A sort order is one answer that is
 * rarely changed, and giving it the same shape made two unrelated controls
 * look like a pair.
 */
export function Popup<T extends string>({
  value,
  onPick,
  options,
  label = W.sortBy,
}: {
  value: T
  onPick: (v: T) => void
  options: { id: T; label: string }[]
  /** What the control is for, for the people who cannot see where it sits. */
  label?: string
}) {
  return (
    <span
      data-control
      className="relative flex h-7 shrink-0 items-center gap-2 pr-2 pl-3 text-base font-medium bg-track text-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
      style={{
        borderRadius: 'var(--r-row)',
        letterSpacing: 'var(--track-body)',
      }}
    >
      {options.find((o) => o.id === value)?.label ?? ''}
      <Icon name="updown" size={14} className="text-ink-2" />
      {/* The real control, invisible over the drawn one: a native select
          brings the platform's own menu, its keyboard and its accessibility,
          and none of that is worth rebuilding to change what it looks like
          when shut. */}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onPick(e.target.value as T)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  )
}

/**
 * The answer on a settings line: a select, drawn as a quiet button.
 *
 * Native, so the keyboard, a phone's own picker and a screen reader all know
 * what it is. Its arrow is the stylesheet's, the one every select has — the
 * lines that drew a select used to draw an arrow of their own as well, and
 * the two landed four pixels apart as one broken mark. Here there is no
 * second one to draw.
 *
 * The ground is on a span round it rather than on the select, because a
 * select draws no `::after`, and the wash every control takes under the
 * pointer is one. The select itself is visible and fills the span, so the
 * control is as wide as its longest answer, as a select is: choosing a
 * shorter one does not move its left edge along a right-aligned line.
 */
export function Select<T extends string>({
  value,
  onPick,
  options,
  label,
  testId,
}: {
  value: T
  onPick: (v: T) => void
  options: readonly { id: T; label: string }[]
  /** What it answers, for the people who cannot see the line it is on. */
  label: string
  testId?: string
}) {
  return (
    <span data-control className="inline-flex shrink-0 rounded-full" style={quietLook}>
      <select
        aria-label={label}
        data-testid={testId}
        /* A pill's arrow stands further in — `theme.css`. */
        data-pill
        value={value}
        onChange={(e) => onPick(e.target.value as T)}
        className="h-8 cursor-pointer rounded-full bg-transparent pl-4 text-sm font-medium text-ink"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  )
}

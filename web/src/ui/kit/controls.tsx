import { notALogin } from './fields.jsx'

/* -------------------------------------------------------------- controls */

/**
 * The look of a quiet control: a button beside the one action, Use a
 * picture, a select on a settings line.
 *
 * One place for it, because it was written out at every one of them as
 * `--sunken` — a field's ground — and changing what a quiet control looks
 * like meant finding them all. `--control` says why it is its own colour.
 * Fields, wells and the box that shows something once stay `--sunken`.
 */
export const quietLook: React.CSSProperties = {
  background: 'var(--control)',
  color: 'var(--ink)',
}

export function Button({
  children,
  tone = 'quiet',
  ...rest
}: {
  children: React.ReactNode
  /** `primary` is the one action on the screen; everything else is quiet. */
  tone?: 'primary' | 'quiet' | 'danger'
} & React.ComponentProps<'button'>) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: 'var(--on-accent)' },
    quiet: quietLook,
    danger: { background: 'transparent', color: 'var(--danger)' },
  }
  return (
    /* Not a submit unless it says so: a Cancel inside a form should not send it.
       The caller's class and style are added to the kit's, not swapped for them. */
    <button
      type="button"
      data-control
      {...rest}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium ${rest.className ?? ''}`}
      style={{ height: 'var(--control-h)', ...styles[tone], ...rest.style }}
    >
      {children}
    </button>
  )
}

/** A field of the kit's. Not a login unless it says so — `kit/fields.tsx`. */
export function Field({ wide = false, ...rest }: { wide?: boolean } & React.ComponentProps<'input'>) {
  return (
    <input
      {...notALogin}
      {...rest}
      className={`rounded-[var(--r-tile)] px-2 text-sm placeholder:text-[var(--ink-3)] ${wide ? 'w-full' : ''} ${rest.className ?? ''}`}
      style={{ height: 'var(--control-h)', background: 'var(--sunken)', color: 'var(--ink)', ...rest.style }}
    />
  )
}

/** A key, shown the size it is pressed at. */
export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-[var(--r-tile)] px-1 font-sans text-badge leading-[15px] bg-sunken text-ink-2">{children}</kbd>
}

/**
 * A pill that is on or off.
 *
 * The same shape as the pills that hold a choice beside it, because "which
 * list" and "can the client see it" are both fields of the thing being made
 * and a checkbox among pills reads as a different kind of question.
 *
 * On is the raised thumb of a segmented control, not the accent. Four
 * accented pills and an accented Create is five things claiming to be the
 * action, and the glass spec gives the accent to exactly one.
 */
/**
 * How much is waiting, wherever that is said.
 *
 * It was written out twice — a room in the sidebar and a tool in a
 * project's column — at two type sizes and two paddings, so the two numbers
 * on one screen were visibly different objects saying the same thing. One
 * component, because a badge is one idea and the second copy is the one
 * that drifts.
 *
 * `--badge` is its ground in both themes, and the pill's radius comes from
 * its own height rather than a number: at a fixed ten a two-digit count
 * stretches into a rounded rectangle while a one-digit one stays a circle.
 */
export function Badge({
  count,
  testId,
  tone = 'normal',
}: {
  count: number
  testId?: string
  /**
   * One answer, not two booleans that could both be true.
   * `urgent`: somebody named you behind it — red, as Slack draws a mention.
   * `quiet`: what a turned-down room has unread: there to see, grey, asking nothing.
   */
  tone?: 'normal' | 'urgent' | 'quiet'
}) {
  const urgent = tone === 'urgent'
  const quiet = tone === 'quiet'
  if (count <= 0) return null
  return (
    <span
      data-badge
      data-urgent={urgent || undefined}
      data-quiet={quiet || undefined}
      {...(testId ? { 'data-testid': testId } : {})}
      className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center px-2 text-badge font-medium tabular-nums"
      /* Half its own height, which is what makes a pill a pill rather than
         a number off the radius ramp. */
      style={{
        background: urgent ? 'var(--danger-fill)' : quiet ? 'var(--track)' : 'var(--badge)',
        borderRadius: 9,
        color: urgent ? 'var(--on-accent)' : quiet ? 'var(--ink-3)' : 'var(--ink)',
      }}
    >
      {/* The number's box is trimmed to its figures — cap height to
          baseline — so centring it centres the ink. Untrimmed, the font's
          room for accents above sat the figures a pixel low. The trim is a
          block's, on its own lines: on the flex box it did nothing. */}
      {/* A room counts to a hundred and no further — the server stops
          there, and a number nobody reads to the end is not a count. */}
      <span className="block [text-box:trim-both_cap_alphabetic]">{count > 99 ? '99+' : count}</span>
    </span>
  )
}

/**
 * On or off, drawn as a switch over the checkbox that is the control — so
 * it is a checkbox to the keyboard, a screen reader and a test, and a
 * switch to the eye. A setting that takes effect at once is a switch; a
 * checkbox says "and then press Save", and nothing here waits for one.
 */
export function Switch({
  on,
  onChange,
  testId,
  said,
  disabled = false,
  ...rest
}: {
  on: boolean
  onChange: (on: boolean) => void
  testId?: string
  said: string
  disabled?: boolean
} & Omit<React.ComponentProps<'input'>, 'type' | 'checked' | 'onChange' | 'disabled'>) {
  return (
    <span
      className="relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
      style={{
        background: on ? 'var(--accent)' : 'color-mix(in oklch, var(--ink) 18%, transparent)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        aria-hidden
        className="absolute top-1 left-1 size-4 rounded-full transition-transform duration-150"
        style={{ background: '#fff', transform: on ? 'translateX(16px)' : 'none', boxShadow: '0 1px 2px rgb(0 0 0 / 0.2)' }}
      />
      <input
        type="checkbox"
        role="switch"
        data-testid={testId}
        aria-label={said}
        {...rest}
        checked={on}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-default"
      />
    </span>
  )
}

export function Toggle({
  on,
  onChange,
  children,
  testId,
  wide = false,
}: {
  on: boolean
  onChange: (on: boolean) => void
  children: React.ReactNode
  testId?: string
  /** An equal share of the row, for a set of them that should line up. */
  wide?: boolean
}) {
  return (
    <button
      type="button"
      data-control
      data-testid={testId}
      data-on={on || undefined}
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className={`flex h-7 items-center gap-2 px-3 text-base font-medium ${wide ? 'min-w-px flex-1 justify-center' : 'shrink-0'}`}
      style={{
        /*
         * The chosen one is filled and the rest are outlines.
         *
         * It was the other way round — white on a white panel for the
         * chosen, grey for the rest — which made the thing somebody had
         * turned on the thing that disappeared into the background. A
         * control that says "this is on" should be the one with weight.
         *
         * `--track` is five percent black, so filled here is not a colour
         * but a shade: the accent would make seven of these a row of
         * blue buttons, and a toggle is not a thing to press.
         */
        background: on ? 'var(--track)' : 'transparent',
        boxShadow: on ? undefined : 'var(--control-shadow)',
        borderRadius: 'var(--r-pill)',
        /* One step darker than the greys this product uses for a thing
           that is off: an outlined control is already quieter than a
           filled one, and taking the text down as well made the word
           inside it hard to read rather than merely secondary. */
        color: on ? 'var(--ink)' : 'var(--ink-2)',
        letterSpacing: 'var(--track-body)',
      }}
    >
      {children}
    </button>
  )
}

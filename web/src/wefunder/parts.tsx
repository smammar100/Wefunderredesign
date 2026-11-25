import { useEffect, useState } from 'react'

/*
 * The building blocks of the Wefunder page, in the Tuff landing's grammar:
 * one ruled column 1152 wide with hairline edges and a "+" where the rules
 * meet, sections that alternate dark and light (`data-lp-tone`), heads set
 * 44 / 560, and illustrations on a dotted stage inside a hairline ring.
 *
 * No scroll-triggered motion (marketing-pages): the hero plays its intro
 * once per session, and everything else moves only when it is pressed.
 */

export const WF = 'https://wefunder.com'

export const mono: React.CSSProperties = { fontFamily: "'Geist Mono', var(--font-mono)" }

/* The "+" where a section's top rule meets the column's edge. */
function Cross({ side }: { side: 'left' | 'right' }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-[-6px] z-10 size-[11px]"
      style={{
        [side]: -6,
        backgroundImage: 'linear-gradient(var(--lp-line-strong), var(--lp-line-strong)), linear-gradient(var(--lp-line-strong), var(--lp-line-strong))',
        backgroundSize: '1px 100%, 100% 1px',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}

export function Band({
  id,
  tone,
  children,
  label,
}: {
  id?: string
  tone: 'dark' | 'light'
  children: React.ReactNode
  /** What the section is, for a screen reader walking landmarks. */
  label?: string
}) {
  return (
    <section
      id={id}
      aria-label={label}
      data-lp-tone={tone}
      className="scroll-mt-16 px-4 sm:px-6"
      style={{ background: 'var(--lp-bg)', color: 'var(--lp-fg)', borderTop: '1px solid var(--lp-line)' }}
    >
      <div className="relative mx-auto max-w-[1152px]" style={{ borderLeft: '1px solid var(--lp-line)', borderRight: '1px solid var(--lp-line)' }}>
        <Cross side="left" />
        <Cross side="right" />
        {children}
      </div>
    </section>
  )
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs leading-5 font-medium tracking-[0.04em] uppercase" style={{ ...mono, color: 'var(--lp-accent)' }}>
      {children}
    </p>
  )
}

export function Head({
  eyebrow,
  title,
  lede,
  aside,
  center = false,
}: {
  eyebrow: string
  title: React.ReactNode
  lede?: React.ReactNode
  aside?: React.ReactNode
  center?: boolean
}) {
  return (
    <div
      className={`grid gap-8 px-5 pt-20 pb-10 sm:px-12 sm:pt-32 sm:pb-12 lg:gap-12 ${aside ? 'lg:grid-cols-[1.4fr_1fr] lg:items-end' : ''} ${center ? 'justify-items-center text-center' : ''}`}
    >
      <div className={`flex max-w-[640px] flex-col gap-4 ${center ? 'items-center' : ''}`}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-[34px] leading-[1.08] font-[560] tracking-[-0.03em] text-balance sm:text-[44px]">{title}</h2>
        {lede && (
          <p className="text-[17px] leading-7 font-medium tracking-[-0.1px] text-pretty" style={{ color: 'var(--lp-muted)' }}>
            {lede}
          </p>
        )}
      </div>
      {aside}
    </div>
  )
}

/* Cells divided by hairlines: a 1px gap over the line colour. */
export function Ruled({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid gap-px ${className}`} style={{ background: 'var(--lp-line)', borderTop: '1px solid var(--lp-line)' }}>
      {children}
    </div>
  )
}

export function Cell({
  title,
  body,
  href,
  more = 'Learn more',
  children,
  className = '',
}: {
  title: React.ReactNode
  body: React.ReactNode
  href?: string
  more?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-6 p-5 sm:p-8 ${className}`} style={{ background: 'var(--lp-bg)' }}>
      {children}
      <div className="flex flex-col gap-1">
        <h3 className="text-[17px] leading-6 font-[560] tracking-[-0.1px] text-balance">{title}</h3>
        <p className="text-[15px] leading-[22px] font-medium tracking-[-0.1px] text-pretty" style={{ color: 'var(--lp-muted)' }}>
          {body}
        </p>
        {href && (
          <a href={href} className="lp-link mt-2 w-max text-sm font-medium" style={{ color: 'var(--lp-fg)' }}>
            {more} <span aria-hidden>→</span>
          </a>
        )}
      </div>
    </div>
  )
}

/*
 * The dotted stage an illustration stands on.
 *
 * Drawn from markup, so it says what it shows (`label`), can't be
 * selected, and lets the pointer through — unless it is a demo somebody
 * presses (`live`).
 */
export function Stage({
  label,
  children,
  className = '',
  live = false,
}: {
  label: string
  children: React.ReactNode
  className?: string
  live?: boolean
}) {
  return (
    <div
      role={live ? 'group' : 'img'}
      aria-label={label}
      className={`relative overflow-hidden p-5 select-none sm:p-6 ${live ? '' : 'pointer-events-none'} ${className}`}
      style={{
        borderRadius: 16,
        backgroundImage: 'radial-gradient(var(--lp-line-strong) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        boxShadow: 'inset 0 0 0 1px var(--lp-line)',
      }}
    >
      {children}
    </div>
  )
}

/* A floating piece of product: the card or window an illustration is made of. */
export function Sheet({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`relative ${className}`} style={{ background: 'var(--lp-card)', borderRadius: 12, boxShadow: 'var(--lp-lift)', ...style }}>
      {children}
    </div>
  )
}

/* A window's top: three dots and, if it has one, a title. */
export function Chrome({ title }: { title?: string }) {
  return (
    <div className="flex h-9 items-center gap-1.5 px-3" style={{ borderBottom: '1px solid var(--lp-line)' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-2 rounded-full" style={{ background: 'var(--lp-line-strong)' }} />
      ))}
      {title && (
        <span className="ml-2 text-xs font-medium" style={{ color: 'var(--lp-muted)' }}>
          {title}
        </span>
      )}
    </div>
  )
}

/* A small coloured word: a status, a strength, a step. */
export function Pill({ tint, children }: { tint: number | 'accent' | 'quiet'; children: React.ReactNode }) {
  const c = tint === 'accent' ? 'var(--lp-accent)' : tint === 'quiet' ? 'var(--lp-faint)' : `var(--tint-${tint})`
  return (
    <span
      className="inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[11px] font-semibold tracking-[0.02em]"
      style={{ background: `color-mix(in oklch, ${c} 16%, transparent)`, color: `color-mix(in oklch, ${c} 70%, var(--lp-fg))` }}
    >
      {children}
    </span>
  )
}

/* The two buttons of the page. */
export const primary: React.CSSProperties = {
  background: 'var(--lp-accent)',
  color: '#fff',
  boxShadow: 'inset 0 0 0 1px rgb(255 255 255 / 0.18), 0 1px 2px rgb(9 9 11 / 0.12), 0 4px 12px -4px color-mix(in oklch, var(--lp-accent) 50%, transparent)',
}
export const secondary: React.CSSProperties = { color: 'var(--lp-fg)', boxShadow: 'inset 0 0 0 1px var(--lp-line-strong)' }

/* A quote someone really said, with who said it. */
export function Quote({ children, who, role, note }: { children: React.ReactNode; who: string; role: string; note?: string }) {
  const initials = who
    .split(' ')
    .map((w) => w[0])
    .join('')
  return (
    <figure className="flex flex-col gap-5 px-5 py-10 sm:px-12 sm:py-14" style={{ background: 'var(--lp-bg)' }}>
      <blockquote className="max-w-[860px] text-[20px] leading-[1.45] font-medium tracking-[-0.015em] text-pretty sm:text-[24px]">
        <span aria-hidden style={{ color: 'var(--lp-faint)' }}>
          “
        </span>
        {children}
        <span aria-hidden style={{ color: 'var(--lp-faint)' }}>
          ”
        </span>
      </blockquote>
      <figcaption className="flex items-center gap-3 text-sm">
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: 'var(--lp-chip)', boxShadow: 'inset 0 0 0 1px var(--lp-line)', color: 'var(--lp-muted)' }}
        >
          {initials}
        </span>
        <span className="flex flex-col">
          <span className="font-[560]">{who}</span>
          <span style={{ color: 'var(--lp-muted)' }}>
            {role}
            {note && <> · {note}</>}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}

/* A row of checks: what a product includes. */
export function Checks({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2.5 text-[15px] leading-[22px] font-medium" style={{ color: 'var(--lp-muted)' }}>
      {items.map((t, i) => (
        <li key={i} className="flex gap-2.5">
          <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" className="mt-[3px] shrink-0" style={{ color: 'var(--lp-accent)' }}>
            <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

/* Whether the hero's intro has played in this visit already. */
export function useIntro(): boolean {
  const [play] = useState(() => {
    try {
      if (sessionStorage.getItem('wf-intro')) return false
      sessionStorage.setItem('wf-intro', '1')
      return true
    } catch {
      return false
    }
  })
  return play
}

/* The page is dark whatever the visitor chose, and the kit takes it too. */
export function useDarkPage() {
  useEffect(() => {
    const root = document.documentElement
    const was = root.dataset.theme
    root.dataset.theme = 'dark'
    return () => {
      if (was) root.dataset.theme = was
    }
  }, [])
}

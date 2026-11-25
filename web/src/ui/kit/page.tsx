import { createContext, useContext } from 'react'
import { type Marked, ProjectMark as Mark, markOf } from '../icons.jsx'
import { type ArtName, Art } from '../illustrations/Art.jsx'
import { Fluid } from './rows.jsx'
import { useWide } from './layout.jsx'

export function Header({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  /* The same shape as a project's name, because these are the same kind of
     fact: where you are. It used to be a 13px line under a hairline, which
     made every screen above the projects read as a subsection of one. */
  return (
    /* On a phone the bar names the screen, as `PageTitle` says; here the
       name would be the same words twice. What sits beside it is kept. */
    <div className="flex shrink-0 items-center gap-3 px-[var(--gutter)] pt-7 max-sm:pt-3">
      <h1
        title={typeof title === 'string' ? title : undefined}
        className="min-w-0 flex-1 truncate text-title font-medium max-lg:hidden text-ink"
        style={{ letterSpacing: 'var(--track-display)' }}
      >
        {title}
      </h1>
      <div className="flex shrink-0 items-center gap-3">{children}</div>
    </div>
  )
}

/**
 * Nothing here — said only once that is known.
 *
 * An empty list is a claim, and `useState([])` cannot tell *nothing* from
 * *not yet*, so every screen in the product made the claim the instant it
 * mounted and took it back a moment later. It reads as a flash and it is a
 * lie.
 *
 * The rule the screens follow: hold the rows as `T[] | null` and let `null`
 * mean nobody has answered. The compiler then asks about the third case at
 * every callsite, which is the only reason it stays fixed.
 */
export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-1 py-4 text-base text-ink-2">{children}</div>
}

/**
 * A heading inside a screen. Uppercase and tiny, because it is a label for a
 * group and not something to read.
 */
export function GroupLabel({ children }: { children: React.ReactNode }) {
  /* The same size as the rows under it, told apart by colour alone.
     Shrinking and letter-spacing it, which is the reflex, makes the sidebar
     read as a form with fieldsets rather than as a list of places. */
  return (
    <div
      /*
       * A hairline instead of the word when the column is glyphs.
       *
       * The heading is the thing that says where one list ends and the next
       * begins, and losing it entirely runs the projects into the rooms. A
       * rule keeps the division and costs no width — the word would not fit
       * in fifty-six pixels anyway. `docs/specs/collapsed-sidebar.md`.
       */
      className="px-3 pt-5 pb-2 text-base group-data-[shut]/sidebar:mx-3 group-data-[shut]/sidebar:h-px group-data-[shut]/sidebar:overflow-hidden group-data-[shut]/sidebar:p-0 group-data-[shut]/sidebar:text-transparent"
      style={{ color: 'var(--ink-3)', letterSpacing: 'var(--track-body)' }}
    >
      {children}
    </div>
  )
}

/** The line between two rows in a panel, inset to where their titles start. */
export function Hairline({ inset = 46, away = false }: { inset?: number; away?: boolean }) {
  return (
    <div data-hairline className="shrink-0" style={{ paddingLeft: inset }}>
      {/*
        Gone where a row is lit, rather than drawn over it.

        The line separates two rows, and a row under the pointer is not
        separated from anything — it is the one being looked at. Left in, it
        runs across the top and bottom edge of the highlight and turns a lit
        row into a box with a lid on it. Hidden rather than unrendered, so
        nothing below it moves by a pixel as the pointer goes down the list.
      */}
      <div data-line className="bg-line" style={{ height: 1, opacity: away ? 0 : 1 }} />
    </div>
  )
}

/** A group of rows on a ground of its own, with hairlines between them. */
export function Panel({
  children,
  className = '',
  also,
}: {
  children: React.ReactNode
  className?: string
  /** For a panel a keyboard walks: what is lit when the pointer is elsewhere. */
  also?: string
}) {
  return (
    <div
      data-fluid
      className={`relative flex flex-col overflow-hidden ${className}`}
      style={{ background: 'var(--panel)', borderRadius: 'var(--r-card)' }}
    >
      {/*
        A panel of rows lights the way the navigation does.
        
        Here rather than at each list, because every panel of rows wants the
        same thing and the ones that are not rows — a switch, a field, a line
        of hours — say nothing about themselves and are not lit. A row that
        can be pressed marks itself `data-row`, which is also what gives it
        the press behaviour and the hover everywhere else.
      */}
      <Fluid {...(also ? { also } : {})} />
      {children}
    </div>
  )
}

/** A heading over a panel: the same size as a board column's name. */
export function SectionHead({ children }: { children: React.ReactNode }) {
  /* A heading, said as one: Settings' sections were `h2`s before they took
     this shape, and a screen reader walking a task by its headings should
     find its comments. */
  return (
    <h2 className="px-1 text-xl font-medium text-ink" style={{ letterSpacing: 'var(--track-title)' }}>
      {children}
    </h2>
  )
}

/**
 * The name of the screen, at the size the project's name is given.
 *
 * Twenty-four, not thirty-four. That was a display size on a screen that is
 * a list: "Tasks" took the height of three rows and said nothing the tab
 * under it had not. It still leads — the largest thing on the screen —
 * without being what the screen is about.
 *
 * Two components draw a screen's name: this one and `Header` above. Both
 * were thirty-four and both are twenty-four, which is the thing to check
 * when this number moves again — changing one and measuring the other is
 * how it looks like an edit that did not take.
 */
export function PageTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  /* On a phone the name is in the top bar — the project's, with the tab in
     the menu beside the tool's controls, or the screen's — so here it would
     be the same words a second time on the narrowest screen there is. What
     it does is kept. */
  const wide = useWide()
  if (!wide) return action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null
  return (
    <div className="flex shrink-0 items-center gap-3">
      <h1 title={typeof children === 'string' ? children : undefined} className="min-w-0 flex-1 truncate text-title font-medium text-ink" style={{ letterSpacing: 'var(--track-display)' }}>
        {children}
      </h1>
      {action}
    </div>
  )
}

/**
 * A screen with nothing on it yet, saying so properly.
 *
 * The design asks the product to look alive for one person with an agent, and
 * an empty screen was a grey sentence in the top-left corner — which reads as
 * something that failed to load. A drawing of the thing this place holds
 * things in, holding none of them; a line that says what this place is for;
 * and a line that says what will put something here.
 */
export function EmptyState({
  art,
  title,
  children,
  action,
}: {
  /* The object this screen holds things in, drawn holding none of them —
     `ui/illustrations/art.ts`. */
  art: ArtName
  title: string
  children?: React.ReactNode
  /*
   * The first thing to do here, under the sentence explaining it.
   *
   * An empty screen that only explains leaves somebody looking for the
   * button that was mentioned — and on these screens it is in a corner,
   * which is where a person who already knows the product finds it. The
   * one who does not is the one reading this.
   *
   * Optional, because some empty screens have no first action: My tasks
   * fills up because somebody else assigns you something.
   */
  action?: React.ReactNode
}) {
  return (
    <div data-empty={art} className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
      <Art name={art} />
      <p className="mt-2 text-xl font-medium text-ink text-balance" style={{ letterSpacing: 'var(--track-title)' }}>
        {title}
      </p>
      {children && <p className="max-w-[420px] text-base text-ink-2 text-pretty">{children}</p>}
      {/* Four above it rather than the two the rest of this stack uses: a
          button is a different kind of thing from the sentence over it, and
          the gap is what says so. */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/**
 * Every project the shell holds, by id, so a row that names a project by id
 * and name alone draws the mark that project chose — its picture, glyph and
 * tint — and not the one its id would give. A row in My tasks came from a
 * list that carries no mark, and drew the hashed one beside a sidebar
 * showing the chosen one.
 */
export const ProjectMarksContext = createContext<ReadonlyMap<string, Marked>>(new Map())

/** A project said in one line: its mark and its name. */
export function ProjectChip({ id, name }: { id: string; name: string }) {
  const known = useContext(ProjectMarksContext).get(id)
  return (
    <span className="flex shrink-0 items-center gap-2 text-base text-ink-2">
      <Mark {...(known ? markOf(known) : { id, name })} name={name} size={16} />
      {name}
    </span>
  )
}

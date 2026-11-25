import { createContext, useContext, useEffect, useState } from 'react'
import type { Presence } from '@tracker/shared-schema'
import { api, Refused } from '../data/api.js'
import { Icon } from './glyphs.jsx'
import { Avatar, Dialog, Hairline, Panel } from './kit.jsx'
import { MORE, dayMonth, CLOCK } from '../data/words.js'
import { PERSON_CARD as W } from '../words/personCard.js'
import { today as todayHere } from '../data/calendar.js'

/**
 * A person's card — TRA-103, `docs/specs/person-card.md`.
 *
 * A glance at somebody from wherever their face is: who they are, what time
 * it is where they are, how to reach them, and what they are doing that the
 * person looking is part of. Every line on it is a door to the screen that
 * says more, and the doors are the shell's, handed down here so a card in a
 * chat message can open a conversation without the chat knowing how.
 */
export type PersonDoors = {
  /** Their page — `/members/:actorId`; left out where the Members screen is
      the owner's alone. */
  open?: (actorId: string) => void
  /** The direct conversation with them, made the first time. */
  message: (actorId: string) => void
  openTask: (projectId: string, taskId: string) => void
  /** A document named in a message — `docs/specs/docs.md`. */
  openFile?: (projectId: string, fileId: string) => void
  /** An announcement, from what points at it. */
  openPost?: (projectId: string, postId: string) => void
  /** A room, from where a file in Docs says it was sent. */
  openRoom?: (roomId: string) => void
  /** Their window, over whatever screen this is — `docs/specs/person-card.md`. */
  show?: (actorId: string) => void
  /**
   * The conversation with an agent, beside the work where the window is
   * wide enough and as a screen where it is not.
   * Answers whether this somebody is an agent it would open beside.
   */
  beside?: { is: (actorId: string) => boolean; open: (actorId: string) => void }
}

export const PersonDoorsContext = createContext<PersonDoors | null>(null)

type Card = {
  person: {
    actor_id: string
    name: string
    avatar_url?: string | null
    title?: string | null
    email?: string | null
    timezone?: string | null
    presence?: Presence | null
  }
  shared: { id: string; name: string; key: string; open: number; overdue: number; done: number }[]
  open: {
    id: string
    number: number
    title: string
    project_id: string
    project_key: string
    project_name?: string
    due_on?: string | null
    overdue: boolean
  }[]
}

/*
 * Somebody's window, read once and kept — and read ahead while the hand is on
 * their face, so pressing it opens the whole window at once rather than its
 * frame and then, a request later, its insides. `docs/specs/person-card.md`.
 */
/** Somebody who was here and was removed: their name and face, and that they are gone. */
type Gone = { removed: { actor_id: string; name: string; avatar_url?: string | null } }
const people = new Map<string, { at: number; card: Promise<Card | Gone | null> }>()
/* An id from a body is whatever its writer put there: `../me` sent every
   reader's hover to an address of the writer's choosing. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isPersonId = (id: string) => UUID.test(id)
export function personOf(actorId: string): Promise<Card | Gone | null> {
  if (!UUID.test(actorId)) return Promise.resolve(null)
  const had = people.get(actorId)
  /* Fresh for a minute: what is on somebody moves through a day. */
  if (had && Date.now() - had.at < 60_000) return had.card
  const card = api<Card>(`/people/${actorId}`)
    .then((r): Card => ({ ...r, shared: r.shared ?? [], open: r.open ?? [] }))
    .catch((e): Gone | null => {
      const said = e instanceof Refused && e.status === 410 ? (e.said as { person?: Gone['removed'] }) : null
      if (said?.person) return { removed: said.person }
      people.delete(actorId)
      return null
    })
  people.set(actorId, { at: Date.now(), card })
  return card
}

/** The time where they are, and whether that is a sensible zone at all. */
function theirClock(zone: string | null | undefined): string | null {
  if (!zone) return null
  try {
    return new Intl.DateTimeFormat(CLOCK, { hour: 'numeric', minute: '2-digit', timeZone: zone }).format(new Date())
  } catch {
    // A zone the browser does not know is not a time worth guessing at.
    return null
  }
}

/**
 * Somebody's face or name, opening their card.
 *
 * Nothing but the face where there is no shell to open doors from — a card
 * whose buttons go nowhere is worse than none.
 */
export function PersonFace({
  actorId,
  name,
  children,
}: {
  actorId: string
  name: string
  meId?: string | undefined
  children: React.ReactNode
}) {
  const doors = useContext(PersonDoorsContext)
  if (!doors?.show || !actorId) return <>{children}</>
  const show = doors.show
  return (
    /* A span that acts as a button rather than a button: what it wraps can
       be a heading — a direct conversation's head is the person's name. */
    <span
      role="button"
      tabIndex={0}
      data-testid="person-face"
      aria-label={W.about(name)}
      onPointerEnter={() => void personOf(actorId)}
      onPointerDown={() => void personOf(actorId)}
      onClick={() => show(actorId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          show(actorId)
        }
      }}
      className="inline-flex max-w-full cursor-pointer text-left"
    >
      {children}
    </span>
  )
}

/**
 * Somebody, in the middle of the screen — `docs/specs/person-card.md`.
 *
 * One window wherever a person is pressed, wide enough for their work: who
 * they are and how to reach them at the head, then the projects you share,
 * then every task open on them there, grouped by project. It scrolls inside
 * itself, so a person with forty tasks is a longer list rather than a cut one.
 */
export function PersonWindow({
  actorId,
  meId,
  doors,
  onClose,
}: {
  actorId: string
  meId?: string | undefined
  doors: PersonDoors
  onClose: () => void
}) {
  /*
   * Drawn whole or not yet: the window waits for what goes in it — read
   * ahead on hover, so usually already here — and only past a moment does it
   * open on its frame and fill. It drew its head and then, a request later,
   * everything under it, which read as the window jerking open.
   */
  const [card, setCard] = useState<Card | Gone | null | undefined>(undefined)
  const [late, setLate] = useState(false)
  useEffect(() => {
    let alive = true
    setCard(undefined)
    void personOf(actorId).then((c) => alive && setCard(c))
    const t = setTimeout(() => alive && setLate(true), 400)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [actorId])
  if (card === undefined && !late) return null
  return (
    <Dialog
      title={MORE.profile}
      testId="person-window"
      onClose={onClose}
      footer={
        /* Only to a page that is there: not for somebody removed, nor a
           card that could not be read. */
        doors.open &&
        card &&
        'person' in card && (
          <button
            data-testid="person-card-page"
            onClick={() => {
              onClose()
              doors.open?.(actorId)
            }}
            className="text-sm font-medium text-accent-ink"
          >
            {W.openTheirPage}
          </button>
        )
      }
    >
      {card && 'removed' in card ? (
        <div data-person-removed className="flex items-center gap-4 p-4">
          <span className="opacity-60 grayscale">
            <Avatar id={card.removed.actor_id} name={card.removed.name} url={card.removed.avatar_url ?? null} size={48} />
          </span>
          <div className="flex min-w-px flex-1 flex-col gap-1">
            <span className="truncate text-lg font-medium text-ink">{card.removed.name}</span>
            <span className="text-base text-ink-2">{W.removed}</span>
            <span className="text-sm text-ink-3">{W.removedSays}</span>
          </div>
        </div>
      ) : (
        <PersonCardBody card={card} meId={meId} doors={doors} close={onClose} />
      )}
    </Dialog>
  )
}

function PersonCardBody({
  card,
  meId,
  doors,
  close,
}: {
  /** Undefined while it is read; null when it could not be. */
  card: Card | null | undefined
  meId?: string | undefined
  doors: PersonDoors
  close: () => void
}) {
  const [, tick] = useState(0)
  const failed = card === null

  /* Their clock moves while the card is open. */
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  if (failed) {
    return <div className="p-4 text-base text-ink-3">{W.couldNotLoad}</div>
  }
  /* The card's own height while it loads, so it does not grow under the
     hand when the answer lands. */
  if (!card?.person) return <div data-person-card className="h-[240px]" />

  const p = card.person
  const self = p.actor_id === meId
  const clock = theirClock(p.timezone)
  const projects = new Set(card.shared.map((s) => s.id))
  const theirs = card.open.filter((t) => projects.has(t.project_id))
  /* By project, in the order the shared projects are listed. */
  const byProject = card.shared
    .map((s) => ({ project: s, tasks: theirs.filter((t) => t.project_id === s.id) }))
    .filter((g) => g.tasks.length > 0)
  const today = todayHere()
  const due = (d: string) => dayMonth(new Date(`${d}T00:00:00`))

  return (
    <div data-person-card className="flex max-h-[min(70vh,720px)] flex-col gap-6 overflow-y-auto px-4 pt-2 pb-4">
      {/* On a phone the Message button goes under the name, the width of the
          window, rather than cutting the name short beside it. */}
      <div className="flex flex-wrap items-start gap-4">
        <Avatar name={p.name} id={p.actor_id} url={p.avatar_url} size={72} presence={p.presence} />
        <div className="flex min-w-px flex-1 flex-col gap-1 pt-1">
          <span
            data-testid="person-card-name"
            className="truncate text-title font-medium text-ink"
            style={{ letterSpacing: 'var(--track-title)' }}
          >
            {p.name}
          </span>
          {p.title && (
            <span data-person-title className="truncate text-base text-ink-2">
              {p.title}
            </span>
          )}
          {(clock || p.email) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-2">
              {clock && (
                <span data-person-clock className="flex items-center gap-2">
                  <Icon name="clock" size={14} className="text-ink-3" style={{ flexShrink: 0 }} />
                  <span>
                    {W.localTime(clock)}
                    <span className="text-ink-3"> · {p.timezone}</span>
                  </span>
                </span>
              )}
              {p.email && (
                <a data-person-email href={`mailto:${p.email}`} className="flex min-w-px items-center gap-2 text-ink-2">
                  <Icon name="at" size={14} className="text-ink-3" style={{ flexShrink: 0 }} />
                  <span className="truncate">{p.email}</span>
                </a>
              )}
            </div>
          )}
        </div>
        {!self && (
          <button
            data-testid="person-card-message"
            onClick={() => {
              close()
              /* An agent's talk is usually about what is on the screen, so
                 it opens beside it. */
              if (doors.beside?.is(p.actor_id)) doors.beside.open(p.actor_id)
              else doors.message(p.actor_id)
            }}
            className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-base font-medium max-sm:w-full bg-accent text-on-accent"
          >
            <Icon name="bubble" size={16} />
            {W.message}
          </button>
        )}
      </div>

      {/* Their work where the one looking is too — not everything they are
          on, which is their page's to say. */}
      {card.shared.length > 0 && (
        <section className="flex flex-col gap-2">
          <span className="px-1 text-sm font-medium text-ink-3">{W.projectsYouShare}</span>
          <Panel>
            {card.shared.map((s, i) => (
              <div key={s.id} className="contents">
                {i > 0 && <Hairline inset={14} />}
                <div data-person-project={s.name} className="flex items-center gap-3 px-4 py-3 text-base">
                  <span className="min-w-px flex-1 truncate text-ink">{s.name}</span>
                  <span className="shrink-0 tabular-nums text-ink-2">{W.nOpen(s.open)}</span>
                  {s.overdue > 0 && <span className="shrink-0 tabular-nums text-due">{W.nOverdue(s.overdue)}</span>}
                  <span className="shrink-0 tabular-nums max-sm:hidden text-ink-3">{W.nDone(s.done)}</span>
                </div>
              </div>
            ))}
          </Panel>
        </section>
      )}

      {byProject.length > 0 && (
        <section className="flex flex-col gap-2">
          <span className="px-1 text-sm font-medium text-ink-3">{W.assignedTo(self, p.name.split(' ')[0] ?? '', theirs.length)}</span>
          {byProject.map(({ project, tasks }) => (
            <div key={project.id} className="flex flex-col gap-1">
              <span className="px-1 pt-1 text-sm text-ink-2">{project.name}</span>
              <Panel>
                {tasks.map((t, i) => (
                  <div key={t.id} className="contents">
                    {i > 0 && <Hairline inset={14} />}
                    <button
                      data-person-task
                      onClick={() => {
                        close()
                        doors.openTask(t.project_id, t.id)
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-base transition-colors mouse:hover:bg-[var(--hover)]"
                    >
                      <span className="w-[74px] shrink-0 font-mono text-sm text-ink-3">
                        {t.project_key}-{t.number}
                      </span>
                      <span className="min-w-px flex-1 truncate" style={{ color: t.overdue ? 'var(--due)' : 'var(--ink)' }}>
                        {t.title}
                      </span>
                      {t.due_on && (
                        <span className="shrink-0 text-sm tabular-nums" style={{ color: t.due_on < today ? 'var(--due)' : 'var(--ink-3)' }}>
                          {due(t.due_on)}
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </Panel>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

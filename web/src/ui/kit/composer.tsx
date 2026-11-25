import { type Named } from '../../data/doc.js'
import { useState, useEffect } from 'react'
import { BAR } from '../../data/words.js'
import { Icon } from '../glyphs.jsx'
import { api } from '../../data/api.js'
import { type Attached } from '../../data/upload.js'
import { useLinkCard } from '../../data/linkCard.js'
import { type Card, LinkCard } from '../LinkCard.jsx'
import { Avatar } from './avatar.jsx'
import { useAttach } from './attach.jsx'
import { notALogin } from './fields.jsx'

/**
 * A line to write on at the foot of a conversation.
 *
 * The same shape wherever something is said — a task, a document, a room —
 * because saying something is one action and it should not look like three.
 */
type Nameable = {
  kind?: 'doc'
  id: string
  number: number | null
  title: string
  project_id: string
  project_key?: string | null
  completed_at?: string | null
}

/** Somebody @ can name on a line: who they are and the face to show. */
type Nameable2 = { actor_id: string; name: string; avatar_url?: string | null | undefined }

/**
 * @ on a line of plain words: who it could be, over the line, and what was
 * picked. The words `@Name` go on the line and the mention they stand for
 * goes to `onNamed`, to be made into the node when the line is sent or
 * kept — as # is. The comment line and a comment's edit field both use it.
 * `docs/specs/task-mentions.md`.
 */
export function useNaming(value: string, onChange: (v: string) => void, people: readonly Nameable2[], onNamed: (n: Named) => void) {
  const asking = people.length ? /(?:^|\s)@([\p{L}\p{N}._-]{0,32})$/u.exec(value) : null
  const callable = asking ? people.filter((p) => p.name.toLowerCase().includes(asking[1]!.toLowerCase())).slice(0, 8) : []
  const [called, setCalled] = useState(0)
  const [shut, setShut] = useState<string | null>(null)
  const open = asking !== null && callable.length > 0 && shut !== value
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new name being called starts at the first match
  useEffect(() => setCalled(0), [asking?.[1]])
  const pick = (p: Nameable2) => {
    if (!asking) return
    const label = `@${p.name}`
    const start = value.length - asking[0].length + (asking[0].startsWith('@') ? 0 : 1)
    onChange(`${value.slice(0, start)}${label} `)
    onNamed({ label, node: { type: 'mention', attrs: { id: p.actor_id, label: p.name } } })
  }
  /** The list's keys, taken before the line's own; true when one was. */
  const key = (e: React.KeyboardEvent): boolean => {
    if (!open) return false
    if (e.key === 'ArrowDown') setCalled((i) => (i + 1) % callable.length)
    else if (e.key === 'ArrowUp') setCalled((i) => (i - 1 + callable.length) % callable.length)
    else if (e.key === 'Enter' || e.key === 'Tab') {
      const p = callable[called] ?? callable[0]
      if (p) pick(p)
    } else if (e.key === 'Escape') setShut(value)
    else return false
    e.preventDefault()
    e.stopPropagation()
    return true
  }
  const list = open && (
    <div
      data-mention-list
      data-menu
      className="absolute bottom-full left-0 z-40 mb-2 max-h-[300px] w-[260px] max-w-full overflow-y-auto py-1 bg-surface"
      style={{ borderRadius: 'var(--r-card)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--line)' }}
    >
      {callable.map((p, i) => (
        <button
          key={p.actor_id}
          type="button"
          data-mention-row={p.actor_id}
          onMouseDown={(e) => {
            e.preventDefault()
            pick(p)
          }}
          onMouseEnter={() => setCalled(i)}
          className="flex w-full items-center gap-3 px-3 text-left text-base text-ink"
          style={{ height: 'var(--row-h)', background: i === called ? 'var(--hover)' : undefined }}
        >
          <Avatar id={p.actor_id} name={p.name} url={p.avatar_url ?? null} size={20} />
          <span className="truncate">{p.name}</span>
        </button>
      ))}
    </div>
  )
  return { open, list, key }
}

export function Composer({
  value,
  onChange,
  onSend,
  placeholder,
  testId,
  projectId = null,
  people = [],
  autoFocus = false,
}: {
  /** Takes the caret when it appears — the line in a card opened to write on. */
  autoFocus?: boolean
  value: string
  onChange: (v: string) => void
  onSend: (v: string, attached: readonly Attached[], named: readonly Named[], card?: Card | null) => void
  placeholder: string
  testId?: string
  /** Where a file put on this line becomes a row, and what # can name.
      Null: no clip and no #. */
  projectId?: string | null
  /** Who @ can name — the people of the thing's project. None: no @.
      `docs/specs/task-mentions.md`. */
  people?: readonly { actor_id: string; name: string; avatar_url?: string | null | undefined }[]
}) {
  const attach = useAttach(projectId)
  /* The card for an address in the line, shown under it and sent with it
     unless taken off. */
  const link = useLinkCard(value)
  /*
   * # names a task or a document of this project, as it does in a room —
   * `docs/specs/docs.md`. The line is plain words, so what was picked is
   * kept beside it as the words it was written as and the node it is, and
   * made into that node when the line is sent.
   */
  const [named, setNamed] = useState<Named[]>([])
  const calling = projectId ? /(?:^|\s)#([^#\n]{0,40})$/.exec(value) : null
  const [found, setFound] = useState<Nameable[]>([])
  const [chose, setChose] = useState(0)
  const q = calling?.[1] ?? null
  useEffect(() => {
    if (q === null || !projectId) return setFound([])
    let alive = true
    const wait = setTimeout(
      () => {
        void api<{ tasks: Nameable[] }>(`/projects/${projectId}/nameable?q=${encodeURIComponent(q.trim())}`)
          .then((r) => alive && (setFound(r.tasks), setChose(0)))
          .catch(() => alive && setFound([]))
      },
      q.trim() ? 120 : 0,
    )
    return () => {
      alive = false
      clearTimeout(wait)
    }
  }, [q, projectId])
  const pick = (t: Nameable) => {
    if (!calling) return
    const label = t.kind === 'doc' ? t.title : `${t.project_key ? `${t.project_key}-` : '#'}${t.number ?? ''} ${t.title}`
    const node =
      t.kind === 'doc'
        ? { type: 'docref' as const, attrs: { id: t.id, projectId: t.project_id, number: t.number, title: t.title } }
        : {
            type: 'taskref' as const,
            attrs: { id: t.id, projectId: t.project_id, number: t.number, key: t.project_key ?? null, title: t.title },
          }
    const start = value.length - calling[0].length + (calling[0].startsWith('#') ? 0 : 1)
    onChange(`${value.slice(0, start)}${label} `)
    setNamed((had) => [...had, { label, node }])
    setFound([])
  }
  /* Something to send: words, or a file, or both. A line with a picture on
     it and nothing typed is a thing somebody meant to send. */
  const ready = value.trim() !== '' || attach.held.length > 0
  const send = () => {
    if (!ready) return
    onSend(
      value,
      attach.spend(),
      named.filter((n) => value.includes(n.label)),
      link.card,
    )
    setNamed([])
    link.reset()
  }
  /* @ names a person of the project, as it does in a room —
     `useNaming`. */
  const call = useNaming(value, onChange, people, (n) => setNamed((had) => [...had, n]))
  const naming = call.open
  const listing = !naming && calling !== null && found.length > 0

  return (
    <div className="relative flex w-full flex-col">
      {attach.strip && <div className="pb-2">{attach.strip}</div>}
      {link.card && (
        <div className="px-2 pb-2">
          <LinkCard card={link.card} onRemove={link.remove} />
        </div>
      )}
      {call.list}
      {listing && (
        <div
          data-name-list
          data-menu
          className="absolute bottom-full left-0 z-40 mb-2 max-h-[300px] w-[360px] max-w-full overflow-y-auto py-1 bg-surface"
          style={{ borderRadius: 'var(--r-card)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--line)' }}
        >
          {found.map((t, i) => (
            <button
              key={t.id}
              type="button"
              data-name-row={t.id}
              onMouseDown={(e) => {
                e.preventDefault()
                pick(t)
              }}
              onMouseEnter={() => setChose(i)}
              className="flex w-full items-center gap-3 px-3 text-left text-base text-ink"
              style={{ height: 'var(--row-h)', background: i === chose ? 'var(--hover)' : undefined }}
            >
              {t.kind === 'doc' ? (
                <span className="flex shrink-0 items-center text-ink-3">
                  <Icon name="doc" size={14} />
                </span>
              ) : (
                <span className="shrink-0 font-mono text-xs tabular-nums text-ink-3">
                  {t.project_key ? `${t.project_key}-${t.number}` : `#${t.number}`}
                </span>
              )}
              <span className="truncate" title={t.title}>{t.title}</span>
            </button>
          ))}
        </div>
      )}
      <div
        className="flex h-10 w-full items-center gap-2 pr-2 pl-2 bg-track"
        style={{ borderRadius: 20 }}
        onPaste={(e) => {
          if (attach.take(e.clipboardData)) e.preventDefault()
        }}
        onDragOver={(e) => projectId && e.preventDefault()}
        onDrop={(e) => {
          if (attach.take(e.dataTransfer)) e.preventDefault()
        }}
      >
        {attach.clip}
        <input
          {...notALogin}
          data-testid={testId}
          autoFocus={autoFocus}
          className="min-w-px flex-1 bg-transparent text-base outline-none placeholder:text-[var(--ink-3)]"
          style={{ color: 'var(--ink)', letterSpacing: 'var(--track-body)' }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          // From the field, never from state: pressing Enter in the same
          // movement as the last keystroke used to send the render before it.
          onKeyDown={(e) => {
            if (call.key(e)) return
            if (listing) {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                return setChose((i) => (i + 1) % found.length)
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                return setChose((i) => (i - 1 + found.length) % found.length)
              }
              if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault()
                const t = found[chose] ?? found[0]
                if (t) pick(t)
                return
              }
              if (e.key === 'Escape') return setFound([])
            }
            if (e.key !== 'Enter') return
            if (e.currentTarget.value.trim() || attach.held.length > 0) send()
          }}
        />
        <button
          aria-label={BAR.send}
          onClick={send}
          className="flex shrink-0 items-center"
          style={{ color: ready ? 'var(--accent)' : 'var(--n-5)' }}
        >
          <Icon name="send" size={28} />
        </button>
      </div>
    </div>
  )
}

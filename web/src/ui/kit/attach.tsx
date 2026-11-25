import { useState, useRef, useCallback, useContext, useEffect } from 'react'
import { fileLine } from '../../data/bytes.js'
import { MAKE, SAYS } from '../../data/words.js'
import { KIT as W } from '../../words/kit.js'
import { MAX_FILE_BYTES } from '@tracker/shared-schema'
import { Icon } from '../glyphs.jsx'
import { api } from '../../data/api.js'
import { type Attached, kindOf, upload, measure, UploadInto } from '../../data/upload.js'
import { held as heldLocally } from '../../data/sending.js'

/* --------------------------------------------------------------- attaching */

/**
 * Putting a file on a line somebody is writing.
 *
 * The document editor could take a picture from the first day there was one,
 * and the two places people actually send things — a comment and a message —
 * could not. What is written there is one line, so this is not an editor: the
 * file is sent as soon as it is chosen, and what waits on the screen is a
 * chip saying what will go with the words.
 *
 * It is a hook and a strip rather than a component, because the two composers
 * it serves are not the same shape and never will be — one is a round field
 * at the foot of a room, the other a row under a task. What they share is
 * this, and sharing it is the point: a second way to attach a file is a
 * second answer to where files live.
 *
 * **Only where there is a project.** A file is a row in a project's Docs —
 * that is its home, its permission and its storage ceiling. A direct
 * conversation has no project, so it has nowhere to put one, and the clip is
 * not drawn rather than drawn and refused.
 */
export function useAttach(projectId: string | null) {
  /* Inside an open document, into it. A
     room's line is its room's wherever it is drawn. */
  const into = useRef<string | null>(null)
  into.current = useContext(UploadInto)
  const [held, setHeld] = useState<Attached[]>([])
  /* Names of files that were too big, said once and then forgotten: this is
     a line under the strip, not a state anybody has to clear. */
  const [refused, setRefused] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const pick = useRef<HTMLInputElement>(null)
  /*
   * Files still on their way up, drawn in the strip as they go, and the
   * uploads themselves, so a message sent meanwhile can wait for them
   * rather than leave without them.
   */
  const [pending, setPending] = useState<
    { key: string; name: string; kind: Attached['kind']; size: number; done: number; preview?: string }[]
  >([])
  /* The way to stop each upload still going, for its ✕. */
  const stops = useRef(new Map<string, () => void>())
  /* Taken off by its ✕ before or while it went up. */
  const dropped = useRef(new Set<string>())
  const inflight = useRef(new Set<Promise<unknown>>())
  const heldNow = useRef(held)
  heldNow.current = held

  // biome-ignore lint/correctness/useExhaustiveDependencies: run reads the project through projectId, which is listed, and refs
  const add = useCallback(
    (files: readonly File[]) => {
      if (!projectId || files.length === 0) return Promise.resolve()
      const going = run(files)
      inflight.current.add(going)
      void going.finally(() => inflight.current.delete(going))
      return going
    },
    [projectId],
  )
  async function run(files: readonly File[]) {
    if (!projectId) return
    setBusy(true)
    try {
      const going: { f: File; key: string; preview?: string }[] = []
      for (const f of files) {
        /*
         * Too big is said here, before the bytes leave.
         *
         * The ceiling is the server's and has not moved; what has moved is
         * who finds out first. A video is the first thing in this product
         * that meets it — a phone records about fifty megabytes a minute —
         * and meeting it as a refusal partway through an upload somebody
         * has already waited for is the worst way to be told.
         */
        if (f.size > MAX_FILE_BYTES) {
          setRefused((was) => [...was, f.name])
          continue
        }
        /*
         * The preview is drawn from the file in hand, not from the upload.
         *
         * `createObjectURL` costs no round trip, so the picture is on the
         * screen while the bytes are still going out — which is the moment
         * it was for. The kind here is what the browser said it picked;
         * the server decides what the file *is* from its bytes, and that
         * is what comes back on the row.
         */
        const kind = kindOf(f.type)
        const preview = kind === 'file' ? undefined : URL.createObjectURL(f)
        const key = `${Date.now()}:${Math.random()}`
        going.push({ f, key, ...(preview ? { preview } : {}) })
        setPending((was) => [...was, { key, name: f.name, kind, size: f.size, done: 0, ...(preview ? { preview } : {}) }])
      }
      /* Every file picked is a tile at once, and they go up one by one:
           a row that grew a tile at a time as each finished moved under
           the hand. */
      for (const { f, key, preview } of going) {
        if (dropped.current.has(key)) {
          if (preview) URL.revokeObjectURL(preview)
          continue
        }
        /* How far it has got, drawn on its tile. */
        const watch = {
          onProgress: (done: number) => setPending((was) => was.map((p) => (p.key === key ? { ...p, done } : p))),
          onAbortable: (stop: () => void) => stops.current.set(key, stop),
        }
        const [made, measured] = await Promise.all([
          upload(into.current && projectId && !projectId.startsWith('room:') ? into.current : projectId, f, watch).catch(() => null),
          measure(f),
        ])
        const stopped = dropped.current.has(key)
        stops.current.delete(key)
        setPending((was) => was.filter((p) => p.key !== key))
        if (made && !stopped) {
          /* Under the same key it had on its way up, so the tile stays the
               element it was and the picture is not drawn twice. */
          const one = { ...made, ...measured, key, size: f.size, ...(preview ? { preview } : {}) }
          if (preview) heldLocally(made.id, preview)
          heldNow.current = [...heldNow.current, one]
          setHeld((was) => [...was, one])
        } else if (preview) URL.revokeObjectURL(preview)
      }
    } finally {
      setBusy(false)
    }
  }

  /** Pasted and dropped files go the same way as picked ones. */
  const take = useCallback(
    (data: DataTransfer | null): boolean => {
      const files = Array.from(data?.files ?? [])
      if (!projectId || files.length === 0) return false
      void add(files)
      return true
    },
    [add, projectId],
  )

  /** What was gathered, and the strip goes empty — called as it is sent.
      Read from the ref, so a spend straight after an upload lands sees it. */
  const spend = useCallback(() => {
    const was = heldNow.current
    heldNow.current = []
    setHeld([])
    setRefused([])
    return was
  }, [])

  /** Every file still going up, up — or failed and dropped. */
  const ready = useCallback(async () => {
    while (inflight.current.size > 0) await Promise.allSettled([...inflight.current])
  }, [])

  /*
   * And the previews are let go of when the page is.
   *
   * An object URL holds its file in memory until it is revoked or the
   * document goes. A composer that is opened and closed all day would hold
   * every picture anybody had second thoughts about.
   *
   * Not revoked on `spend`: what was spent is on its way into a message that
   * is being drawn optimistically, and a preview revoked out from under it
   * is a picture that goes blank on send. The document going is late enough
   * and certain enough.
   */
  useEffect(() => {
    return () => {
      for (const a of heldNow.current) if (a.preview) URL.revokeObjectURL(a.preview)
    }
    // Deliberately on unmount alone: a dependency on `held` would revoke a
    // url on every change, including the change that added it. So what is
    // held is read through `heldNow` — the closure's own `held` is the first
    // render's, which was empty, and revoked nothing.
  }, [])

  /*
   * And put back, when what they were spent on did not happen.
   *
   * A send draws the message and empties the strip before the request
   * answers. The draft comes back when it fails,
   * and without this the picture that was attached to it would not: the
   * bytes are already uploaded and only the strip forgot them, so somebody
   * would have had to find the file again to send the same message.
   */
  const restore = useCallback((these: readonly Attached[]) => {
    if (these.length > 0) setHeld((was) => [...these, ...was])
  }, [])

  /*
   * Files carried over the line, so it can light up where they will land.
   * Counted rather than flagged:
   * the pointer crossing from the box into a button inside it is a leave of
   * the one and an enter of the other, and a flag went dark in between.
   * Only a drag that carries files: text or a link dragged across is not
   * something the line would take.
   */
  const [over, setOver] = useState(false)
  const depth = useRef(0)
  const carriesFiles = (e: React.DragEvent) => Boolean(projectId) && Array.from(e.dataTransfer?.types ?? []).includes('Files')
  const drop = {
    onDragEnter: (e: React.DragEvent) => {
      if (!carriesFiles(e)) return
      depth.current += 1
      setOver(true)
    },
    onDragOver: (e: React.DragEvent) => {
      if (carriesFiles(e)) e.preventDefault()
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!carriesFiles(e)) return
      depth.current = Math.max(0, depth.current - 1)
      if (depth.current === 0) setOver(false)
    },
    onDrop: (e: React.DragEvent) => {
      depth.current = 0
      setOver(false)
      if (take(e.dataTransfer)) e.preventDefault()
    },
  }
  /* A drag let go of somewhere else, or abandoned with Escape, ends with
     no leave on the line it last crossed. */
  useEffect(() => {
    if (!over) return
    const end = () => {
      depth.current = 0
      setOver(false)
    }
    window.addEventListener('dragend', end)
    window.addEventListener('drop', end)
    return () => {
      window.removeEventListener('dragend', end)
      window.removeEventListener('drop', end)
    }
  }, [over])

  const clip = projectId ? (
    <>
      <input
        ref={pick}
        data-attach-input
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          void add(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
      />
      <button
        data-control
        data-testid="attach"
        aria-label={MAKE.attachAFile}
        title={MAKE.attachAFile}
        disabled={busy}
        onClick={() => pick.current?.click()}
        className="flex size-7 shrink-0 items-center justify-center"
        style={{ borderRadius: 'var(--r-field)', color: busy ? 'var(--ink-3)' : 'var(--ink-2)' }}
      >
        <Icon name="clip" size={18} />
      </button>
    </>
  ) : null

  /*
   * What is waiting to go, drawn as a draft and not as a message.
   *
   * It was eighty-pixel squares standing between the history and the line,
   * in the history's own column, and Ruzanna took a screenshot she had only
   * picked for one she had sent. Now it is what Slack draws: small
   * tiles inside the box being written in, above the words — a picture as
   * itself, a file by its name and size — each with its ✕ and, while it is
   * going up, how far it has got. Sending moves them into the message.
   *
   * A tile is the same size going up and after, under the same key, so
   * nothing moves when an upload finishes.
   */
  const remove = (key: string, a?: Attached) => {
    if (!a) {
      dropped.current.add(key)
      setPending((was) => was.filter((p) => p.key !== key))
    }
    const stop = stops.current.get(key)
    if (stop) {
      stops.current.delete(key)
      stop()
    }
    if (a?.preview) URL.revokeObjectURL(a.preview)
    if (a) {
      heldNow.current = heldNow.current.filter((x) => x.id !== a.id)
      setHeld((was) => was.filter((x) => x.id !== a.id))
    }
  }
  const tile = (
    key: string,
    one: { name: string; kind: Attached['kind']; preview?: string | undefined; size?: number | undefined },
    done: number | null,
    a?: Attached,
  ) => {
    const picture = Boolean(one.preview) && one.kind !== 'file'
    return (
      <span
        key={key}
        {...(a ? { 'data-holding': a.id } : { 'data-uploading': '' })}
        data-kind={one.kind}
        data-tile
        className="relative flex shrink-0"
        title={done === null ? one.name : W.uploading(one.name)}
      >
        <span
          className="relative flex items-center gap-3 overflow-hidden"
          style={{
            width: picture ? 64 : 208,
            height: 64,
            padding: picture ? 0 : '0 12px',
            background: picture ? 'var(--sunken)' : 'var(--surface)',
            border: picture ? undefined : '1px solid var(--line)',
            borderRadius: 'var(--r-tile)',
          }}
        >
          {picture && one.kind === 'video' ? (
            /* Muted, still: its first frame is the whole of what a poster
               would have been. */
            <video src={one.preview} muted playsInline preload="metadata" className="size-full object-cover" />
          ) : picture ? (
            <img src={one.preview} alt={one.name} className="size-full object-cover" />
          ) : (
            <>
              <span
                className="flex size-10 shrink-0 items-center justify-center bg-sunken text-ink-3"
                style={{ borderRadius: 'var(--r-row)' }}
              >
                <Icon name="doc" size={18} />
              </span>
              <span className="flex min-w-px flex-col pr-2 text-sm">
                <span className="truncate text-ink">{one.name}</span>
                <span className="text-xs tabular-nums text-ink-3">{fileLine(one.name, one.size)}</span>
              </span>
            </>
          )}
          {/* A video says it is one, because a still frame does not. */}
          {picture && one.kind === 'video' && (
            <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex size-6 items-center justify-center rounded-full" style={{ background: 'rgb(0 0 0 / 0.5)' }}>
                <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden>
                  <path d="M4 2.5 L9 6 L4 9.5 Z" fill="#fff" />
                </svg>
              </span>
            </span>
          )}
          {/* Going up: dimmed, with how far along a bar at its foot. */}
          {done !== null && (
            <>
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-surface" style={{ opacity: 0.5 }} />
              <span
                role="progressbar"
                aria-label={W.uploading(one.name)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(done * 100)}
                className="absolute right-2 bottom-2 left-2 h-1 overflow-hidden rounded-full"
                style={{ background: 'rgb(0 0 0 / 0.2)' }}
              >
                <span
                  className="block h-full origin-left rounded-full transition-transform duration-200 ease-out bg-accent"
                  style={{ transform: `scaleX(${Math.max(0.04, done)})` }}
                />
              </span>
            </>
          )}
        </span>
        <button
          type="button"
          data-control
          data-remove-attached
          aria-label={W.removeNamed(one.name)}
          title={W.removeNamed(one.name)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => remove(key, a)}
          className="absolute -top-2 -right-2 flex size-5 items-center justify-center before:absolute before:-inset-1 rounded-full bg-ink text-surface"
          style={{ boxShadow: '0 0 0 2px var(--track)' }}
        >
          <Icon name="close" size={8} />
        </button>
      </span>
    )
  }
  const strip =
    held.length > 0 || refused.length > 0 || pending.length > 0 ? (
      <div className="flex flex-wrap items-start gap-2" data-attached>
        {held.map((a) => tile(a.key ?? a.id, a, null, a))}
        {pending.map((p) => tile(p.key, p, p.done))}
        {/* And what was refused, said where it was picked rather than a
            minute later by the server. */}
        {refused.map((name) => (
          <span
            key={name}
            data-refused
            className="flex h-16 items-center gap-2 px-3 text-sm bg-sunken text-due"
            style={{ borderRadius: 'var(--r-tile)' }}
          >
            <span className="max-w-[160px] truncate" title={name}>{name}</span>
            <span className="text-ink-3">{SAYS.tooBigToSend}</span>
          </span>
        ))}
      </div>
    ) : null

  return { held, busy, uploading: pending.length > 0 || busy, clip, strip, take, spend, restore, ready, over, drop }
}

/**
 * Six digits from the inbox, for an account with nothing else to type —
 * made through Google or Apple, with no password and no second factor —
 * before it is deleted or hands a workspace over.
 *
 * The field is there from the start, so nothing moves when the code is
 * sent; the button beside it sends it, and then says where it went.
 */
export function InboxCode({
  value,
  onChange,
  testId,
  look,
  purpose,
}: {
  value: string
  onChange: (code: string) => void
  testId: string
  look: { className: string; style: React.CSSProperties }
  /** What the mail says it is for: `ways` is a way to sign in, `twofa` turning on two-factor authentication, `mail` changing how the server sends email. */
  purpose?: 'ways' | 'twofa' | 'mail'
}) {
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [said, setSaid] = useState<string | null>(null)
  async function send() {
    if (busy) return
    setBusy(true)
    setSaid(null)
    try {
      const r = await api<{ sent_to: string }>('/me/inbox-code', { method: 'POST', body: JSON.stringify(purpose ? { for: purpose } : {}) })
      setSent(r.sent_to)
    } catch (e) {
      setSaid((e as Error).message || W.couldNotSendCode)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          data-testid={testId}
          className={`${look.className} w-[144px] tabular-nums`}
          style={look.style}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder={W.sixDigitCode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          data-testid={`${testId}-send`}
          onClick={() => void send()}
          disabled={busy}
          className="h-8 px-2 text-sm font-medium text-accent-ink"
        >
          {sent ? W.sendAgain : W.emailMeACode}
        </button>
      </div>
      <span className="text-sm" style={{ color: said ? 'var(--danger)' : 'var(--ink-3)' }}>
        {said ?? (sent ? W.sentTo(sent) : W.wellEmailYou)}
      </span>
    </div>
  )
}

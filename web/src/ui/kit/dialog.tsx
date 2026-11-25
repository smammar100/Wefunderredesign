import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MORE, BAR } from '../../data/words.js'
import { Icon } from '../glyphs.jsx'
import { usePhone } from './layout.jsx'
import { Button } from './controls.jsx'

/* ---------------------------------------------------------------- dialog */

/**
 * What a modal window stands on: the work dimmed, and a little out of focus.
 *
 * Its own layer, under the panel rather than around it. A `backdrop-filter`
 * makes a new backdrop root, and anything glass inside one — a picker's
 * menu, opened from the window — has nothing left to sample but the layer
 * already filtered. WebKit draws that as no blur at all, and every iPhone
 * is WebKit. As a sibling the blur is behind the window and not around it,
 * so what floats over the window is still over the window.
 */
export function Scrim({ onPress }: { onPress: () => void }) {
  return (
    <div
      aria-hidden
      data-scrim
      className="absolute inset-0 bg-dialog-scrim"
      style={{
        backdropFilter: 'blur(var(--scrim-blur))',
        WebkitBackdropFilter: 'blur(var(--scrim-blur))',
      }}
      onPointerDown={onPress}
    />
  )
}

/**
 * A modal task: one thing to answer, and the rest of the screen pushed back.
 *
 * Glass, because the glass spec names modals among the places it goes,
 * and the same material as the palette because they are the same object seen
 * at two sizes — a panel that floats over the work and takes the keyboard.
 *
 * Escape is bound on the window rather than on the panel. Bound to the panel
 * it only works while something inside it has focus, which is most of the
 * time and not all of it, and a close that works most of the time is one
 * people stop trusting.
 */
/**
 * What goes in a Dialog, said apart from the window — so one window can
 * hold two of them behind tabs (the plus)
 * and each can still stand in a window of its own.
 */
export type Framed = { title: string; testId: string; body: React.ReactNode; footer: React.ReactNode }

export function Dialog({
  title,
  onClose,
  children,
  footer,
  testId,
  size = 'small',
  head,
  sheet = false,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer: React.ReactNode
  testId?: string
  /**
   * Large is a window somebody writes in — a task, made in the shape it is
   * read in. Its height is fixed from the first
   * frame, the body scrolling inside it, so nothing it holds can grow it.
   */
  size?: 'small' | 'large'
  /** What stands where the title does — the place the thing will live. */
  head?: React.ReactNode
  /**
   * On a phone, a sheet the height of the screen rather than a box over it,
   * with Cancel and the footer's actions across its top — the iPhone app's
   * new-task sheet.
   */
  sheet?: boolean
}) {
  /* Shut the way it opened — `[data-leaving]` in the theme — and then gone.
     Without motion to wait for, at once. */
  const [leaving, setLeaving] = useState(false)
  const leave = useCallback(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return onClose()
    setLeaving(true)
    setTimeout(onClose, 160)
  }, [onClose])
  /* Focus into the window when it opens, and back to whatever opened it
     when it shuts — otherwise a keyboard is left on the page behind it. */
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const all = document.querySelectorAll<HTMLElement>('[aria-modal="true"]')
    const panel = all[all.length - 1]
    if (panel && !panel.contains(document.activeElement)) {
      panel.tabIndex = -1
      panel.focus({ preventScroll: true })
    }
    return () => {
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])
  useEffect(() => {
    /*
     * A menu open inside it is what the key is shutting — a picker's, or
     * the editor's blocks. Both heard the same press, and the window went
     * with the menu.
     *
     * Looked at on the way down, before anything has answered: by the time
     * the press reaches the window the menu has shut and React has already
     * taken it off the page. And looked at on the page rather than asked of
     * `defaultPrevented`, because the editor takes every Escape for itself —
     * ProseMirror's own keymap selects the block around the caret.
     */
    let menu = false
    const before = (e: KeyboardEvent) => {
      if (e.key === 'Escape') menu = Boolean(document.querySelector('[data-over], [data-testid="block-list"], [data-mention-list]'))
    }
    const key = (e: KeyboardEvent) => {
      /* At once: a key is pressed many times a day, and a window that
         fades out after it reads as one that did not hear. */
      if (e.key !== 'Escape' || menu) return
      onClose()
    }
    window.addEventListener('keydown', before, true)
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('keydown', before, true)
      window.removeEventListener('keydown', key)
    }
  }, [onClose])
  const large = size === 'large'
  const phone = usePhone()
  if (sheet && large && phone) {
    return createPortal(
      <div
        data-leaving={leaving || undefined}
        className="fixed inset-0 z-50 flex items-start justify-center"
        style={{ paddingTop: 'calc(var(--above) + 8px)' }}
      >
        <Scrim onPress={leave} />
        {/*
          The height of what can be seen, which a keyboard takes its share
          of (`--app-h`), from just under the top of the screen down to the
          keys. Cornered at the top only: its foot stands on the keyboard or
          the edge of the screen, and a rounded corner there draws a card
          floating on nothing.
        */}
        <div
          data-dialog-panel
          data-sheet
          className="relative flex w-full flex-col overflow-hidden bg-chrome"
          style={{
            height: 'calc(var(--app-h) - var(--above) - 8px)',
            borderRadius: '16px 16px 0 0',
            boxShadow: 'var(--dialog-shadow), 0 0 0 1px var(--dialog-edge)',
          }}
        >
          <div role="dialog" aria-modal="true" aria-label={title} data-testid={testId} className="flex min-h-0 flex-1 flex-col">
            {/* Cancel and the actions at the top, where they are above the
                keys whatever the keys cover. No inset on the left: Cancel is
                a quiet button, so its word is what is seen, and its padding
                puts that word on the edge everything under it starts from. */}
            <div data-sheet-bar className="flex shrink-0 items-center gap-2 pt-3 pr-4 pb-2">
              <Button data-testid="dialog-close" onClick={leave}>
                {MORE.cancel}
              </Button>
              {footer}
            </div>
            {head && <div className="flex shrink-0 items-center gap-2 px-4 pt-1 pb-2 text-sm">{head}</div>}
            {children}
            {/* The room the writing dock takes over the foot while the
                words are being written in — `--dock-h` — and the home
                indicator's with the keys down. The sheet keeps its height;
                only what scrolls in it ends sooner. */}
            <div data-sheet-foot aria-hidden className="shrink-0" />
          </div>
        </div>
      </div>,
      document.body,
    )
  }

  return createPortal(
    <div
      data-leaving={leaving || undefined}
      className={`fixed inset-0 z-50 flex items-start justify-center ${large ? 'pt-[var(--dialog-top)]' : 'pt-[14vh]'}`}
    >
      <Scrim onPress={leave} />
      {/* Solid, not glass. Making a task, a project or a conversation is
          a form somebody fills in, and the page swimming through it behind
          the fields was something to read past rather than a sense of
          place — we asked for it gone. The scrim still dims what
          is behind; the panel is opaque. */}
      <div
        data-dialog-panel
        className={`relative flex flex-col overflow-hidden ${large ? 'w-[min(800px,94vw)]' : 'w-[min(600px,94vw)]'} bg-surface`}
        style={{
          borderRadius: 16,
          boxShadow: 'var(--dialog-shadow), 0 0 0 1px var(--dialog-edge)',
          /* The ground the open task is on — the work's sheet — since this
             is that screen before it exists. */
          /*
           * Never taller than what can be seen: `--app-h`, which a phone's
           * keyboard takes its share of, and not `dvh`, which it does not.
           * At 88dvh a task being written on a phone ran on behind the
           * keys, its body had nothing left to scroll, and a finger trying
           * to reach the words below moved the page instead — which is
           * held at its top while the keyboard is up, so it shook back.
           * With the keys up a large window also ends clear of
           * the writing dock on them, `--keys-dock`.
           */
          ...(large
            ? {
                height: 'min(720px, 88dvh, calc(var(--app-h) - var(--dialog-top) - 8px - var(--keys-dock)))',
                background: 'var(--chrome)',
              }
            : /* Never taller than the screen below where it opens: what is
                 in it scrolls, and the footer's buttons stay in reach. A
                 window inviting people onto forty projects stood with its
                 Send under the fold. */
              { maxHeight: 'min(calc(100dvh - 14vh - 16px), calc(var(--app-h) - 14vh - 16px))' }),
        }}
      >
        <div role="dialog" aria-modal="true" aria-label={title} data-testid={testId} className="flex min-h-0 flex-1 flex-col">
          <div className={`flex items-center gap-2 px-4 pt-4 text-sm ${large ? 'pb-2' : 'pb-1'}`}>
            {head ?? (
              <span className="text-ink-2" style={{ letterSpacing: 'var(--track-body)' }}>
                {title}
              </span>
            )}
            <button
              data-control
              data-testid="dialog-close"
              aria-label={BAR.close}
              onClick={leave}
              className="relative ml-auto flex size-6 items-center justify-center text-ink-3 pointer-coarse:before:absolute pointer-coarse:before:-inset-2.5"
              style={{ borderRadius: 'var(--r-row)' }}
            >
              <Icon name="plus" size={14} style={{ transform: 'rotate(45deg)' }} />
            </button>
          </div>
          {large ? children : <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>}
          <div className="flex shrink-0 items-center gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--line)' }}>
            {footer}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

import { useState } from 'react'
import {
  AgentFaceMark,
  Avatar,
  Badge,
  Button,
  Dialog,
  Dot,
  EmptyState,
  Field,
  Kbd,
  LabelChip,
  LIST_MARKS,
  PageTitle,
  Panel,
  PRIORITIES,
  PRIORITY_SAID,
  PriorityMark,
  Row,
  SectionHead,
  Segments,
  Select,
  Switch,
  Toggle,
} from './ui/kit.jsx'
import { Icon, type IconName } from './ui/glyphs.jsx'
import { ProjectMark } from './ui/icons.jsx'
import { DRAWINGS, type ArtName } from './ui/illustrations/art.js'
import type { AgentFace } from '@tracker/shared-schema'

/*
 * The design system on one page: tokens first, then every control in the
 * states it can be in. Nothing here talks to a server.
 */

const ICONS: IconName[] = [
  'tasks', 'bell', 'person', 'people', 'gear', 'bubble', 'megaphone', 'doc', 'list', 'history', 'mark', 'board',
  'cal', 'plus', 'ellipsis', 'search', 'chevron', 'flag', 'globe', 'spark', 'statusDoing', 'statusStarted',
  'statusReview', 'statusStopped', 'copy', 'trash', 'clip', 'statusOpen', 'statusBacklog', 'updown', 'chevR',
  'plusThin', 'close', 'chevL', 'shrink', 'grow', 'panel', 'send', 'reply', 'folder', 'sun', 'tag', 'cycle',
  'repeat', 'offline', 'moon', 'compose', 'sliders', 'clock', 'wait', 'type', 'smile', 'at', 'prompt', 'github',
  'pullOpen', 'pullMerged', 'pullClosed', 'pullDraft', 'slack', 'link', 'table', 'image', 'rule', 'quote',
  'toggle', 'code', 'upload', 'download', 'contrast', 'pin', 'check', 'bellOff', 'eye', 'eyeOff', 'lock', 'hash',
  'rocket', 'briefcase', 'palette', 'camera', 'book', 'chart', 'target', 'bolt', 'star', 'heart', 'home', 'bag',
  'leaf', 'music',
]

const SURFACES = ['canvas', 'chrome', 'surface', 'panel', 'sunken', 'control', 'float', 'hover', 'track']
const INKS = ['ink', 'ink-2', 'ink-3', 'accent', 'accent-soft', 'danger', 'due', 'line', 'line-strong']
const TINTS = Array.from({ length: 10 }, (_, i) => `tint-${i}`)
const TYPE: [string, string][] = [
  ['hero', '40'], ['display', '32'], ['title', '24'], ['xl', '20'], ['lg', '17'], ['md', '15'],
  ['base', '14'], ['sm', '13'], ['xs', '12'], ['badge', '11'],
]
const FACES: AgentFace[] = ['bot-1', 'bot-2', 'bot-3', 'bot-4', 'bot-5', 'blob-1', 'blob-2', 'geo-1', 'geo-2', 'geo-3']
const PEOPLE = ['Ada Lovelace', 'Bruno Costa', 'Chen Wei', 'Dev', 'Esther Okafor', 'Farah Haddad']
const LABELS = [
  { id: 'l1', name: 'Bug', color: null },
  { id: 'l2', name: 'Improvement', color: null },
  { id: 'l3', name: 'Design', color: null },
  { id: 'l4', name: 'Research', color: null },
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-3 scroll-mt-6">
      <SectionHead>{title}</SectionHead>
      {children}
    </section>
  )
}

function Swatch({ token }: { token: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div
        className="h-12 rounded-[var(--r-tile)]"
        style={{ background: `var(--${token})`, boxShadow: 'inset 0 0 0 1px var(--line)' }}
      />
      <code className="truncate font-mono text-xs text-ink-2">--{token}</code>
    </div>
  )
}

export function Showcase() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme ?? 'light')
  const [view, setView] = useState<'board' | 'list' | 'calendar'>('board')
  const [sort, setSort] = useState<'priority' | 'due' | 'created'>('priority')
  const [notify, setNotify] = useState(true)
  const [toggles, setToggles] = useState({ mine: true, open: false, agents: false })
  const [selected, setSelected] = useState(1)
  const [dialog, setDialog] = useState(false)

  const flip = (next: string) => {
    /* No transitions for the two frames the theme changes in — `theme.css`. */
    const root = document.documentElement
    root.dataset.swapping = ''
    root.dataset.theme = next
    requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.swapping))
    try {
      localStorage.setItem('theme', next)
    } catch {}
    setTheme(next)
  }

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <main className="mx-auto flex max-w-[960px] flex-col gap-10 px-4 py-10 sm:px-8">
        <PageTitle
          action={
            <Segments
              items={[
                { key: 'light', label: 'Light', icon: 'sun' },
                { key: 'dark', label: 'Dark', icon: 'moon' },
              ]}
              value={theme}
              onPick={flip}
            />
          }
        >
          Tuff design system
        </PageTitle>

        <Section id="color" title="Colour">
          <p className="text-sm text-ink-3">Surfaces</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {SURFACES.map((t) => <Swatch key={t} token={t} />)}
          </div>
          <p className="text-sm text-ink-3">Ink and meaning</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {INKS.map((t) => <Swatch key={t} token={t} />)}
          </div>
          <p className="text-sm text-ink-3">Tints</p>
          <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
            {TINTS.map((t) => <Swatch key={t} token={t} />)}
          </div>
        </Section>

        <Section id="type" title="Type">
          <Panel className="gap-1 p-4">
            {TYPE.map(([name, px]) => (
              <div key={name} className="flex items-baseline gap-4">
                <code className="w-20 shrink-0 font-mono text-xs text-ink-3">
                  {name} · {px}
                </code>
                <span className="truncate" style={{ fontSize: `var(--text-${name})` }}>
                  Tasks, chat and docs
                </span>
              </div>
            ))}
          </Panel>
        </Section>

        <Section id="buttons" title="Buttons and fields">
          <div className="flex flex-wrap items-center gap-3">
            <Button tone="primary">Create task</Button>
            <Button>Cancel</Button>
            <Button tone="danger">Delete</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Field placeholder="Task name" />
            <Select
              label="Sort by"
              value={sort}
              onPick={setSort}
              options={[
                { id: 'priority', label: 'Priority' },
                { id: 'due', label: 'Due date' },
                { id: 'created', label: 'Created' },
              ]}
            />
            <span className="flex items-center gap-1 text-sm text-ink-3">
              Press <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </div>
        </Section>

        <Section id="choices" title="Choices">
          <Segments
            items={[
              { key: 'board', label: 'Board', icon: 'board' },
              { key: 'list', label: 'List', icon: 'list' },
              { key: 'calendar', label: 'Calendar', icon: 'cal' },
            ]}
            value={view}
            onPick={setView}
          />
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(toggles) as (keyof typeof toggles)[]).map((k) => (
              <Toggle key={k} on={toggles[k]} onChange={(on) => setToggles({ ...toggles, [k]: on })}>
                {{ mine: 'Mine', open: 'Open', agents: 'Agents' }[k]}
              </Toggle>
            ))}
          </div>
          <label className="flex items-center gap-3 text-base">
            <Switch on={notify} onChange={setNotify} testId="notify" said="Notifications" />
            Notify me when I'm mentioned
          </label>
        </Section>

        <Section id="marks" title="Badges, labels and marks">
          <div className="flex flex-wrap items-center gap-3">
            <Badge count={3} />
            <Badge count={128} />
            <Badge count={2} tone="urgent" />
            <Badge count={7} tone="quiet" />
            {LABELS.map((l) => <LabelChip key={l.id} label={l} />)}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {PRIORITIES.map((p) => (
              <span key={p} className="flex items-center gap-2 text-sm">
                <PriorityMark value={p} /> {PRIORITY_SAID[p]}
              </span>
            ))}
            <span className="flex items-center gap-2 text-sm text-ink-3">
              <PriorityMark value={null} /> None
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {LIST_MARKS.slice(0, 8).map(([icon]) => <Dot key={icon} icon={icon} />)}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {['Website', 'Mobile', 'Billing', 'Growth', 'Infra'].map((n, i) => (
              <ProjectMark key={n} id={`p${i}`} name={n} size={28} />
            ))}
          </div>
        </Section>

        <Section id="people" title="People and agents">
          <div className="flex flex-wrap items-center gap-3">
            {PEOPLE.map((n, i) => (
              <Avatar
                key={n}
                name={n}
                id={`u${i}`}
                size={32}
                on="var(--canvas)"
                presence={(['here', 'away', 'busy', null] as const)[i % 4] as never}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {FACES.map((f, i) => <AgentFaceMark key={f} id={f} size={36} live at={i * 0.4} title={f} />)}
          </div>
        </Section>

        <Section id="rows" title="Panels and rows">
          <Panel className="p-1">
            {['Design review', 'Ship the onboarding', 'Fix the export bug', 'Write release notes'].map((t, i) => (
              <Row key={t} selected={i === selected} rail onClick={() => setSelected(i)}>
                <PriorityMark value={PRIORITIES[i]!} />
                <span className="flex-1 truncate text-base">{t}</span>
                <LabelChip label={LABELS[i]!} />
                <Avatar name={PEOPLE[i]!} id={`u${i}`} size={20} on="var(--panel)" />
              </Row>
            ))}
          </Panel>
        </Section>

        <Section id="dialog" title="Dialog">
          <div>
            <Button tone="primary" onClick={() => setDialog(true)}>
              Open dialog
            </Button>
          </div>
          {dialog && (
            <Dialog
              title="Rename project"
              onClose={() => setDialog(false)}
              footer={
                <>
                  <Button onClick={() => setDialog(false)}>Cancel</Button>
                  <Button tone="primary" onClick={() => setDialog(false)}>
                    Save
                  </Button>
                </>
              }
            >
              <Field wide defaultValue="Website" aria-label="Project name" />
            </Dialog>
          )}
        </Section>

        <Section id="icons" title="Icons">
          <div className="grid grid-cols-6 gap-1 sm:grid-cols-10">
            {ICONS.map((n) => (
              <div
                key={n}
                title={n}
                className="flex flex-col items-center gap-1 rounded-[var(--r-tile)] py-3 text-ink-2 hover:bg-hover"
              >
                <Icon name={n} size={20} />
                <span className="w-full truncate px-1 text-center text-badge text-ink-3">{n}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="art" title="Empty states">
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(DRAWINGS) as ArtName[]).map((a) => (
              <Panel key={a}>
                <EmptyState art={a} title={a[0]!.toUpperCase() + a.slice(1)}>
                  Nothing here yet.
                </EmptyState>
              </Panel>
            ))}
          </div>
        </Section>
      </main>
    </div>
  )
}

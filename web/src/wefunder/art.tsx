import { useState } from 'react'
import { AgentFaceMark, Avatar } from '../ui/kit.jsx'
import { Icon } from '../ui/glyphs.jsx'
import { Chrome, mono, Pill, Sheet, Stage } from './parts.jsx'

/*
 * The page's illustrations, drawn from the product's own pieces — Tuff's
 * avatars and agent faces, its hairlines and pills — the way the Tuff
 * landing draws its app instead of showing screenshots.
 *
 * Every person and company in them is made up. The numbers that are
 * Wefunder's own (stats, limits, quotes) live in the page, not here.
 */

const muted = { color: 'var(--lp-muted)' }
const faint = { color: 'var(--lp-faint)' }

function Bar({ value, tint = 'var(--lp-accent)' }: { value: number; tint?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--lp-chip)', boxShadow: 'inset 0 0 0 1px var(--lp-line)' }}>
      <div className="h-full rounded-full" style={{ width: `${value * 100}%`, background: tint }} />
    </div>
  )
}

/* ------------------------------------------------------------------ hero */

const BACKERS: [string, string, string][] = [
  ['Lena Park', '$50,000', 'Angel'],
  ['Omar Haddad', '$25,000', 'Customer'],
  ['Ruth Achebe', '$10,000', 'Early user'],
  ['Kenji Mori', '$2,500', 'Customer'],
]

export function HeroRound() {
  return (
    <Stage label="A round in progress: $1.42 million raised of $2 million from 184 investors, held as one line on the cap table, with an AI agent suggesting the next intro." className="p-3 sm:p-10">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Sheet>
          <Chrome title="Northwind Robotics · Private round" />
          <div className="grid gap-6 p-5 sm:grid-cols-[1fr_1fr] sm:p-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium tracking-[0.04em] uppercase" style={{ ...mono, ...faint }}>
                Raised
              </p>
              <p className="text-[36px] leading-none font-[560] tracking-[-0.03em] tabular-nums">$1,420,500</p>
              <Bar value={0.71} />
              <p className="text-[13px] tabular-nums" style={muted}>
                71% of $2,000,000 · closes in 9 days
              </p>
              <div className="mt-2 flex items-center gap-3 rounded-[10px] p-3" style={{ background: 'var(--lp-chip)', boxShadow: 'inset 0 0 0 1px var(--lp-line)' }}>
                <span className="flex -space-x-1.5">
                  {['Lena Park', 'Omar Haddad', 'Ruth Achebe', 'Kenji Mori'].map((n) => (
                    <span key={n} className="rounded-full" style={{ boxShadow: '0 0 0 2px var(--lp-card)' }}>
                      <Avatar name={n} id={n} size={22} on="var(--lp-card)" />
                    </span>
                  ))}
                </span>
                <span className="text-[13px] leading-tight">
                  <span className="font-[560] tabular-nums">184 investors</span>
                  <span className="block" style={muted}>
                    1 line on your cap table
                  </span>
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="mb-1 text-xs font-medium tracking-[0.04em] uppercase" style={{ ...mono, ...faint }}>
                Latest
              </p>
              {BACKERS.map(([n, amt, who], i) => (
                <div key={n} className="flex h-11 items-center gap-2.5 text-[13px]" style={{ borderTop: i ? '1px solid var(--lp-line)' : undefined }}>
                  <Avatar name={n} id={n} size={24} on="var(--lp-card)" />
                  <span className="min-w-0 flex-1 truncate">
                    {n}
                    <span className="ml-1.5" style={faint}>
                      {who}
                    </span>
                  </span>
                  <span className="font-medium tabular-nums">{amt}</span>
                </div>
              ))}
            </div>
          </div>
        </Sheet>
        <Sheet className="hidden flex-col lg:flex">
          <Chrome title="Agent" />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="ml-auto max-w-[85%] rounded-[12px] rounded-br-[4px] px-3 py-2 text-[13px]" style={{ background: 'var(--lp-accent)', color: '#fff' }}>
              Who could close the last $580k?
            </div>
            <div className="flex gap-2.5">
              <AgentFaceMark id="bot-2" size={26} live title="Wefunder agent" />
              <div className="flex flex-col gap-2 text-[13px] leading-snug" style={muted}>
                <p>
                  <span style={{ color: 'var(--lp-fg)' }}>Lena Park</span> backed two of your seed investors' last deals and
                  usually writes $50k to $100k.
                </p>
                <p>She knows Kenji, who invested yesterday.</p>
                <span className="mt-1 inline-flex h-7 w-max items-center gap-1.5 rounded-full px-3 text-xs font-medium" style={{ background: 'var(--lp-chip)', color: 'var(--lp-fg)', boxShadow: 'inset 0 0 0 1px var(--lp-line)' }}>
                  <Icon name="compose" size={13} />
                  Draft an intro via Kenji
                </span>
              </div>
            </div>
          </div>
        </Sheet>
      </div>
    </Stage>
  )
}

/* -------------------------------------------------------------- products */

const DOTS = Array.from({ length: 30 }, (_, i) => `Investor ${i + 1}`)

/* Many investors, one line on the cap table. */
export function CapLine() {
  return (
    <Stage label="Thirty investors drawn as faces, folded into a single line on the company's cap table.">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
        <div className="grid grid-cols-10 gap-1">
          {DOTS.map((n, i) => (
            <span key={n} style={{ opacity: 0.55 + (i % 5) * 0.09 }}>
              <Avatar name={n.replace('Investor', 'I')} id={n} size={16} on="var(--lp-bg)" />
            </span>
          ))}
        </div>
        <span className="rotate-90 sm:rotate-0" style={faint}>
          <Icon name="chevR" size={16} />
        </span>
        <Sheet className="w-full min-w-0 flex-1">
          <div className="px-3 py-2 text-[11px] font-medium tracking-[0.04em] uppercase" style={{ ...mono, ...faint, borderBottom: '1px solid var(--lp-line)' }}>
            Cap table
          </div>
          {[
            ['Founders', '72.0%', false],
            ['Seed fund', '14.5%', false],
            ['Wefunder SPV', '6.1%', true],
          ].map(([n, pct, us]) => (
            <div key={n as string} className={`flex items-center justify-between gap-2 px-3 text-[12px] ${us ? 'py-2' : 'h-9'}`} style={{ borderTop: '1px solid var(--lp-line)', background: us ? 'color-mix(in oklch, var(--lp-accent) 12%, transparent)' : undefined }}>
              <span className="min-w-0 leading-tight" style={us ? { color: 'var(--lp-fg)', fontWeight: 560 } : muted}>
                {n}
                {us && (
                  <span className="block font-normal" style={muted}>
                    247 investors
                  </span>
                )}
              </span>
              <span className="tabular-nums">{pct}</span>
            </div>
          ))}
        </Sheet>
      </div>
    </Stage>
  )
}

/* An investment as small as $100. */
export function Invest100() {
  return (
    <Stage label="An investment card with a $100 minimum and three amounts to pick from.">
      <Sheet className="mx-auto max-w-[340px] p-4">
        <p className="text-[13px] font-[560]">Invest in Juniper Coffee</p>
        <p className="text-[12px]" style={muted}>
          Community round · minimum $100
        </p>
        <div className="mt-3 flex h-10 items-center rounded-[10px] px-3 text-[20px] font-[560] tabular-nums" style={{ background: 'var(--lp-chip)', boxShadow: 'inset 0 0 0 1px var(--lp-accent)' }}>
          $250
          <span className="ml-0.5 h-5 w-px" style={{ background: 'var(--lp-accent)' }} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {['$100', '$250', '$1,000'].map((a) => (
            <span
              key={a}
              className="flex h-7 items-center justify-center rounded-full text-[12px] font-medium tabular-nums"
              style={a === '$250' ? { background: 'var(--lp-fg)', color: 'var(--lp-bg)' } : { background: 'var(--lp-chip)', ...muted }}
            >
              {a}
            </span>
          ))}
        </div>
      </Sheet>
    </Stage>
  )
}

/* A syndicate deal filling up. */
export function Syndicate() {
  return (
    <Stage label="A syndicate deal with 41 backers committed $412,000 of $500,000.">
      <Sheet className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[13px] font-[560]">Helio Batteries · Seed</p>
          <Pill tint={3}>Open</Pill>
        </div>
        <p className="mt-3 text-[20px] font-[560] tracking-[-0.02em] tabular-nums">$412,000</p>
        <p className="mb-2 text-[12px] tabular-nums" style={muted}>
          of $500,000 · 41 backers
        </p>
        <Bar value={0.82} />
      </Sheet>
    </Stage>
  )
}

/* A fund's capital call coming in. */
export function FundCall() {
  return (
    <Stage label="A fund's second capital call, with 38 of 42 limited partners paid.">
      <Sheet className="p-4">
        <p className="text-[13px] font-[560]">Fund I · Capital call 2 of 4</p>
        <div className="mt-3 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1">
          {Array.from({ length: 42 }, (_, i) => (
            <span key={i} className="aspect-square rounded-[3px]" style={{ background: i < 38 ? 'var(--lp-accent)' : 'var(--lp-chip)', boxShadow: i < 38 ? undefined : 'inset 0 0 0 1px var(--lp-line)' }} />
          ))}
        </div>
        <p className="mt-2 text-[12px] tabular-nums" style={muted}>
          38 of 42 LPs paid
        </p>
      </Sheet>
    </Stage>
  )
}

/* What an SPV needs, handled. */
export function SpvSteps() {
  const steps: [string, boolean][] = [
    ['Entity formed', true],
    ['LPs verified', true],
    ['Funds collected', true],
    ['Wired to company', true],
    ['Annual K-1s', false],
  ]
  return (
    <Stage label="An SPV checklist: entity formed, LPs verified, funds collected and wired, with yearly tax forms still to come.">
      <Sheet className="p-1">
        {steps.map(([s, done], i) => (
          <div key={s} className="flex h-8 items-center gap-2 px-3 text-[12px]" style={{ borderTop: i ? '1px solid var(--lp-line)' : undefined }}>
            <span className="flex size-4 items-center justify-center rounded-full" style={done ? { background: 'var(--lp-accent)', color: '#fff' } : { boxShadow: 'inset 0 0 0 1.5px var(--lp-line-strong)' }}>
              {done && <Icon name="check" size={10} />}
            </span>
            <span style={done ? undefined : muted}>{s}</span>
            {!done && (
              <span className="ml-auto">
                <Pill tint="quiet">Every year</Pill>
              </span>
            )}
          </div>
        ))}
      </Sheet>
    </Stage>
  )
}

/* People reserving a place before the round opens. */
export function Warmup() {
  const weeks = [18, 26, 31, 44, 52, 70, 96, 128]
  return (
    <Stage label="Reservations climbing week by week to 1,284 people before the round opens.">
      <Sheet className="p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] font-[560]">Reservations</p>
          <p className="text-[20px] font-[560] tracking-[-0.02em] tabular-nums">1,284</p>
        </div>
        <div className="mt-3 flex h-14 items-end gap-1.5">
          {weeks.map((h, i) => (
            <span key={i} className="flex-1 rounded-t-[3px]" style={{ height: `${(h / 128) * 100}%`, background: i === weeks.length - 1 ? 'var(--lp-accent)' : 'var(--lp-line-strong)' }} />
          ))}
        </div>
        <p className="mt-2 text-[12px]" style={muted}>
          Round opens Monday
        </p>
      </Sheet>
    </Stage>
  )
}

/* ------------------------------------------------------------- community */

const DIRECTORY: [string, string, string][] = [
  ['$250k', 'Alma Reyes', 'Father of three. Gives to science and the arts.'],
  ['$100k', 'Grant Ilunga', 'Builds microgrids for rural clinics.'],
  ['$50k', 'Noor Saleh', 'Immunologist turned biotech founder.'],
  ['$50k', 'Wes Kowal', 'Regional director at a medical device maker.'],
  ['$10k', 'Hana Ito', 'Runs a supply chain for electronics makers.'],
  ['$10k', 'Theo Brandt', 'Compliance consultant to community banks.'],
  ['$5k', 'Ivy Larsen', 'Product lead at a Series B fintech.'],
  ['$5k', 'Sol Mensah', 'Started a business at 13 and kept going.'],
]

export function Directory() {
  return (
    <Stage label="An investor directory of 7,759 people with a search field, an AI search button and each investor's amount and one-line bio." className="p-3 sm:p-6">
      <Sheet>
        <Chrome title="Investors" />
        <div className="flex items-center gap-2 p-3" style={{ borderBottom: '1px solid var(--lp-line)' }}>
          <span className="text-[13px] font-[560] tabular-nums">7,759</span>
          <span className="flex h-8 flex-1 items-center gap-2 rounded-[8px] px-2.5 text-[12px]" style={{ background: 'var(--lp-chip)', boxShadow: 'inset 0 0 0 1px var(--lp-line)', ...faint }}>
            <Icon name="search" size={13} />
            Search by name, company, role
          </span>
          <span className="flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[12px] font-medium" style={{ background: 'color-mix(in oklch, var(--lp-accent) 14%, transparent)', color: 'var(--lp-accent)' }}>
            <Icon name="spark" size={13} />
            AI search
          </span>
        </div>
        <div className="grid sm:grid-cols-2">
          {DIRECTORY.map(([amt, n, bio], i) => (
            <div key={n} className="flex items-center gap-3 p-3" style={{ borderTop: i > 0 ? '1px solid var(--lp-line)' : undefined }}
              data-pair={i % 2 ? 'right' : 'left'}>
              <Avatar name={n} id={n} size={32} on="var(--lp-card)" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between gap-2 text-[13px] font-[560]">
                  <span className="truncate">{n}</span>
                  <span className="tabular-nums" style={{ color: 'var(--lp-accent)' }}>
                    {amt}
                  </span>
                </p>
                <p className="truncate text-[12px]" style={muted}>
                  {bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Sheet>
    </Stage>
  )
}

/* --------------------------------------------------------------- control */

export type Reach = 'invite' | 'clubs' | 'all'

export const REACH: { id: Reach; name: string; body: string; who: string }[] = [
  { id: 'invite', name: 'Invite only', body: 'You pick every investor. Nobody sees the round unless you send it to them.', who: 'Only the people you invite' },
  { id: 'clubs', name: 'Syndicates & clubs', body: 'Open to select investment clubs and vetted groups on Wefunder.', who: 'Your invites, plus clubs you approve' },
  { id: 'all', name: 'All Wefunder investors', body: 'Every investor on the platform can see it.', who: 'Over a million investors' },
]

/* Who sees the round: three choices, pressed to change. */
export function Visibility() {
  const [reach, setReach] = useState<Reach>('invite')
  const ring = { invite: 1, clubs: 2, all: 3 }[reach]
  return (
    <div className="grid gap-px lg:grid-cols-[1fr_1.1fr]" style={{ background: 'var(--lp-line)' }}>
      <div className="flex flex-col gap-2 p-5 sm:p-8" style={{ background: 'var(--lp-bg)' }} role="radiogroup" aria-label="Round visibility">
        <p className="mb-1 text-xs font-medium tracking-[0.04em] uppercase" style={{ ...mono, ...faint }}>
          Round visibility
        </p>
        {REACH.map((r) => {
          const on = r.id === reach
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setReach(r.id)}
              className="flex gap-3 rounded-[12px] p-4 text-left transition-[background-color,box-shadow] duration-150"
              style={{
                background: on ? 'var(--lp-card)' : 'transparent',
                boxShadow: on ? 'inset 0 0 0 1px var(--lp-accent), var(--lp-lift-small)' : 'inset 0 0 0 1px var(--lp-line)',
              }}
            >
              <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full" style={{ boxShadow: `inset 0 0 0 1.5px ${on ? 'var(--lp-accent)' : 'var(--lp-line-strong)'}` }}>
                {on && <span className="size-2 rounded-full" style={{ background: 'var(--lp-accent)' }} />}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 text-[15px] font-[560]">
                  {r.name}
                  {on && <Pill tint="accent">Active</Pill>}
                </span>
                <span className="text-[14px] leading-5" style={muted}>
                  {r.body}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="p-5 sm:p-8" style={{ background: 'var(--lp-bg)' }}>
        <Stage label={`Who can see the round: ${REACH.find((r) => r.id === reach)!.who}.`} className="flex h-full min-h-[300px] items-center justify-center">
          <div className="relative flex size-[260px] items-center justify-center">
            {[3, 2, 1].map((n) => (
              <span
                key={n}
                aria-hidden
                className="absolute rounded-full transition-[opacity,box-shadow] duration-200"
                style={{
                  inset: `${(3 - n) * 44}px`,
                  boxShadow: `inset 0 0 0 1px ${n <= ring ? 'var(--lp-accent)' : 'var(--lp-line)'}`,
                  background: n <= ring ? 'color-mix(in oklch, var(--lp-accent) 6%, transparent)' : 'transparent',
                }}
              />
            ))}
            <span className="relative flex flex-col items-center gap-1 text-center">
              <span className="flex size-10 items-center justify-center rounded-[12px]" style={{ background: 'var(--lp-accent)', color: '#fff' }}>
                <Icon name="lock" size={18} />
              </span>
              <span className="mt-1 max-w-[150px] text-[12px] leading-tight font-medium">{REACH.find((r) => r.id === reach)!.who}</span>
            </span>
          </div>
        </Stage>
      </div>
    </div>
  )
}

/* Many investors folding through one SPV into one line. */
export function Funnel() {
  return (
    <Stage label="Rows of investors narrowing into one SPV, which sits on the cap table as a single entity. You choose the signatory and the terms." className="px-3 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-[720px] flex-col items-center">
        {[15, 13, 11, 9, 7, 5].map((n, row) => (
          <div key={row} className="mb-1 flex gap-1" aria-hidden>
            {Array.from({ length: n }, (_, i) => (
              <span
                key={i}
                className="size-[clamp(10px,3vw,18px)] rounded-[4px]"
                style={{ background: `color-mix(in oklch, var(--lp-accent) ${30 + row * 12}%, var(--lp-card))`, opacity: 0.55 + row * 0.08 }}
              />
            ))}
          </div>
        ))}
        <span aria-hidden className="h-6 w-px" style={{ background: 'var(--lp-accent)' }} />
        <div className="grid w-full grid-cols-3 items-center gap-2 sm:gap-4">
          <span className="text-right text-[12px] leading-tight font-medium sm:text-[13px]" style={muted}>
            You choose the
            <br />
            <span style={{ color: 'var(--lp-fg)' }}>SPV signatory</span>
          </span>
          <span className="mx-auto flex h-11 items-center rounded-full px-5 text-[13px] font-semibold tracking-[0.06em]" style={{ ...mono, background: 'var(--lp-accent)', color: '#fff' }}>
            SPV
          </span>
          <span className="text-[12px] leading-tight font-medium sm:text-[13px]" style={muted}>
            You choose the
            <br />
            <span style={{ color: 'var(--lp-fg)' }}>terms</span>
          </span>
        </div>
        <span aria-hidden className="h-6 w-px" style={{ background: 'var(--lp-accent)' }} />
        <span className="flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-medium" style={{ background: 'var(--lp-card)', boxShadow: 'var(--lp-lift-small)' }}>
          <Icon name="table" size={14} />
          One entity on your cap table
        </span>
      </div>
    </Stage>
  )
}

/* -------------------------------------------------------------- network */

export function Featured() {
  return (
    <Stage label="A round featured on Wefunder's explore page, with the amount raised, investor count and an invest button." className="flex items-center justify-center">
      <Sheet className="w-full max-w-[380px] overflow-hidden">
        <div className="flex h-24 items-end p-3" style={{ background: 'linear-gradient(135deg, color-mix(in oklch, var(--tint-3) 40%, var(--lp-card)), color-mix(in oklch, var(--tint-4) 30%, var(--lp-card)))' }}>
          <Pill tint="accent">Featured</Pill>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <p className="text-[15px] font-[560]">Juniper Coffee</p>
          <p className="text-[13px] leading-snug" style={muted}>
            Roaster-owned cafés, now opening in five cities.
          </p>
          <Bar value={0.64} tint="var(--tint-3)" />
          <div className="flex items-center justify-between text-[12px] tabular-nums" style={muted}>
            <span>
              <span className="font-[560]" style={{ color: 'var(--lp-fg)' }}>
                $384,200
              </span>{' '}
              from 1,912 investors
            </span>
            <span className="flex h-7 items-center rounded-full px-3 font-medium" style={{ background: 'var(--lp-fg)', color: 'var(--lp-bg)' }}>
              Invest
            </span>
          </div>
        </div>
      </Sheet>
    </Stage>
  )
}

/* ----------------------------------------------------------- experience */

/* An invitation by text, the form, and the tap — pressed to complete. */
export function Phone() {
  const [done, setDone] = useState(false)
  const rows: [string, string][] = [
    ['Investment', '$2,500'],
    ['Investor', 'Kenji Mori'],
    ['Payment', 'Bank ····4021'],
    ['Vehicle', 'Northwind SPV I'],
    ['Contract', 'SAFE · $18M cap'],
  ]
  return (
    <Stage label="A phone showing a text invitation, the investment form and a Complete investment button." live className="flex items-center justify-center px-4 py-10">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div className="hidden max-w-[240px] flex-col gap-2 md:flex">
          <span className="text-[11px] font-medium tracking-[0.04em] uppercase" style={{ ...mono, ...faint }}>
            Messages
          </span>
          <div className="rounded-[16px] rounded-bl-[4px] px-3.5 py-2.5 text-[13px] leading-snug" style={{ background: 'var(--lp-card)', boxShadow: 'var(--lp-lift-small)' }}>
            Maya from Northwind invited you to invest in our round. wefunder.com/northwind
          </div>
        </div>
        <div className="w-[280px] rounded-[36px] p-2.5" style={{ background: 'var(--lp-card)', boxShadow: 'var(--lp-lift)' }}>
          <div className="flex min-h-[440px] flex-col overflow-hidden rounded-[28px] p-4" style={{ background: 'var(--lp-bg)', boxShadow: 'inset 0 0 0 1px var(--lp-line)' }}>
            <span aria-hidden className="mx-auto mb-4 h-5 w-20 rounded-full" style={{ background: 'var(--lp-card)' }} />
            {done ? (
              <div className="lp-swap flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <span className="flex size-12 items-center justify-center rounded-full" style={{ background: 'var(--lp-accent)', color: '#fff' }}>
                  <Icon name="check" size={22} />
                </span>
                <p className="text-[17px] font-[560]">You're in</p>
                <p className="text-[13px]" style={muted}>
                  $2,500 committed to Northwind Robotics.
                </p>
                <button type="button" onClick={() => setDone(false)} className="mt-2 text-[12px] underline underline-offset-4" style={muted}>
                  Start over
                </button>
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <p className="text-[11px] font-medium tracking-[0.04em] uppercase" style={{ ...mono, ...faint }}>
                  Investment details
                </p>
                <p className="mt-1 mb-3 text-[15px] font-[560]">Northwind Robotics</p>
                {rows.map(([k, v]) => (
                  <div key={k} className="flex h-9 items-center justify-between text-[12px]" style={{ borderTop: '1px solid var(--lp-line)' }}>
                    <span style={muted}>{k}</span>
                    <span className="font-medium tabular-nums">{v}</span>
                  </div>
                ))}
                <label className="mt-3 flex gap-2 text-[11px] leading-snug" style={muted}>
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-[var(--lp-accent)]" />I understand this investment is risky and hard to sell.
                </label>
                <button
                  type="button"
                  onClick={() => setDone(true)}
                  className="mt-auto flex h-11 items-center justify-center rounded-[12px] text-[14px] font-medium transition-transform duration-150 active:scale-[0.97]"
                  style={{ background: 'var(--lp-fg)', color: 'var(--lp-bg)' }}
                >
                  Complete investment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Stage>
  )
}

/* ---------------------------------------------------------------- agent */

const FOUND: [string, string, 'Strong' | 'Moderate', string][] = [
  ['Dana Whitfield', 'GP, Larkspur Ventures', 'Strong', "Co-led Lumen's Series A. Talks with their CEO monthly."],
  ['Marcus Obi', 'Angel investor', 'Strong', 'Ran engineering at Lumen from 2021 to 2023.'],
  ['Priya Raman', 'Scout, Fieldstone', 'Moderate', "Invested next to Lumen's Series B backers twice."],
]

export function AgentChat() {
  return (
    <Stage label="The Wefunder agent answering which LPs know someone at a company, with three connections ranked strong or moderate and an offer to draft an intro." className="p-3 sm:p-6">
      <Sheet className="flex flex-col">
        <div className="flex h-11 items-center gap-2 px-4" style={{ borderBottom: '1px solid var(--lp-line)' }}>
          <AgentFaceMark id="bot-2" size={22} live title="Wefunder AI" />
          <span className="text-[13px] font-[560]">Wefunder AI</span>
          <span className="ml-auto flex items-center gap-1.5 text-[11px]" style={muted}>
            <span className="size-1.5 rounded-full" style={{ background: 'var(--tint-3)' }} />
            Online
          </span>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="ml-auto max-w-[80%] rounded-[12px] rounded-br-[4px] px-3 py-2 text-[13px]" style={{ background: 'var(--lp-accent)', color: '#fff' }}>
            Which of my LPs might know someone at Lumen Robotics?
          </div>
          <p className="text-[11px] font-medium tracking-[0.04em] uppercase" style={{ ...mono, ...faint }}>
            3 connections found
          </p>
          {FOUND.map(([n, role, strength, why]) => (
            <div key={n} className="flex gap-3 rounded-[10px] p-3" style={{ background: 'var(--lp-chip)', boxShadow: 'inset 0 0 0 1px var(--lp-line)' }}>
              <Avatar name={n} id={n} size={28} on="var(--lp-card)" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[13px] font-[560]">
                  <span className="truncate">{n}</span>
                  <span className="truncate font-normal" style={faint}>
                    {role}
                  </span>
                  <span className="ml-auto">
                    <Pill tint={strength === 'Strong' ? 3 : 1}>{strength.toUpperCase()}</Pill>
                  </span>
                </p>
                <p className="text-[12px] leading-snug" style={muted}>
                  {why}
                </p>
              </div>
            </div>
          ))}
          <p className="text-[13px]" style={muted}>
            Want me to draft a warm intro request to Dana or Marcus?
          </p>
          <div className="flex h-10 items-center rounded-[10px] px-3 text-[13px]" style={{ background: 'var(--lp-chip)', boxShadow: 'inset 0 0 0 1px var(--lp-line)', ...faint }}>
            Ask your AI agent anything…
          </div>
        </div>
      </Sheet>
    </Stage>
  )
}

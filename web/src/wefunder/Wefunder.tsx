import { useState } from 'react'
import { Icon, type IconName } from '../ui/glyphs.jsx'
import { AgentChat, CapLine, Directory, Featured, FundCall, Funnel, HeroRound, Invest100, Phone, SpvSteps, Syndicate, Visibility, Warmup } from './art.jsx'
import { Band, Cell, Checks, Eyebrow, Head, mono, primary, Quote, Ruled, secondary, Stage, useDarkPage, useIntro, WF } from './parts.jsx'

/*
 * wefunder.com, redesigned in the Tuff design system.
 *
 * Every section, product, number, link, quote and disclosure of the
 * original is here (checked against the live page). The prose is
 * rewritten plainer; the three quotes and the legal text are word for
 * word, because those are not ours to edit.
 */

/* ------------------------------------------------------------------ nav */

const MENUS: { label: string; href: string; items: [string, string][] }[] = [
  {
    label: 'Founders',
    href: '/community-round',
    items: [
      ['Community Round', '/community-round'],
      ['Private Round', '/private-round'],
      ['Investor Warmup', '/investor-warmup'],
      ['Pricing', '/pricing'],
      ['Case Studies', '/case-studies'],
      ['Founder Playbook', '/playbook'],
    ],
  },
  {
    label: 'Syndicates & Funds',
    href: '/syndicates',
    items: [
      ['Syndicate', '/syndicates'],
      ['Fund', '/funds'],
      ['SPV', '/spv'],
    ],
  },
  { label: 'API & Agents', href: '/agents', items: [] },
  {
    label: 'Learn',
    href: '/pbc',
    items: [
      ['Charter & Impact Report', '/pbc'],
      ['Knowledge Base', '/articles'],
      ['Blog', '/news'],
      ['Help Center', 'https://help.wefunder.com/'],
    ],
  },
]

const url = (path: string) => (path.startsWith('http') ? path : WF + path)

function Wordmark() {
  return (
    <a href={WF} className="flex items-center gap-2 text-[16px] font-[650] tracking-[-0.02em]" aria-label="Wefunder home">
      {/* The page's signature, small: many marks folding into one line. */}
      <svg aria-hidden width="22" height="22" viewBox="0 0 22 22">
        <rect width="22" height="22" rx="6" fill="var(--lp-accent)" />
        {[5, 9, 13, 17].map((x, i) => (
          <circle key={x} cx={x} cy={6.5} r={1.3} fill="#fff" opacity={0.55 + i * 0.12} />
        ))}
        {[7, 11, 15].map((x) => (
          <circle key={x} cx={x} cy={11} r={1.3} fill="#fff" opacity={0.85} />
        ))}
        <rect x="6" y="15" width="10" height="2.4" rx="1.2" fill="#fff" />
      </svg>
      Wefunder
    </a>
  )
}

function Nav() {
  return (
    <header
      className="sticky top-0 z-40 px-4 sm:px-6"
      style={{ background: 'var(--lp-glass)', backdropFilter: 'saturate(1.8) blur(16px)', WebkitBackdropFilter: 'saturate(1.8) blur(16px)', borderBottom: '1px solid var(--lp-line)' }}
    >
      <nav className="mx-auto flex h-16 max-w-[1152px] items-center gap-8" aria-label="Main">
        <Wordmark />
        <ul className="hidden items-center gap-1 text-sm lg:flex">
          {MENUS.map((m) => (
            <li key={m.label} className="group relative">
              <a href={url(m.href)} className="lp-link flex h-9 items-center gap-1 rounded-full px-3" style={{ color: 'var(--lp-muted)' }}>
                {m.label}
                {m.items.length > 0 && (
                  <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" className="opacity-60">
                    <path d="M2.5 4l2.5 2.5L7.5 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
              </a>
              {/* In the page whether or not it is open (marketing-pages:
                  crawlers and screen readers get the real links). */}
              {m.items.length > 0 && (
                <div className="invisible absolute top-full left-0 pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="w-56 p-1.5" style={{ background: 'var(--lp-card)', borderRadius: 12, boxShadow: 'var(--lp-lift)' }}>
                    {m.items.map(([label, href]) => (
                      <li key={label}>
                        <a href={url(href)} className="lp-link flex h-9 items-center rounded-[8px] px-3 hover:bg-[var(--lp-chip)]" style={{ color: 'var(--lp-muted)' }}>
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <a href={url('/continue')} className="flex h-9 items-center rounded-full px-4 text-sm font-medium" style={secondary}>
            Log in
          </a>
          <a href={url('/raise')} className="flex h-9 items-center rounded-full px-4 text-sm font-medium" style={primary}>
            Get started
          </a>
        </div>
      </nav>
    </header>
  )
}

/* ----------------------------------------------------------------- hero */

const PATHS: [string, string, IconName][] = [
  ['Raise for your startup', '/private-round', 'rocket'],
  ['Run a Community Round', '/community-round', 'people'],
  ['Lead a syndicate', '/syndicates', 'person'],
  ['Launch a fund', '/funds', 'briefcase'],
  ['Spin up an SPV', '/spv', 'folder'],
]

const STATS: [string, string][] = [
  ['$2.37B', 'Transactions'],
  ['1.15M', 'Investments'],
  ['4,409', 'Founders funded'],
  ['3,065', 'SPVs & funds'],
]

const FUNDED = ['Mercury', 'Replit', 'Substack', 'Boom', 'Levels', 'Synthesis', 'beehiiv', 'Arrived']

function Hero() {
  const intro = useIntro()
  /* Played once a visit: each part rises into place, staggered. */
  const rise = (d: number): React.CSSProperties | undefined => (intro ? { animation: `lp-swap 520ms var(--ease-out) both`, animationDelay: `${d}ms` } : undefined)
  return (
    <section data-lp-tone="dark" className="px-4 sm:px-6" style={{ background: 'var(--lp-bg)' }} aria-label="Introduction">
      <div className="mx-auto max-w-[1152px]" style={{ borderLeft: '1px solid var(--lp-line)', borderRight: '1px solid var(--lp-line)' }}>
        <div className="grid gap-10 px-5 pt-16 pb-12 sm:px-12 sm:pt-24 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16">
          <div className="flex flex-col gap-5">
            <div style={rise(0)}>
              <Eyebrow>The operating system for fundraising</Eyebrow>
            </div>
            <h1 className="text-[42px] leading-[1.06] font-[560] tracking-[-0.035em] text-balance sm:text-[64px] sm:leading-[1.04]" style={rise(60)}>
              Raise from your community, and a million more investors.
            </h1>
            <p className="max-w-[540px] text-[18px] leading-[1.55] font-medium tracking-[-0.1px] text-pretty sm:text-[20px]" style={{ color: 'var(--lp-muted)', ...rise(120) }}>
              Rounds, syndicates, funds and SPVs on one platform. AI agents and a community of 1M+ investors included.
            </p>
          </div>
          {/* The five things people come to do, as the first choice on the page. */}
          <nav aria-label="Start here" style={rise(180)}>
            <p className="mb-2 text-xs font-medium tracking-[0.04em] uppercase" style={{ ...mono, color: 'var(--lp-faint)' }}>
              What are you raising for?
            </p>
            <ul className="overflow-hidden" style={{ borderRadius: 12, boxShadow: 'inset 0 0 0 1px var(--lp-line)' }}>
              {PATHS.map(([label, href, icon], i) => (
                <li key={label} style={{ borderTop: i ? '1px solid var(--lp-line)' : undefined }}>
                  <a href={url(href)} className="group flex h-12 items-center gap-3 px-4 text-[15px] font-medium transition-colors duration-150 hover:bg-[var(--lp-chip)]">
                    <span style={{ color: 'var(--lp-muted)' }}>
                      <Icon name={icon} size={16} />
                    </span>
                    {label}
                    <span className="ml-auto transition-transform duration-150 group-hover:translate-x-0.5" style={{ color: 'var(--lp-faint)' }}>
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="px-3 pb-3 sm:px-6 sm:pb-6" style={rise(260)}>
          <HeroRound />
        </div>
        {/* What has happened on the platform, as AngelList sets its record: ruled, left-aligned. */}
        <dl className="grid grid-cols-2 gap-px lg:grid-cols-4" style={{ background: 'var(--lp-line)', borderTop: '1px solid var(--lp-line)' }}>
          {STATS.map(([n, label]) => (
            <div key={label} className="flex flex-col gap-1 px-5 py-7 sm:px-8 sm:py-9" style={{ background: 'var(--lp-bg)' }}>
              <dd className="text-[32px] leading-none font-[560] tracking-[-0.03em] tabular-nums sm:text-[40px]">{n}</dd>
              <dt className="text-xs font-medium tracking-[0.04em] uppercase" style={{ ...mono, color: 'var(--lp-faint)' }}>
                {label}
              </dt>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-6 sm:px-8" style={{ borderTop: '1px solid var(--lp-line)' }}>
          <span className="text-xs font-medium tracking-[0.04em] uppercase" style={{ ...mono, color: 'var(--lp-faint)' }}>
            Funded on Wefunder
          </span>
          {FUNDED.map((n) => (
            <span key={n} className="text-[17px] font-[600] tracking-[-0.02em]" style={{ color: 'var(--lp-muted)' }}>
              {n}
            </span>
          ))}
          <a href={url('/verticals/yc')} className="lp-link ml-auto text-sm font-medium" style={{ color: 'var(--lp-fg)' }}>
            71 YC startups <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- products */

function Products() {
  return (
    <Band id="products" tone="dark" label="Products">
      <Head eyebrow="Products" title="For founders, syndicates and funds." lede="Start with your first angel check. Grow into a full venture fund without moving platforms." />
      {/* The two ways founders raise get the room; the four for investors share a row. */}
      <Ruled className="md:grid-cols-2">
        <Cell
          title="Top off your round. Invite your angels. Tap our network."
          body="Your round runs itself: launch in minutes, close in days. Up to 247 investors sit on your cap table as one line."
          href={url('/private-round')}
        >
          <div className="flex flex-col gap-3">
            <Eyebrow>Private Round</Eyebrow>
            <CapLine />
          </div>
        </Cell>
        <Cell
          title="Your customers already love you. Let them invest."
          body="Thousands of your most passionate supporters can invest from $100. Your terms, and one line on your cap table."
          href={url('/community-round')}
        >
          <div className="flex flex-col gap-3">
            <Eyebrow>Community Round</Eyebrow>
            <Invest100 />
          </div>
        </Cell>
      </Ruled>
      <Ruled className="sm:grid-cols-2">
        <Cell
          title="The syndicate & fund platform built for operators with deal flow."
          body="Grow an investor community and spend your time on deals, founders and relationships. We handle the fund and SPV admin."
          href={url('/syndicates')}
        >
          <div className="flex flex-col gap-3">
            <Eyebrow>Syndicate</Eyebrow>
            <Syndicate />
          </div>
        </Cell>
        <Cell title="The fund platform built for operators with deal flow." body="Invest, help founders, keep relationships warm. We handle the fund administration." href={url('/funds')}>
          <div className="flex flex-col gap-3">
            <Eyebrow>Fund</Eyebrow>
            <FundCall />
          </div>
        </Cell>
        <Cell title="SPVs you can count on." body="Invite LPs, collect funds and deploy capital. Wefunder handles compliance and runs the SPV's admin for its whole life." href={url('/spv')}>
          <div className="flex flex-col gap-3">
            <Eyebrow>SPV</Eyebrow>
            <SpvSteps />
          </div>
        </Cell>
        <Cell
          title="Build your investor list before you raise."
          body="Line up customers, fans and supporters early, so investors are waiting the day your round opens."
          href={url('/investor-warmup')}
        >
          <div className="flex flex-col gap-3">
            <Eyebrow>Investor Warmup</Eyebrow>
            <Warmup />
          </div>
        </Cell>
      </Ruled>
    </Band>
  )
}

/* ------------------------------------------------------------- community */

function Community() {
  return (
    <Band id="community" tone="light" label="Community">
      <div className="grid lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col gap-8">
          <Head
            eyebrow="Community"
            title="Fundraising built around relationships."
            lede="Your investors and LPs stay with you for years, whether you raise for a startup or run a fund. Keep those relationships close and they compound."
          />
          <div className="px-5 pb-12 sm:px-12">
            <Checks
              items={[
                <>
                  <b className="font-[560]" style={{ color: 'var(--lp-fg)' }}>
                    Investor directory.
                  </b>{' '}
                  See who has invested in you.
                </>,
                <>
                  <b className="font-[560]" style={{ color: 'var(--lp-fg)' }}>
                    Investor updates.
                  </b>{' '}
                  Keep your backers in the loop.
                </>,
                <>
                  <b className="font-[560]" style={{ color: 'var(--lp-fg)' }}>
                    Ask for intros.
                  </b>{' '}
                  Request warm intros from your investors.
                </>,
                <>
                  <b className="font-[560]" style={{ color: 'var(--lp-fg)' }}>
                    AI agent.
                  </b>{' '}
                  Find out which investor can help.
                </>,
              ]}
            />
          </div>
        </div>
        <div className="flex items-center p-3 sm:p-8 lg:pt-32 border-t border-[var(--lp-line)] lg:border-t-0 lg:border-l">
          <Directory />
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--lp-line)' }}>
        <Quote who="Charles Harrison" role="COO, Synthesis">
          From our investors, we hired 5 new full-time employees, which is about 8% of our workforce. We also hired 92 teachers,
          which is about 25% of that team.
        </Quote>
      </div>
    </Band>
  )
}

/* --------------------------------------------------------------- control */

function Access() {
  return (
    <Band id="access" tone="dark" label="Who gets access">
      <Head eyebrow="Your round, your rules" title="Choose exactly who gets access." lede="Keep it tight or open it up. You decide who sees your round, and how." />
      <div style={{ borderTop: '1px solid var(--lp-line)' }}>
        <Visibility />
      </div>
    </Band>
  )
}

function Control() {
  return (
    <Band tone="dark" label="Total control">
      <Head eyebrow="Total control" title="Your terms. One line on your cap table. We manage the rest." center />
      <div className="px-3 pb-3 sm:px-6 sm:pb-6">
        <Funnel />
      </div>
    </Band>
  )
}

/* -------------------------------------------------------------- network */

function Network() {
  return (
    <Band id="network" tone="light" label="Wefunder's investor network">
      <div className="grid lg:grid-cols-2">
        <div className="flex flex-col">
          <Head
            eyebrow="Optional"
            title="Tap into Wefunder's network of 1M+ investors."
            lede="Keep the raise inside your own network, or open it to Wefunder's community of more than a million investors."
          />
          <div className="px-5 pb-12 sm:px-12">
            <Checks
              items={[
                <>
                  <b className="font-[560]" style={{ color: 'var(--lp-fg)' }}>
                    1M+ investors
                  </b>{' '}
                  browsing and ready to invest.
                </>,
                <>
                  <b className="font-[560]" style={{ color: 'var(--lp-fg)' }}>
                    Featured placement,
                  </b>{' '}
                  so people find you on Wefunder.
                </>,
                <>
                  <b className="font-[560]" style={{ color: 'var(--lp-fg)' }}>
                    Your choice.
                  </b>{' '}
                  Opt in, or keep it private, any time.
                </>,
              ]}
            />
          </div>
        </div>
        <div className="flex items-center p-3 sm:p-8 lg:pt-32 border-t border-[var(--lp-line)] lg:border-t-0 lg:border-l">
          <Featured />
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--lp-line)' }}>
        <Quote who="Vanessa Otero" role="Founder, Ad Fontes Media" note="Raised $595,877 from 896 investors">
          We raised a $500,000 seed round led by a lead investor who saw our Wefunder round as a positive signal—a sign that I was
          scrappy and capable of raising from both the community and traditional angels.
        </Quote>
      </div>
    </Band>
  )
}

/* ----------------------------------------------------------- experience */

function Experience() {
  return (
    <Band id="experience" tone="dark" label="The investor experience">
      <Head
        eyebrow="The experience"
        title={
          <>
            Invited with a text.
            <br />
            <span style={{ color: 'var(--lp-muted)' }}>Invested with a tap.</span>
          </>
        }
        lede="Your investors open the invite, look over the round, connect a bank or wallet and commit in seconds. No DocuSign envelopes. No chasing wires."
        aside={
          <p className="text-sm lg:text-right" style={{ color: 'var(--lp-faint)' }}>
            Try it: press <span style={{ color: 'var(--lp-fg)' }}>Complete investment</span>.
          </p>
        }
      />
      <div className="px-3 pb-3 sm:px-6 sm:pb-6">
        <Phone />
      </div>
    </Band>
  )
}

/* ---------------------------------------------------------------- agent */

function Agent() {
  return (
    <Band id="agent" tone="light" label="AI agent">
      <div className="grid lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col">
          <Head
            eyebrow="AI agent"
            title="Ask your agent. Get answers right away."
            lede="Your agent knows your investors, their networks and their portfolios. Ask it for a warm intro, a connection you missed, or a brief before your next meeting."
          />
          <div className="px-5 pb-12 sm:px-12">
            <Checks
              items={[
                'Searches LP profiles, portfolios and connections',
                "Finds warm intro paths you'd never trace by hand",
                'Drafts outreach that sounds like you',
                'Gets better every time you use it',
              ]}
            />
          </div>
        </div>
        <div className="p-3 sm:p-8 lg:pt-32 border-t border-[var(--lp-line)] lg:border-t-0 lg:border-l">
          <AgentChat />
        </div>
      </div>
    </Band>
  )
}

/* ------------------------------------------------------------------ api */

const SNIPPET = `const wefunder = new WefunderClient(API_KEY)

// Open an SPV for a deal
const spv = await wefunder.spv.create({
  targetCompany: 'Northwind Robotics',
  dealSize: 2_000_000,
  managementFee: 0.02,
  carry: 0.2,
})

// Take a $25k investment into it
await spv.invest({ userId: 'usr_4k2p', amount: 25_000, currency: 'USD' })`

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      aria-label={done ? 'Copied' : 'Copy the code'}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        } catch {}
      }}
      className="flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium"
      style={{ color: '#a1a1aa', background: 'rgb(255 255 255 / 0.06)' }}
    >
      <Icon name={done ? 'check' : 'copy'} size={13} />
      {done ? 'Copied' : 'Copy'}
    </button>
  )
}

function Api() {
  const features: [IconName, string, string][] = [
    ['code', 'Embed via API', 'Native investing inside your own app.'],
    ['bolt', 'MCP-ready', 'Investment actions your AI agents can call.'],
    ['lock', 'Full compliance stack', 'KYC, accreditation, payments and ledgering.'],
  ]
  return (
    <Band id="api" tone="dark" label="API and agents">
      <Head
        eyebrow="For AI agents & platforms"
        title="The operating system for raising capital."
        lede="Put fundraising inside your own product, or let your agents do it."
        aside={
          <a href={url('/agents')} className="flex h-10 w-max items-center rounded-full px-5 text-[15px] font-medium lg:justify-self-end" style={secondary}>
            Learn more <span aria-hidden className="ml-1.5">→</span>
          </a>
        }
      />
      <Ruled className="lg:grid-cols-[1fr_1.5fr]">
        <div className="grid gap-px" style={{ background: 'var(--lp-line)' }}>
          {features.map(([icon, t, b]) => (
            <div key={t} className="flex gap-4 p-5 sm:p-8" style={{ background: 'var(--lp-bg)' }}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: 'var(--lp-chip)', boxShadow: 'inset 0 0 0 1px var(--lp-line)', color: 'var(--lp-accent)' }}>
                <Icon name={icon} size={16} />
              </span>
              <div>
                <h3 className="text-[17px] leading-6 font-[560]">{t}</h3>
                <p className="text-[15px] leading-[22px] font-medium" style={{ color: 'var(--lp-muted)' }}>
                  {b}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 sm:p-8" style={{ background: 'var(--lp-bg)' }}>
          <Stage label="Example code" live className="h-full">
            <div className="overflow-hidden" style={{ background: 'var(--lp-code)', borderRadius: 12, boxShadow: 'var(--lp-lift)' }}>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgb(255 255 255 / 0.08)' }}>
                <span className="text-xs" style={{ ...mono, color: '#71717a' }}>
                  invest.ts
                </span>
                <CopyButton text={SNIPPET} />
              </div>
              <pre className="overflow-x-auto p-4 text-[12.5px] leading-[1.7] select-text" style={{ ...mono, color: '#e4e4e7' }}>
                {SNIPPET.split('\n').map((l, i) => (
                  <div key={i} style={{ color: l.trim().startsWith('//') ? '#71717a' : undefined }}>
                    {l || ' '}
                  </div>
                ))}
              </pre>
              <div className="px-4 py-2.5 text-[12px]" style={{ ...mono, color: '#4ade80', borderTop: '1px solid rgb(255 255 255 / 0.08)' }}>
                {'> { status: "success", kyc: "passed", funds_secured: true }'}
              </div>
            </div>
          </Stage>
        </div>
      </Ruled>
    </Band>
  )
}

/* ---------------------------------------------------------- managers */

function Managers() {
  return (
    <Band tone="light" label="For syndicate and fund managers">
      <Head
        eyebrow="For syndicate & fund managers"
        title="The syndicate & fund platform built for operators with deal flow."
        lede="Grow an engaged investor community and spend your time investing, helping founders and building relationships. We handle the fund and SPV admin."
      />
      <Ruled className="sm:grid-cols-3">
        {(
          [
            ['Syndicates', '/syndicates', 'Back deals with a community that follows you.'],
            ['Funds', '/funds', 'Raise and run a venture fund, admin included.'],
            ['SPVs', '/spv', 'One vehicle per deal, administered for life.'],
          ] as const
        ).map(([t, href, b]) => (
          <a key={t} href={url(href)} className="group flex flex-col gap-1 p-5 transition-colors duration-150 hover:bg-[var(--lp-sunk)] sm:p-8" style={{ background: 'var(--lp-bg)' }}>
            <span className="flex items-center justify-between text-[17px] font-[560]">
              {t}
              <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-0.5" style={{ color: 'var(--lp-accent)' }}>
                →
              </span>
            </span>
            <span className="text-[15px] font-medium" style={{ color: 'var(--lp-muted)' }}>
              {b}
            </span>
          </a>
        ))}
      </Ruled>
    </Band>
  )
}

/* -------------------------------------------------------- two ways */

const COMPARE: [string, string, string][] = [
  ['Who sees it', 'Invite only. No public disclosure.', 'A public raise page anyone can find and invest from.'],
  ['Investors', 'Up to 247, as one cap table line', 'Unlimited, as one cap table line'],
  ['Time to launch', 'Minutes', 'Days'],
  ['Who can invest', 'Accredited investors only', 'Anyone, from $100'],
]

function TwoWays() {
  return (
    <Band id="founders" tone="dark" label="Two ways to raise">
      <Head eyebrow="For founders" title="Two ways to raise." lede="Pick the one that fits who you want on your cap table. Both add a single line to it." />
      {/* AngelList's side-by-side, as a ruled table: the same question, answered twice. */}
      <div style={{ borderTop: '1px solid var(--lp-line)' }}>
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Private Round compared with Community Round</caption>
          <thead>
            <tr>
              <th className="hidden w-[22%] p-5 sm:table-cell sm:p-8" />
              {(
                [
                  ['Private Round', 'Top off your round. Invite your angels. Tap our network.', '/private-round', 'Private Rounds'],
                  ['Community Round', 'Your customers & fans already love you. Let them invest.', '/community-round', 'Community Rounds'],
                ] as const
              ).map(([name, line, href, cta], i) => (
                <th key={name} className="p-5 align-top font-normal sm:p-8" style={{ borderLeft: i ? '1px solid var(--lp-line)' : undefined }}>
                  <div className="flex flex-col gap-3">
                    <Eyebrow>{name}</Eyebrow>
                    <span className="text-[20px] leading-[1.25] font-[560] tracking-[-0.02em] text-balance sm:text-[24px]">{line}</span>
                    <a href={url(href)} className="mt-1 flex h-9 w-max items-center rounded-full px-4 text-sm font-medium" style={i ? secondary : primary}>
                      {cta} <span aria-hidden className="ml-1.5">→</span>
                    </a>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.map(([q, a, b]) => (
              <tr key={q} style={{ borderTop: '1px solid var(--lp-line)' }}>
                <th scope="row" className="hidden p-5 align-top text-xs font-medium tracking-[0.04em] uppercase sm:table-cell sm:px-8" style={{ ...mono, color: 'var(--lp-faint)' }}>
                  {q}
                </th>
                {[a, b].map((v, i) => (
                  <td key={i} className="p-5 align-top text-[15px] leading-[22px] font-medium sm:px-8" style={{ borderLeft: i ? '1px solid var(--lp-line)' : undefined }}>
                    <span className="mb-1 block text-[11px] tracking-[0.04em] uppercase sm:hidden" style={{ ...mono, color: 'var(--lp-faint)' }}>
                      {q}
                    </span>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ borderTop: '1px solid var(--lp-line)' }}>
        <Quote who="Chris Best" role="CEO of Substack">
          Yes, it's nice to raise money, but the most important part was giving the community a chance to participate. These are the
          people who are generating all the value in the network. This was our chance to bring them into Substack more formally.
        </Quote>
        <a
          href={url('/case-studies/substack')}
          className="group flex items-center gap-2 px-5 py-5 text-sm font-medium transition-colors duration-150 hover:bg-[var(--lp-chip)] sm:px-12"
          style={{ borderTop: '1px solid var(--lp-line)' }}
        >
          <span style={{ color: 'var(--lp-faint)' }}>Case study</span>
          <span aria-hidden style={{ color: 'var(--lp-faint)' }}>
            ·
          </span>
          Substack: A new economic engine for culture
          <span aria-hidden className="ml-auto transition-transform duration-150 group-hover:translate-x-0.5" style={{ color: 'var(--lp-accent)' }}>
            →
          </span>
        </a>
      </div>
    </Band>
  )
}

/* -------------------------------------------------------------- mission */

function Mission() {
  return (
    <Band id="mission" tone="light" label="Mission">
      <div className="flex flex-col items-center gap-6 px-5 py-24 text-center sm:px-12 sm:py-36">
        <Eyebrow>Wefunder is a public benefit corporation</Eyebrow>
        <h2 className="max-w-[760px] text-[38px] leading-[1.05] font-[560] tracking-[-0.035em] text-balance sm:text-[56px]">Let's keep the American dream alive.</h2>
        <p className="max-w-[560px] text-[17px] leading-7 font-medium text-pretty" style={{ color: 'var(--lp-muted)' }}>
          We want America to stay a country of optimism, invention and opportunity: the best place for an ambitious person to turn an idea
          into a company.
        </p>
        <a href={url('/pbc')} className="mt-2 flex h-10 items-center rounded-full px-5 text-[15px] font-medium" style={primary}>
          Learn more about our mission <span aria-hidden className="ml-1.5">→</span>
        </a>
      </div>
    </Band>
  )
}

/* --------------------------------------------------------------- footer */

const FOOTER: [string, [string, string][]][] = [
  [
    'Founders',
    [
      ['Community Round', '/community-round'],
      ['Private Round', '/private-round'],
      ['Investor Warmup', '/investor-warmup'],
      ['Pricing', '/pricing'],
      ['Case Studies', '/case-studies'],
      ['Verticals', '/verticals'],
      ['Legal Primer', '/legal-primer'],
      ['Founder Playbook', '/playbook'],
    ],
  ],
  [
    'Syndicates & Funds',
    [
      ['Syndicate', '/syndicates'],
      ['Fund', '/funds'],
      ['SPV', '/spv'],
    ],
  ],
  [
    'Learn',
    [
      ['Charter & Impact Report', '/pbc'],
      ['Careers', '/jobs'],
      ['Knowledge Base', '/articles'],
      ['Blog', '/news'],
      ['Press', '/press'],
      ['Roadshow', '/roadshow'],
      ['Help Center', 'https://help.wefunder.com/'],
    ],
  ],
  [
    'Platform',
    [
      ['API & Agents', '/agents'],
      ['Invest', '/invest'],
      ['Explore', '/explore'],
      ['Vault', '/vault'],
    ],
  ],
]

function Footer() {
  return (
    <footer data-lp-tone="dark" className="px-4 sm:px-6" style={{ background: 'var(--lp-bg)', borderTop: '1px solid var(--lp-line)', color: 'var(--lp-fg)' }}>
      <div className="mx-auto max-w-[1152px]" style={{ borderLeft: '1px solid var(--lp-line)', borderRight: '1px solid var(--lp-line)' }}>
        <div className="grid gap-10 px-5 py-14 sm:px-12 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-3">
            <Wordmark />
            <p className="max-w-[220px] text-sm" style={{ color: 'var(--lp-faint)' }}>
              The operating system for fundraising.
            </p>
          </div>
          {FOOTER.map(([h, links]) => (
            <div key={h} className="flex flex-col gap-2.5 text-sm">
              <p className="font-[560]">{h}</p>
              {links.map(([label, href]) => (
                <a key={label} href={url(href)} className="lp-link w-max" style={{ color: 'var(--lp-muted)' }}>
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
        {/* The regulatory text, exactly as Wefunder publishes it. */}
        <div className="flex flex-col gap-3 px-5 py-8 text-[12px] leading-[1.6] sm:px-12" style={{ borderTop: '1px solid var(--lp-line)', color: 'var(--lp-faint)' }}>
          <p>Wefunder means Wefunder Inc and its subsidiaries: Wefunder Advisors LLC, Capitalize Advisors LLC, and Wefunder Portal LLC. This page is hosted by Wefunder Inc.</p>
          <p>Wefunder Portal LLC is a member of the Financial Industry Regulatory Authority (FINRA). Wefunder Portal LLC is located in Gun Barrel City, Texas.</p>
          <p style={{ color: 'var(--lp-muted)' }}>
            Investing is risky. You could lose all your money. Only invest what you can afford to lose. Most investments are hard to sell, and there's no promise
            you'll get your money back or make a profit. Wefunder does not offer investment advice. Do your own research.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            {(
              [
                ['Important Disclosures', '/disclosures'],
                ['Terms', '/terms'],
                ['Privacy', '/terms'],
                ['Cookies', '#'],
              ] as const
            ).map(([l, h]) => (
              <a key={l} href={h === '#' ? '#' : url(h)} className="lp-link" style={{ color: 'var(--lp-muted)' }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export function Wefunder() {
  useDarkPage()
  return (
    <div data-lp className="min-h-dvh" style={{ background: 'var(--lp-bg)', color: 'var(--lp-fg)', fontFamily: "'Tuff Inter', var(--font-sans)" }}>
      <Nav />
      <main>
        <Hero />
        <Products />
        <Community />
        <Access />
        <Control />
        <Network />
        <Experience />
        <Agent />
        <Api />
        <Managers />
        <TwoWays />
        <Mission />
      </main>
      <Footer />
    </div>
  )
}

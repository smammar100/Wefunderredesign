import { useRef, useState } from 'react'
import {
  Bank,
  Bell,
  BookmarkSimple,
  Briefcase,
  CaretDown,
  CaretRight,
  ChatCircle,
  Compass,
  DotsThree,
  Export,
  Eye,
  Feather,
  Gear,
  Gift,
  Heart,
  Lightning,
  MagnifyingGlass,
  Plus,
  Question,
  User,
  UsersThree,
  Vault,
  Wallet,
  type Icon as PhIcon,
} from '@phosphor-icons/react'
import { COMPANY_IMG, GROUP, LIVE, POSTS, SPOTS, STACK, TRENDING, type GroupCard, type Post } from './data.js'

/*
 * The Wefunder feed — screen 8a of the "Feed 2a and 7a" handoff: the 7a
 * layout in the Tuff design system. White shell, grey containers, white
 * cards inside them, blue for the actions.
 *
 * Every colour is a Tuff token, so the screen follows the dark theme too:
 * the handoff's #1d1d1f / #5e5e63 / #6c6c70 are --ink / --ink-2 / --ink-3,
 * its rgb(38 38 88 / .06) is --hover, its button ring is --control-shadow.
 * Three are this screen's own, set once on its root (`SHELL`).
 */

const SHELL: React.CSSProperties = {
  /* The grey of a container: the shell with 2% of the ink in it (#fafafa on white). */
  ['--f-box' as string]: 'color-mix(in srgb, var(--ink) 2%, var(--chrome))',
  ['--f-card' as string]: 'var(--surface)',
  /* A card's hairline: 6% of the ink, which is rgb(0 0 0 / .06) in light. */
  ['--f-ring' as string]: '0 0 0 1px color-mix(in srgb, var(--ink) 6%, transparent)',
  ['--f-like' as string]: '#de274a',
  background: 'var(--chrome)',
  color: 'var(--ink)',
}

const press = 'transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]'
const ink2 = { color: 'var(--ink-2)' }
const ink3 = { color: 'var(--ink-3)' }

/* ------------------------------------------------------------- controls */

/* The white pill with the control ring: Invite, Follow, See all. */
function Quiet({ children, onClick, className = '', ...rest }: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 shrink-0 rounded-full px-3.5 text-[14px] leading-6 font-medium ${press} ${className}`}
      style={{ background: 'var(--f-card)', boxShadow: 'var(--control-shadow)', color: 'var(--ink)' }}
      {...rest}
    >
      {children}
    </button>
  )
}

function Primary({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={`h-8 shrink-0 rounded-full px-4 text-[14px] leading-6 font-medium ${press} ${className}`} style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
      {children}
    </button>
  )
}

function Round({ label, icon: I, size = 32, onClick, ring = false }: { label: string; icon: PhIcon; size?: number; onClick?: () => void; ring?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center rounded-full ${press}`}
      style={{
        width: size,
        height: size,
        background: ring ? 'var(--f-card)' : 'var(--f-box)',
        boxShadow: ring ? 'var(--control-shadow)' : undefined,
        color: ring ? 'var(--ink)' : 'var(--ink-2)',
      }}
    >
      <I size={size >= 40 ? 18 : 18} />
    </button>
  )
}

/* A word in a tint: "Raising", "Syndicate Lead", "$19,756 in 7 days". */
function Tag({ tint, children }: { tint: 'green' | 'blue' | 'yellow'; children: React.ReactNode }) {
  const look = {
    green: { background: 'color-mix(in srgb, var(--tint-3) 16%, transparent)', color: 'var(--tint-3-ink)' },
    blue: { background: 'var(--accent-soft)', color: 'var(--tint-5-ink)' },
    yellow: { background: 'color-mix(in srgb, var(--tint-2) 22%, transparent)', color: 'var(--tint-2-ink)' },
  }[tint]
  return (
    <span className="shrink-0 rounded-full px-2 py-px text-xs font-medium whitespace-nowrap tabular-nums" style={look}>
      {children}
    </span>
  )
}

function Photo({ src, size, radius = 9999, className = '', style }: { src: string; size: number; radius?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      role="img"
      aria-hidden
      className={`block shrink-0 bg-cover bg-center ${className}`}
      style={{ width: size, height: size, borderRadius: radius, backgroundColor: 'var(--sunken)', backgroundImage: `url('${src}')`, ...style }}
    />
  )
}

/* A grey container: the feed's and the side column's unit. */
function Box({ children, className = '', as: Tag = 'div' }: { children: React.ReactNode; className?: string; as?: 'div' | 'article' | 'section' }) {
  return (
    <Tag className={`flex shrink-0 flex-col gap-3 rounded-2xl p-3 ${className}`} style={{ background: 'var(--f-box)' }}>
      {children}
    </Tag>
  )
}

/* The white card inside a container. */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl ${className}`} style={{ background: 'var(--f-card)', boxShadow: 'var(--f-ring)' }}>
      {children}
    </div>
  )
}

function BoxTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex h-12 items-center gap-2 px-3 py-2.5">
      <h2 className="flex-1 text-[17px] leading-6 font-medium tracking-[-0.3px]">{children}</h2>
      {aside}
    </div>
  )
}

/* ------------------------------------------------------------------ nav */

const NAV: [PhIcon, string][] = [
  [Lightning, 'Activity'],
  [MagnifyingGlass, 'Deals'],
  [Briefcase, 'Portfolio'],
  [Bank, 'Cash'],
  [User, 'Profile'],
  [UsersThree, 'Groups'],
  [Compass, 'Explore'],
  [Vault, 'Venture Vault'],
]

function NavLink({ icon: I, label, on = false, quiet = false }: { icon: PhIcon; label: string; on?: boolean; quiet?: boolean }) {
  return (
    <a
      href="#"
      aria-current={on ? 'page' : undefined}
      className="flex h-8 shrink-0 items-center gap-2.5 rounded-lg px-3 text-[14px] leading-6 font-medium transition-colors duration-150 hover:text-[var(--ink)]"
      style={{ background: on ? 'var(--hover)' : 'transparent', color: on ? 'var(--ink)' : 'var(--ink-2)' }}
      onClick={(e) => e.preventDefault()}
    >
      <I size={18} weight={quiet ? 'regular' : 'regular'} />
      {label}
    </a>
  )
}

function Sidebar() {
  return (
    <nav aria-label="Main" className="hidden w-[200px] shrink-0 flex-col gap-1 md:flex">
      <button type="button" className="mb-4 flex h-12 shrink-0 items-center gap-3 px-1 text-left">
        <span className="flex size-10 items-center justify-center rounded-full text-[13px] font-medium text-white" style={{ background: 'var(--face-1)' }}>
          SM
        </span>
        <span className="flex-1 text-[14px] leading-6 font-medium">smammar</span>
        <CaretDown size={16} style={ink2} />
      </button>
      {NAV.map(([I, label], i) => (
        <NavLink key={label} icon={I} label={label} on={i === 0} />
      ))}
      <div className="min-h-2 flex-1" />
      {/* Inverted, so it reads as an offer rather than another place to go. */}
      <div className="mb-2 flex shrink-0 flex-col gap-3 rounded-xl px-3 pt-4 pb-3" style={{ background: 'var(--ink)', color: 'var(--chrome)', boxShadow: 'inset 0 0 0 1.5px rgb(255 255 255 / 0.1)' }}>
        <div className="flex flex-col gap-1 px-1">
          <span className="text-[15px] leading-[22px] font-medium">Upgrade to VIP</span>
          <span className="text-[13px] leading-[18px] opacity-70">Get ~10% bonus equity when you invest, plus VIP-only deals.</span>
        </div>
        <button type="button" className={`h-10 rounded-full text-[14px] font-medium ${press}`} style={{ background: 'var(--chrome)', color: 'var(--ink)' }}>
          Upgrade · $295/year
        </button>
      </div>
      <NavLink icon={Gift} label="Refer and earn" quiet />
      <NavLink icon={Question} label="Help" quiet />
      <NavLink icon={Gear} label="Settings" quiet />
    </nav>
  )
}

/* --------------------------------------------------------------- header */

function TopBar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3">
      <h1 className="flex-1 text-[24px] leading-8 font-medium tracking-[-0.7px]">Feed</h1>
      <label className="hidden h-8 w-[320px] items-center gap-2 rounded-full px-3 text-[14px] leading-6 lg:flex" style={{ background: 'var(--f-box)', ...ink2 }}>
        <MagnifyingGlass size={18} />
        <input
          type="search"
          placeholder="Search companies and people"
          aria-label="Search companies and people"
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--ink-2)]"
          style={{ color: 'var(--ink)' }}
        />
      </label>
      <Round label="Notifications" icon={Bell} />
      <Round label="Messages" icon={ChatCircle} />
      <Primary>Raise capital</Primary>
    </header>
  )
}

/* ----------------------------------------------------------- composer */

type Tab = 0 | 1 | 2
const TABS = ['For you', 'Following', 'Raising'] as const

function Spotlights({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <Box className="pb-6">
      {/* On a phone the tabs take their own line under the title, rather than wrapping inside a pill. */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2 pl-3 sm:h-12 sm:flex-nowrap">
        <h2 className="flex-1 text-[17px] leading-6 font-medium tracking-[-0.3px] max-sm:basis-full max-sm:pt-2">Spotlights</h2>
        <div role="tablist" aria-label="Feed" className="flex gap-1 whitespace-nowrap max-sm:-ml-3.5">
          {TABS.map((label, i) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i as Tab)}
              className="h-8 rounded-full px-3.5 text-[14px] font-medium transition-[background-color,color] duration-150"
              style={{ background: tab === i ? 'var(--f-card)' : 'transparent', color: tab === i ? 'var(--ink)' : 'var(--ink-2)' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto px-3 [scrollbar-width:none]">
        <button
          type="button"
          aria-label="Add Spotlight"
          className="flex h-36 w-[104px] shrink-0 flex-col items-center justify-center gap-3 rounded-xl text-[13px] leading-[18px]"
          style={{ background: 'var(--f-card)', boxShadow: 'var(--f-ring)', ...ink2 }}
        >
          <span className="flex size-8 items-center justify-center rounded-full" style={{ boxShadow: 'var(--control-shadow)' }}>
            <Plus size={20} />
          </span>
          Add Spotlight
        </button>
        {SPOTS.map((s, i) => (
          <button
            key={i}
            type="button"
            className="relative h-36 w-[104px] shrink-0 overflow-hidden rounded-xl bg-cover bg-center text-left"
            style={{ backgroundColor: 'var(--sunken)', backgroundImage: `url('${s.tall}')` }}
          >
            <span className="absolute inset-x-0 bottom-0 truncate px-3 pt-6 pb-2.5 text-[13px] leading-[18px] font-medium text-white" style={{ background: 'linear-gradient(transparent, rgb(8 8 8 / 0.6))' }}>
              {s.name}
            </span>
          </button>
        ))}
      </div>
      <label className="mx-3 flex h-14 items-center gap-3 rounded-full py-1 pr-1 pl-5" style={{ background: 'var(--f-card)', boxShadow: 'var(--f-ring)' }}>
        <input placeholder="Write a post…" aria-label="Write a post" className="min-w-0 flex-1 bg-transparent text-[14px] leading-6 outline-none placeholder:text-[var(--ink-2)]" />
        <button type="button" aria-label="Post" title="Post" className={`flex size-10 items-center justify-center rounded-full ${press}`} style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
          <Feather size={22} />
        </button>
      </label>
    </Box>
  )
}

/* ------------------------------------------------------------ actions */

function Like({ count, on, onPress, ringed = false }: { count: number | ''; on: boolean; onPress: () => void; ringed?: boolean }) {
  return (
    <button
      type="button"
      aria-label="Like"
      aria-pressed={on}
      onClick={onPress}
      className={`flex shrink-0 items-center rounded-full font-medium tabular-nums ${ringed ? 'h-7 gap-1.5 px-2.5' : 'h-8 gap-2 px-2.5'} text-[14px] ${press}`}
      style={{ color: on ? 'var(--f-like)' : 'var(--ink-2)', boxShadow: ringed ? 'var(--control-shadow)' : undefined }}
    >
      <Heart size={ringed ? 18 : 20} weight={on ? 'fill' : 'regular'} />
      {count}
    </button>
  )
}

function Act({ icon: I, children }: { icon: PhIcon; children: React.ReactNode }) {
  return (
    <button type="button" className={`flex h-8 items-center gap-2 rounded-full px-2.5 text-[14px] font-medium ${press}`} style={ink2}>
      <I size={20} />
      {children}
    </button>
  )
}

function More() {
  return (
    <button type="button" aria-label="More" className="flex size-7 shrink-0 items-center justify-center rounded-full" style={ink2}>
      <DotsThree size={18} />
    </button>
  )
}

/* The company a post is about, with its two actions. */
function Raise({ img, name, tagline }: { img: string; name: string; tagline: string }) {
  return (
    <Card className="flex items-center gap-3 p-3">
      <Photo src={img} size={56} radius={8} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] leading-[22px] font-medium">{name}</span>
          <Tag tint="blue">Raising</Tag>
        </div>
        {tagline && (
          <p className="truncate text-[13px] leading-[18px]" style={ink2} title={tagline}>
            {tagline}
          </p>
        )}
      </div>
      <button type="button" aria-label="Save" className="flex size-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--f-card)', boxShadow: 'var(--control-shadow)', color: 'var(--ink)' }}>
        <BookmarkSimple size={20} />
      </button>
      <Primary>View raise</Primary>
    </Card>
  )
}

/* --------------------------------------------------------- group post */

const LONG = 280

function GroupQuote({ g, liked, open, onLike, onMore }: { g: GroupCard; liked: boolean; open: boolean; onLike: () => void; onMore: () => void }) {
  const long = g.paras.join(' ').length > LONG
  const clipped = long && !open
  const fade = 'linear-gradient(to bottom, #000 calc(100% - 2lh), transparent 100%)'
  return (
    <div className="flex min-w-0 shrink-0 basis-[78%] snap-start flex-col gap-3 pt-4 pr-4 pb-[60px] pl-3" style={{ boxShadow: 'inset -1px 0 0 color-mix(in srgb, var(--ink) 8%, transparent)' }}>
      <div className="flex items-start gap-3">
        <Photo src={g.avatar} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[14px] leading-6 whitespace-nowrap">
            <span className="min-w-0 truncate font-medium">{g.name}</span>
            <span style={ink2}>invested</span>
            <span className="text-xs" style={ink3}>
              {g.time}
            </span>
          </div>
          <p className="truncate text-[13px] leading-[18px]" style={ink2} title={g.bio}>
            {g.bio}
          </p>
        </div>
        <Like count={g.likes + (liked ? 1 : 0) || ''} on={liked} onPress={onLike} ringed />
      </div>
      <div
        className="flex flex-col gap-3 overflow-hidden text-[15px] leading-6 text-pretty transition-[max-height] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ maxHeight: clipped ? '4lh' : 1200, WebkitMaskImage: clipped ? fade : 'none', maskImage: clipped ? fade : 'none' }}
      >
        {g.paras.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>
      {long && (
        <button type="button" onClick={onMore} className="self-start text-[14px] leading-6 font-medium" style={{ color: 'var(--accent)' }}>
          {open ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

function GroupPost({ liked, open, flipLike, flipOpen }: { liked: Record<string, boolean>; open: Record<string, boolean>; flipLike: (id: string) => void; flipOpen: (id: string) => void }) {
  const row = useRef<HTMLDivElement>(null)
  /*
   * One quote along, or back to the first from the last.
   *
   * To the next card's own edge: the row snaps to every card, and the
   * handoff's fixed 228px step was less than half a card (~523px), so the
   * snap pulled it straight back to where it started.
   */
  const next = () => {
    const r = row.current
    if (!r) return
    const end = r.scrollLeft + r.clientWidth >= r.scrollWidth - 4
    const ahead = [...r.children].find((c) => (c as HTMLElement).offsetLeft > r.scrollLeft + 4) as HTMLElement | undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    r.scrollTo({ left: end || !ahead ? 0 : ahead.offsetLeft, behavior: reduce ? 'auto' : 'smooth' })
  }
  const tilt = [
    { left: 0, top: 8, z: 0, r: -8 },
    { left: 30, top: 2, z: 1, r: 5 },
    { left: 60, top: 8, z: 0, r: -4 },
  ]
  return (
    <Box as="article" className="min-w-0 pb-4">
      <div className="flex items-center gap-3 px-3 pt-2.5">
        <div aria-hidden className="relative h-[52px] w-[104px] shrink-0">
          {STACK.map((src, i) => (
            <span
              key={src}
              className="feed-face absolute size-10 rounded-full bg-cover bg-center transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{
                left: tilt[i]!.left,
                top: tilt[i]!.top,
                zIndex: tilt[i]!.z,
                ['--r' as string]: `${tilt[i]!.r}deg`,
                backgroundColor: 'var(--sunken)',
                backgroundImage: `url('${src}')`,
                boxShadow: '0 0 0 2px var(--f-box), 0 6px 8px -4px rgb(8 8 8 / 0.25)',
              }}
            />
          ))}
          <span
            className="pointer-events-none absolute top-2 left-[60px] z-[2] flex size-10 items-center justify-center rounded-full text-[11px] font-medium text-white tabular-nums"
            style={{ transform: 'rotate(-4deg)', background: 'rgb(8 8 8 / 0.6)' }}
          >
            +480
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] leading-[22px] font-medium">
            Kristie, Timothy, David <span style={ink2}>and</span> 480 others <span style={ink2}>invested</span>
          </p>
          <div className="flex items-center gap-2 text-[13px] leading-[18px]" style={ink3}>
            <span className="truncate">
              in <span className="font-medium" style={{ color: 'var(--ink)' }}>First Jet Airways</span>
            </span>
            <Tag tint="green">$19,756 in 7 days</Tag>
          </div>
        </div>
        <More />
      </div>
      <Card className="relative overflow-hidden">
        <div ref={row} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]">
          {GROUP.map((g) => (
            <GroupQuote key={g.id} g={g} liked={!!liked[g.id]} open={!!open[g.id]} onLike={() => flipLike(g.id)} onMore={() => flipOpen(g.id)} />
          ))}
          <div aria-hidden className="shrink-0 basis-[22%]" />
        </div>
        {/* The next quote, frosted at the edge so the row reads as one that goes on. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-[22%] rounded-r-[20px] backdrop-blur-[2.5px]"
          style={{
            background:
              'linear-gradient(to right, color-mix(in srgb, var(--f-card) 0%, transparent) 0%, color-mix(in srgb, var(--f-card) 12%, transparent) 30%, color-mix(in srgb, var(--f-card) 45%, transparent) 60%, color-mix(in srgb, var(--f-card) 88%, transparent) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgb(0 0 0 / 0.04) 14%, rgb(0 0 0 / 0.16) 30%, rgb(0 0 0 / 0.4) 50%, rgb(0 0 0 / 0.72) 72%, #000 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, rgb(0 0 0 / 0.04) 14%, rgb(0 0 0 / 0.16) 30%, rgb(0 0 0 / 0.4) 50%, rgb(0 0 0 / 0.72) 72%, #000 100%)',
          }}
        />
        <button
          type="button"
          onClick={next}
          aria-label="Next quote"
          title="Next quote"
          className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full transition-transform duration-150 active:scale-[0.94]"
          style={{ background: 'var(--f-card)', boxShadow: 'var(--control-shadow)', color: 'var(--ink)' }}
        >
          <CaretRight size={18} />
        </button>
      </Card>
      <Raise img={COMPANY_IMG} name="First Jet Airways" tagline="An airline owned by the people who fly it" />
      <div className="flex items-center gap-1">
        <Act icon={ChatCircle}>Comment</Act>
        <Act icon={Export}>Share</Act>
      </div>
    </Box>
  )
}

/* -------------------------------------------------------------- post */

function QuotePost({
  p,
  liked,
  open,
  following,
  onLike,
  onMore,
  onFollow,
}: {
  p: Post
  liked: boolean
  open: boolean
  following: boolean
  onLike: () => void
  onMore: () => void
  onFollow: () => void
}) {
  return (
    <Box as="article" className="pb-4">
      <div className="flex items-center gap-3 px-3 pt-2.5">
        <Photo src={p.avatar} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] leading-[22px] font-medium">{p.name}</p>
          <p className="truncate text-[13px] leading-[18px]" style={ink3}>
            {p.role} of {p.company} · shared a quote · {p.time} · Public
          </p>
        </div>
        <More />
      </div>
      <p className="px-3 text-[17px] leading-6 font-medium tracking-[-0.3px] text-balance">
        {p.invName} <span style={ink2}>invested</span> {p.invAmount} <span style={ink2}>in</span> {p.company}
      </p>
      <div
        className="flex flex-col gap-3 overflow-hidden px-3 text-[15px] leading-6 text-pretty transition-[max-height] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ maxHeight: open ? 1200 : 144 }}
      >
        {p.paras.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>
      <button type="button" onClick={onMore} className="ml-3 self-start text-[14px] leading-6 font-medium" style={{ color: 'var(--accent)' }}>
        {open ? 'Show less' : 'Show more'}
      </button>
      <Card className="flex items-start gap-3 px-3 py-4">
        <Photo src={p.invAvatar} size={40} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] leading-6 font-medium">{p.invName}</span>
            <Tag tint="yellow">Syndicate Lead</Tag>
          </div>
          <p className="text-[13px] leading-[18px] text-pretty [overflow-wrap:anywhere]" style={ink2}>
            {p.invBio}
          </p>
        </div>
        <Quiet onClick={onFollow} aria-pressed={following}>
          {following ? 'Following' : 'Follow'}
        </Quiet>
      </Card>
      <Raise img={p.coImg} name={p.company} tagline={p.tagline} />
      <div className="flex items-center gap-1 tabular-nums">
        <Like count={p.likes + (liked ? 1 : 0)} on={liked} onPress={onLike} />
        <Act icon={ChatCircle}>Comment</Act>
        <Act icon={Export}>Share</Act>
        <span className="flex-1" />
        <span className="flex items-center gap-2 px-3 text-[13px] leading-[18px]" style={ink3}>
          <Eye size={20} />
          {p.views} views
        </span>
      </div>
    </Box>
  )
}

/* ------------------------------------------------------------- aside */

function Portfolio() {
  return (
    <Box>
      <div className="flex items-start gap-2 px-3 pt-2.5">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[14px] leading-6" style={ink2}>
            <Wallet size={18} />
            Portfolio value
          </div>
          <p className="text-[32px] leading-10 font-medium tracking-[-0.7px] tabular-nums">$0</p>
        </div>
        <Quiet>Invite</Quiet>
      </div>
      <Card className="grid grid-cols-3 px-3 py-4 tabular-nums">
        {[
          ['1', 'Following'],
          ['0', 'Followers'],
          ['$0', 'Backing'],
        ].map(([n, label]) => (
          <div key={label}>
            <p className="text-[15px] leading-[22px] font-medium">{n}</p>
            <p className="text-[13px] leading-[18px]" style={ink2}>
              {label}
            </p>
          </div>
        ))}
      </Card>
    </Box>
  )
}

function MostDiscussed() {
  return (
    <Box className="pb-6">
      <BoxTitle>Most discussed</BoxTitle>
      <ol className="flex flex-col gap-1">
        {TRENDING.map((t) => (
          <li key={t.name}>
            <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3 rounded-xl p-3 transition-colors duration-150 hover:bg-[var(--f-card)]">
              <Photo src={t.img} size={36} radius={8} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] leading-6 font-medium">{t.name}</span>
                <span className="block text-[13px] leading-[18px]" style={ink3}>
                  investments this week
                </span>
              </span>
              <span className="text-[15px] leading-6 font-medium tabular-nums">{t.count}</span>
            </a>
          </li>
        ))}
      </ol>
      <div className="flex flex-col px-3">
        <Quiet>See all trending</Quiet>
      </div>
    </Box>
  )
}

function LiveInvestments() {
  return (
    <Box className="pb-6">
      <BoxTitle
        aside={
          <span
            aria-label="Live"
            className="feed-live mr-1 size-2 rounded-full"
            style={{ background: 'var(--tint-3)', boxShadow: '0 0 0 4px color-mix(in srgb, var(--tint-3) 18%, transparent)' }}
          />
        }
      >
        Live investments
      </BoxTitle>
      <ol className="flex flex-col gap-1">
        {LIVE.map((l, i) => {
          const invested = l.verb.startsWith('invested')
          return (
            <li key={l.name} className="relative flex gap-2.5 px-3 pb-4">
              {/* The thread between one investment and the next. */}
              {i < LIVE.length - 1 && <span aria-hidden className="absolute top-[38px] -bottom-1 left-[27.5px] w-px" style={{ background: 'color-mix(in srgb, var(--ink) 12%, transparent)' }} />}
              <span className="relative size-8 shrink-0">
                <Photo src={l.avatar} size={32} />
                <span
                  title={invested ? 'Invested' : 'Reserved'}
                  className="absolute -right-px -bottom-px size-2 rounded-full"
                  style={{ background: invested ? 'var(--tint-3)' : 'var(--tint-1)', boxShadow: '0 0 0 2px var(--f-box)' }}
                />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1.5">
                <div className="flex items-baseline gap-2">
                  <p className="min-w-0 flex-1 text-[14px] leading-5 text-pretty" style={ink2}>
                    <a href="#" onClick={(e) => e.preventDefault()} className="font-medium transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--ink)' }}>
                      {l.name}
                    </a>{' '}
                    {l.verb}{' '}
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="font-medium underline decoration-[color-mix(in_srgb,var(--ink)_12%,transparent)] underline-offset-[3px] transition-colors hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
                      style={{ color: 'var(--ink)' }}
                    >
                      {l.company}
                    </a>
                  </p>
                  <span className="shrink-0 text-xs leading-4 tabular-nums" style={ink3}>
                    {l.time}
                  </span>
                </div>
                {l.quote && (
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="line-clamp-2 rounded-[4px_12px_12px_12px] px-2.5 py-2 text-[13px] leading-[18px] transition-colors duration-150 hover:text-[var(--ink)]"
                    style={{ background: 'var(--f-card)', boxShadow: 'var(--f-ring)', ...ink2 }}
                  >
                    {l.quote}
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      <div className="flex flex-col px-3">
        <Quiet>See all investments</Quiet>
      </div>
    </Box>
  )
}

/* -------------------------------------------------------------- page */

export function Feed() {
  const [tab, setTab] = useState<Tab>(0)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [follow, setFollow] = useState<Record<string, boolean>>({})
  const flip = (set: typeof setLiked) => (id: string) => set((s) => ({ ...s, [id]: !s[id] }))

  /* Following shows only the people you follow; the group post is everyone's. */
  const posts = tab === 1 ? POSTS.filter((p) => follow[p.id]) : POSTS

  return (
    <div className="flex h-dvh gap-5 overflow-hidden p-4" style={SHELL}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <TopBar />
        <div className="flex min-h-0 flex-1 items-start gap-3 overflow-y-auto rounded-2xl [scrollbar-width:none]">
          <main className="flex min-w-0 flex-1 flex-col gap-3">
            <Spotlights tab={tab} setTab={setTab} />
            {posts.length === 0 && (
              <Box className="px-6 py-12 text-center text-[14px]">
                <p style={ink2}>Follow an investor to see their quotes here.</p>
              </Box>
            )}
            {tab !== 1 && <GroupPost liked={liked} open={open} flipLike={flip(setLiked)} flipOpen={flip(setOpen)} />}
            {posts.map((p) => (
              <QuotePost
                key={p.id}
                p={p}
                liked={!!liked[p.id]}
                open={!!open[p.id]}
                following={!!follow[p.id]}
                onLike={() => flip(setLiked)(p.id)}
                onMore={() => flip(setOpen)(p.id)}
                onFollow={() => flip(setFollow)(p.id)}
              />
            ))}
          </main>
          <aside className="hidden w-[340px] shrink-0 flex-col gap-3 xl:flex" aria-label="Your investing">
            <Portfolio />
            <MostDiscussed />
            <LiveInvestments />
          </aside>
        </div>
      </div>
    </div>
  )
}

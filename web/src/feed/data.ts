/*
 * The feed's content, as the handoff ("Feed 2a and 7a", screen 8a) has it.
 */

export const img = (id: string, w: number, h: number) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=70`
const face = (id: string) => `https://images.unsplash.com/photo-${id}?w=96&h=96&fit=crop&crop=faces&q=70`

export type Post = {
  id: string
  name: string
  time: string
  role: string
  company: string
  avatar: string
  coImg: string
  tagline: string
  invName: string
  invAvatar: string
  invAmount: string
  invBio: string
  likes: number
  views: number
  paras: string[]
}

export const POSTS: Post[] = [
  {
    id: 'a',
    name: 'Catalina Gaete-Bentz',
    time: '6d',
    role: 'Founder & CEO',
    company: 'Catan Pisco',
    avatar: img('1494790108377-be9c29b29330', 96, 96),
    coImg: img('1514362545857-3bc16c4c7d1b', 240, 180),
    tagline: '',
    invName: 'Diane Yetter',
    invAvatar: face('1573496359142-b8d87734a5a2'),
    invAmount: '$15,000',
    invBio:
      'Diane L. Yetter is the president of YETTER Tax, a sales tax consulting and tax technology firm and founder of The Sales Tax Institute. She is also a strategist, advisor, speaker, and author. 30 year entrepreneur. Inc Best Workplace & Power Partner.',
    likes: 4,
    views: 7,
    paras: [
      'As a fellow entrepreneur, I understand what it takes to take an idea for a business to execution. And what it takes to grow a business and keep it operating. I know and understand what you have to commit to doing and how it can be exhilarating and scary all at the same time. And after meeting Catalina Bentz I know she has what it takes!',
      "I met Catalina at a small women business owner event - she was pouring Pisco Palomas. I'm more of a wine drinker so I wasn't so sure - but one taste and I was convinced. Since then I've been a cheerleader for Catan Pisco - looking for opportunities to broaden her customer base. She know is our signature cocktail at one of my company's events annually and I was able to sponsor a conference during COVID where she introduced Catan to a national audience. I also got her into a private club in my home town.",
      "I am investing in Catan Pisco because I believe in Catalina ! She has created an amazing product and is 100% committed to making it a household name. I've traveled with her to her first international launch and then was lucky enough to join her and a small group to go to Chile for Harvest. Seeing her interacting with the vineyard team as well as doing bartender training for a major international hotel…",
    ],
  },
  {
    id: 'b',
    name: 'Joseph Harberg',
    time: 'Oct 4',
    role: 'Co-CEO: Strategic, Administrative Leader and Interim CFO',
    company: 'Venduni, Inc.',
    avatar: img('1560250097-0b93528c311a', 96, 96),
    coImg: img('1509042239860-f550ce710b93', 240, 180),
    tagline: 'Innovating Smart Hospitality: Chef-Curated Cuisines•Trending Finds•AI-powered Retail Tech•Open 24/7.',
    invName: 'Neal Bernstein',
    invAvatar: face('1519085360753-af0119f7cbe7'),
    invAmount: '$5,000',
    invBio: 'https://www.linkedin.com/in/nealbernstein/',
    likes: 15,
    views: 36,
    paras: [
      "I'm excited about Venduni because I believe it represents a genuinely differentiated consumer experience with significant potential to scale. The idea of combining the convenience and consistency of automation with something as habitual and personal as a daily meal purchases is compelling. What caught my attention is that Venduni isn't simply selling coffee—it's rethinking the traditional café experience through robotics. I believe the model has the potential to work well beyond iits' current location to other high-traffic locations, such as office buildings, colleges, enterprises, hotels, and others. It's a unique concept at the intersection of consumer experience, automation and an enormous everyday category, and I'm excited to see how far the team can take it.",
    ],
  },
  {
    id: 'c',
    name: 'Scopify founder',
    time: 'Sep 28',
    role: 'Founder',
    company: 'Scopify',
    avatar: img('1503387762-592deb58ef4e', 96, 96),
    coImg: img('1512941937669-90a1b58e7e9c', 240, 180),
    tagline: 'Finally! Scope- and budget-ready clients for residential architects.',
    invName: 'Robert Newhouse',
    invAvatar: face('1568602471122-7832951cc4c5'),
    invAmount: '$5,000',
    invBio:
      'Rob is a Managing Director at Wells Fargo Securities and has spent 25+ years building electronic marketplaces. He has been a startup founder and early-stage entrepreneur, and has helped multiple formative companies reach success.',
    likes: 11,
    views: 28,
    paras: [
      "I'm backing Scopify because it fixes a problem I've watched friends and neighbors live through. Homeowners pay for designs before anyone can tell them what the project will actually cost. Too often the real number shows up only after the drawings are done and the money is spent.",
      'I work in electronic trading, where price transparency before you commit is taken for granted. Home construction works the other way around. Scopify moves cost clarity to the start of the process. Homeowners get localized construction pricing and a defined scope before they hire anyone, and architects get clients whose budgets fit their plans.',
    ],
  },
]

export type GroupCard = { id: string; name: string; avatar: string; time: string; bio: string; likes: number; paras: string[] }

const gc = (id: string, name: string, photo: string, time: string, bio: string, likes: number, paras: string[]): GroupCard => ({
  id,
  name,
  avatar: img(photo, 96, 96),
  time,
  bio,
  likes,
  paras,
})

export const GROUP: GroupCard[] = [
  gc('g1', 'Kristie Carr', '1438761681033-6461ffad8d80', '5d', 'Vermont small business owner (FiberStash Dyeworks + a vacation rental) and accessibility a…', 5, [
    'Hunter and Tom, thank you for building an airline that takes disability seriously. I\'ve spent years helping clients with mobility needs navigate travel, and the biggest fear I hear is the same every time: "Will my wheelchair arrive in one piece, and will I be treated with dignity?" Your commitment to respecting customers and their equipment is what convinced me to invest. If you ever need another resource on accessibility or the passenger experience for wheelchair users, I\'d be glad to help. Proud to be part of this!',
  ]),
  gc('g2', 'Timothy', '1500648767791-00dcc994a43e', '5d', 'Retired airline captain, 31 years on the flight deck', 3, [
    'I am a retired captain and flew regional routes for most of my career.',
    'I understand how thin the margins are and how much depends on the people running the operation.',
    "I'm also interested in the ownership model. Passengers who own a piece of the airline will hold it to a higher standard.",
    'Off we go...',
  ]),
  gc('g3', 'David', '1472099645785-5658abf4ff4e', '6d', 'Small-town mayor and frequent regional flyer', 2, [
    'Our airport lost its last scheduled service four years ago. Since then the nearest flight has been a three hour drive away.',
    'An airline that asks communities like ours to invest, and then actually flies here, is something I want to back.',
  ]),
  gc('g4', 'Priya Nair', '1494790108377-be9c29b29330', '6d', 'Travel nurse, flies about 40 segments a year', 8, [
    'I spend a lot of my life in airports. The carriers I use treat loyalty as a points balance.',
    'Owning shares in the airline I fly feels like a more direct relationship. I invested a small amount to see how they treat owners.',
  ]),
  gc('g5', 'Marcus', '1507003211169-0a1dd7228f2d', '1w', 'Aircraft maintenance technician', 0, [
    'I have worked on the aircraft type they plan to operate for eleven years. The fleet plan is conservative and the maintenance budget looks realistic, which is rare in a pitch.',
  ]),
  gc('g6', 'Elena Ruiz', '1506794778202-cad84cf45f1d', '1w', 'First-time investor', 1, [
    'This is my first investment in a private company. I read the offering documents twice and asked two questions on the discussion page. Both were answered by the founders within a day.',
    'That was enough for me to put in the minimum.',
  ]),
]

/* The three faces at the head of the group post. */
export const STACK = [
  img('1438761681033-6461ffad8d80', 96, 96),
  img('1500648767791-00dcc994a43e', 96, 96),
  img('1472099645785-5658abf4ff4e', 96, 96),
]

export const SPOTS: { name: string; tall: string }[] = [
  ['GigaStar', '1507003211169-0a1dd7228f2d'],
  ['Founder', '1500648767791-00dcc994a43e'],
  ['Founder', '1472099645785-5658abf4ff4e'],
  ['Founder', '1506794778202-cad84cf45f1d'],
  ['Founder', '1438761681033-6461ffad8d80'],
  ['Founder', '1544005313-94ddf0286df2'],
  ['Founder', '1560250097-0b93528c311a'],
].map(([name, id]) => ({ name: name!, tall: img(id!, 320, 420) }))

export const TRENDING = [
  { name: 'First Jet Airways', count: 519, img: img('1436491865332-7a61a109cc05', 96, 96) },
  { name: 'bluShift Aerospace', count: 261, img: img('1517976487492-5750f3195933', 96, 96) },
  { name: 'Monster League Fantasy', count: 71, img: img('1511512578047-dfb367046420', 96, 96) },
]

export const LIVE = [
  { avatar: face('1534528741775-53994a69daeb'), name: 'Sara', verb: 'invested in', company: 'First Jet Airways', time: '5m', quote: '' },
  { avatar: face('1517841905240-472988babdf9'), name: 'Falesia', verb: 'reserved in', company: 'Black Sands, the Anime', time: '11m', quote: '"I am excited about the community doing this together,…' },
  { avatar: face('1539571696357-5a69c17a67c6'), name: 'James', verb: 'reserved in', company: 'Proof Hard Ice Cream', time: '21m', quote: '"This is a great product with great taste and branding!"' },
  { avatar: face('1531427186611-ecfd6d936c79'), name: 'Bert', verb: 'invested in', company: 'Havn', time: '22m', quote: '"I use the product. Read about EMF. This will become extremel…' },
  { avatar: face('1524504388940-b1c1722653e1'), name: 'Jeff', verb: 'invested in', company: 'GigaStar', time: '22m', quote: '' },
]

export const COMPANY_IMG = img('1436491865332-7a61a109cc05', 240, 240)

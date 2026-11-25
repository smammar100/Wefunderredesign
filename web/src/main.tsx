import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import { Feed } from './feed/Feed.jsx'
import { Showcase } from './Showcase.jsx'
import { Wefunder } from './wefunder/Wefunder.jsx'

/* Three pages: the feed dashboard at `/`, the design system at `/design`,
   and the wefunder.com redesign at `/wefunder`. */
const path = location.pathname.replace(/\/$/, '') || '/'
const page = path === '/design' ? 'design' : path === '/wefunder' ? 'wefunder' : 'feed'
document.title = {
  design: 'Tuff Design System',
  wefunder: 'Wefunder · Raise capital from your community',
  feed: 'Feed · Wefunder',
}[page]

createRoot(document.getElementById('root')!).render(
  <StrictMode>{page === 'design' ? <Showcase /> : page === 'wefunder' ? <Wefunder /> : <Feed />}</StrictMode>,
)

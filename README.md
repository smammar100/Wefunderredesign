# Tuff design system

The component kit and tokens from [Tuff](https://github.com/usetuff/tuff), pulled out of the app and set up with a showcase page. The server, the app screens, the tests and the deploy setup have all been removed.

```powershell
pnpm install
pnpm dev        # http://localhost:5180 (feed), /design (showcase), /wefunder (landing)
pnpm typecheck
```

- `web/src/theme.css`: every token, in light and dark, plus the marketing page's `--lp-*` tokens and `.lp-*` motion
- `web/src/ui/kit.tsx`: the components, imported from one place
- `web/src/Showcase.tsx`: every token and component in both themes, at `/design`
- `web/src/feed/`: the Wefunder feed dashboard at `/`, built from screen 8a of the "Feed 2a and 7a" design handoff. `data.ts` holds its content and `Feed.tsx` the screen. Colours come from Tuff tokens, so it follows the dark theme too. Icons are Phosphor (`@phosphor-icons/react`), as in the design.
- `web/src/wefunder/`: a redesign of wefunder.com in this design system, at `/wefunder`. It keeps every section, stat, link, quote and disclosure of the live page. `parts.tsx` holds the ruled-column primitives and `art.tsx` the illustrations, which are drawn from the kit with fictional people and companies.
- `shared-schema/`: the types a few components take (people, agent faces, repeat rules)

Start with [DESIGN.md](DESIGN.md) for the rules on using it.

Licensed AGPL-3.0, same as upstream (see `LICENSE`).

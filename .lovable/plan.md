## Goal
Bring all npm packages to recent versions without breaking the terminal portfolio.

## Approach
Split the update into two waves to avoid breaking the app in one shot.

### Wave 1 — Safe updates (apply now)
Bump everything to the latest within the current major (no breaking changes expected). Covers most Radix UI packages, tanstack-query, lucide-react, react-hook-form, zod 3.x, vite 5.x, vitest 3.x, eslint 9.x, typescript, @types/*, tailwindcss 3.x, etc.

Action: run `bun update` for these, then verify build + a quick smoke test of the terminal (boot, a few commands, matrix rain).

### Wave 2 — Major upgrades (opt-in, riskier)
These require code changes and/or shadcn component rewrites. I list them so you can decide which to take:

| Package | Current | Latest | Risk |
|---|---|---|---|
| react / react-dom | 18.3 | 19.x | Medium — most libs OK, but some Radix/3rd-party peers may warn |
| react-router-dom | 6.30 | 7.x | Medium — API mostly compatible, but data-router changes |
| tailwindcss | 3.4 | 4.x | High — new engine, config format, PostCSS plugin change, shadcn theming needs rewrite |
| vite | 5.4 | 7.x | Medium — Node 20+, plugin API tweaks |
| zod | 3.25 | 4.x | Medium — schema API changes, breaks `@hookform/resolvers` until v5 |
| @hookform/resolvers | 3.10 | 5.x | Needed if zod 4 |
| date-fns | 3.6 | 4.x | Low/Medium — locale import changes |
| sonner | 1.7 | 2.x | Low — minor API tweaks |
| vaul | 0.9 | 1.x | Low |
| next-themes | 0.3 | 0.4 | Low |
| react-day-picker | 8.10 | 9.x | Medium — API rewrite, shadcn `calendar.tsx` rewrite |
| recharts | 2.15 | 3.x | Medium — chart component API tweaks |
| lucide-react | 0.462 | 0.4xx latest | Low — icon names rarely change |
| jsdom | 20 | 25+ | Low (tests only) |
| @types/node | 22 | 24 | Low |
| tailwind-merge | 2 | 3 | Low |
| eslint-plugin-react-hooks | 5.2 | 6.x | Low |

## Recommendation
Do **Wave 1** now (zero risk, brings everything current within major).
For **Wave 2**, I suggest taking only:
- `react` 19, `react-dom` 19, `@types/react*` 19
- `react-router-dom` 7
- `date-fns` 4
- `sonner` 2, `vaul` 1, `next-themes` 0.4
- `lucide-react` latest, `tailwind-merge` 3, `jsdom` 25, `@types/node` 24
- `eslint-plugin-react-hooks` 6

And **defer**: tailwind 4, vite 7, zod 4 (+resolvers 5), react-day-picker 9, recharts 3 — these need bigger rewrites of shadcn components / config and aren't worth the churn for this portfolio right now.

## Verification
After each wave: `bun run build`, load `/`, run terminal commands `help`, `homelab`, `status`, `weather`, check console for errors.

## Confirm
Reply "go" to apply Wave 1 + the recommended Wave 2 subset, or tell me which majors to include/exclude.

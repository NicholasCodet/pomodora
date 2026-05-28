# Pomodora Sanctuary

Pomodora Sanctuary is a SvelteKit + TypeScript focus ritual app with a domain-first architecture.

The current MVP includes:
- Ritual / Workshop / Vault routes
- mobile bottom tab navigation
- ritual timer flow (start/cancel, dev instant completion)
- ritual slots (up to 3 quick-access minerals)
- Workshop buy flow with unlock/affordability states
- Vault split between actionable materials and revealed collection
- persisted global state (including ritual runtime resume behavior)

## Core Loop

1. Buy a mineral in Workshop
2. Select or auto-select an active mineral
3. Complete rituals to add worked minutes
4. Gain Essence from completed ritual minutes
5. Reveal completed minerals into Collection

Essence formula:

```ts
essence = Math.floor(minutes / 10);
```

## Tech Stack

- TypeScript
- SvelteKit
- Svelte 5
- Vite

## Development

```bash
npm install
npm run dev
```

Useful scripts:
- `npm run dev`: start SvelteKit dev server
- `npm run typecheck`: run Svelte + TypeScript checks
- `npm run build`: production build
- `npm run preview`: preview production build locally
- `npm run sandbox`: run domain/app sandbox (`src/index.ts`) in watch mode
- `npm run sandbox:run`: run sandbox once

## Project Structure (High Level)

```txt
src/
  core/              # Domain rules and pure business logic
  data/              # Static materials/artifacts definitions
  lib/
    app/             # Thin app bridge (sanctuary.ts)
    stores/          # Global reactive store + persistence + ritual runtime
    components/      # UI components (shared, ritual, vault)
    design/          # Design tokens
  routes/            # SvelteKit pages/layout
  utils/             # Generic utilities (id/time/storage)
  index.ts           # Domain/app integration sandbox
static/icons/
  sprite.svg         # SVG icon sprite
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for full layer boundaries and responsibilities.

## Architecture Notes

- `src/core` is the source of truth for business behavior.
- UI never re-implements domain rules.
- `src/lib/app/sanctuary.ts` is the boundary between UI/store and core logic.
- `src/lib/stores/sanctuaryStore.ts` owns runtime UI state and persistence wiring.

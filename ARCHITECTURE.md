# Architecture

This project uses a domain-first architecture:
- TypeScript domain engine as source of truth
- SvelteKit UI layer on top through a thin app bridge

## Structure

```txt
svelte.config.js
vite.config.ts
src/
  core/
    models.ts
    constants.ts
    state.ts
    progression.ts
    rng.ts
    purchase.ts
    ritual.ts
    reveal.ts
    selection.ts
    shop.ts
    summary.ts
    use-cases.ts
    logic.ts
  data/
    materials.ts
    artifacts.ts
  lib/
    app/
      sanctuary.ts
    components/
      ShopMaterialTable.svelte
    stores/
  utils/
    id.ts
    time.ts
    storage.ts
  routes/
    +page.ts
    +page.svelte
  index.ts
```

## Core Layer (`src/core`)

- `models.ts`: domain types and interfaces only (no runtime logic).
- `constants.ts`: shared domain constants (economy, unlock thresholds, storage key).
- `state.ts`: initial state factories.
- `progression.ts`: progression validation and stage/unlock read helpers.
- `rng.ts`: deterministic/random selection helpers.
- `purchase.ts`: buy mineral flow and purchase validation.
- `ritual.ts`: completed ritual application and essence reward rule.
- `reveal.ts`: artifact reveal flow when mineral is complete.
- `selection.ts`: selected mineral action and read helper.
- `shop.ts`: read-only shop material states.
- `summary.ts`: read-only player progression summary snapshot.
- `use-cases.ts`: thin application layer that composes domain actions for user-intent flows.
- `logic.ts`: barrel re-export for stable imports (`./core/logic`).

Core stays framework-agnostic and owns business rules.

## App Bridge (`src/lib/app`)

- `sanctuary.ts`: UI-facing application boundary.
- It composes domain/data/util functions for SvelteKit routes/components.
- It must stay thin and never duplicate business rules.

## UI Layer (`src/routes`, `src/lib/components`)

- Routes and components render data and handle interaction concerns.
- UI reads/dispatches through `src/lib/app/sanctuary.ts`.
- Domain rules remain in `src/core`.

## Data Layer (`src/data`)

- `materials.ts`: static material definitions.
- `artifacts.ts`: static artifact definitions.

Data files contain content, not behavior.

## Utilities (`src/utils`)

- `id.ts`: local ID helper.
- `time.ts`: generic time conversions and timestamp helper.
- `storage.ts`: serialization/deserialization and runtime validation for persisted `GameState`.

Utilities must stay generic and avoid game rules.

## Sandbox (`src/index.ts`)

`index.ts` is an integration sandbox.  
It orchestrates scenarios and logs behavior, but does not define domain rules.

## Boundaries

- Domain actions mutate state immutably and return `{ ok: true | false }` results.
- Domain read helpers never mutate state.
- Use-case functions compose domain actions for user-intent flows.
- UI must consume domain through the app bridge, not by re-implementing rules.

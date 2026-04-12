# Architecture

This project is currently a TypeScript-only domain engine.  
There is no UI framework in this phase.

## Structure

```txt
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
  utils/
    id.ts
    time.ts
    storage.ts
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
- UI concerns are intentionally out of scope in this phase.

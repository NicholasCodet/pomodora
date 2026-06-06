# Architecture

Pomodora Sanctuary uses a domain-first architecture:
- `src/core` is the source of truth for business rules.
- SvelteKit UI consumes domain behavior through a thin app bridge.
- UI state/persistence lives in a global store layer, not in route components.

## Current Structure

```txt
static/
  icons/
    sprite.svg
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
    slots.ts
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
    stores/
      sanctuaryStore.ts
    design/
      tokens.css
    assets/
      materialAssets.ts
      artifactAssets.ts
      materials/
      artifacts/
      icons/
    components/
      Button.svelte
      Icon.svelte
      materials/
        MaterialPreviewCard.svelte
      ritual/
        MineralMediaPanel.svelte
        RitualCountdown.svelte
        RitualDurationPicker.svelte
        RitualMineralHero.svelte
        RitualSlotsPanel.svelte
      vault/
        VaultViewSwitch.svelte
        VaultMaterialsPanel.svelte
        VaultCollectionPanel.svelte
  routes/
    +layout.svelte
    +page.ts
    ritual/+page.svelte
    workshop/+page.svelte
    vault/+page.svelte
  utils/
    id.ts
    time.ts
    storage.ts
  index.ts
```

## Layer Responsibilities

### `src/core` (Domain)
- Pure domain actions and read helpers.
- Game rules: purchase, selection, ritual completion, reveal, unlocks, slots.
- Framework-agnostic and immutable result pattern (`ok: true | false`).

### `src/lib/app/sanctuary.ts` (App Bridge)
- UI-facing API for routes/components/stores.
- Composes core + data + utils.
- Must stay thin and never duplicate domain rules.

### `src/lib/stores/sanctuaryStore.ts` (UI State + Runtime)
- Single reactive UI state source.
- Handles persistence hydration/saving via `localStorage`.
- Owns ritual runtime state (`isRunning`, duration, `endTimestamp`) and timer ticking.
- Calls the app bridge for all business actions.

### `src/routes` and `src/lib/components` (Presentation)
- Route structure:
  - `/ritual`: timer flow, selected mineral progress, reveal.
  - `/workshop`: mineral acquisition with availability states.
  - `/vault`: materials management and collection view.
- `+layout.svelte` provides shared shell, compact summary, and mobile bottom tab navigation.
- Components are mostly presentational and should not contain domain logic.

### `src/data`
- Static game content (`materials`, `artifacts`).

### `src/utils`
- Generic technical helpers (`id`, `time`, `storage`).

### Icons
- Functional icons come from a single SVG sprite: `static/icons/sprite.svg`.
- `Icon.svelte` references symbols (`/icons/sprite.svg#icon-*`) with decorative defaults.

### Asset Strategy
- Functional UI icons use `static/icons/sprite.svg`.
- Material and artifact media are presentation assets, not gameplay definitions.
- Material visual assets live in `src/lib/assets/materials/`.
- Artifact visual assets live in `src/lib/assets/artifacts/`.
- Asset registries live in `src/lib/assets/materialAssets.ts` and `src/lib/assets/artifactAssets.ts`.
- Material illustrations may use AVIF, WebP, or PNG.
- Future 3D models should use GLB and be referenced through the same registry pattern.
- Current wired gameplay material visuals: Clay, Limestone, Marble.
- Extra files may exist in asset folders for future candidates, but they must not appear in the app until the material is added to `MaterialType`, `src/data/materials.ts`, and the relevant domain/data flow.

### Object vs Display Support
- Mineral object assets should represent the material/object itself.
- Pedestals, steles, stands, bases, and scene supports should stay separate future UI/scene assets.
- Keeping objects and supports separate makes the same material asset reusable in Workshop, Ritual, Vault, and future 3D scenes.

### Adding a New Playable Material
Adding a material is a gameplay/content change, not just an asset wiring change. A material must be added deliberately across domain types, static data, assets, progression, unlocks, and validation.

Required updates:
- Add the new key to `MaterialType` in `src/core/models.ts`.
- Add a full `MaterialDefinition` in `src/data/materials.ts` with cost, stage count, cumulative thresholds, presentation metadata, and `possibleArtifactIds`.
- Add matching artifact definitions in `src/data/artifacts.ts` before referencing their IDs from the material.
- Wire supported visual assets in `src/lib/assets/materialAssets.ts`.
- Review progression thresholds and unlock behavior in `src/core/progression.ts`.
- Review purchase validation and shop behavior through existing domain/app helpers.
- Check persistence validation in `src/utils/storage.ts` if saved-state shape or accepted material values change.
- Add or update sandbox scenarios in `src/index.ts` for purchase, progression, reveal, and unlock edge cases.
- Update documentation when the material becomes part of gameplay.

Do not:
- Add a material to UI lists only.
- Wire an image asset and treat it as playable content.
- Reference artifact IDs that are not defined.
- Add future asset-folder candidates to gameplay until the domain/data changes above are complete.

### Sandbox
- `src/index.ts` remains an integration sandbox for domain/app checks outside UI.

### Boundary Rules
- Do not move business rules into Svelte components.
- UI/store/app layers orchestrate; `src/core` decides game behavior.

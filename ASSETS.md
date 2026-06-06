# Asset Guidelines

Pomodora Sanctuary keeps visual assets separate from gameplay data. An image file can support a future material or artifact, but it does not make that item playable until the domain and static data are updated.

## Asset Generation Rules

Use these shared rules for material and artifact object assets:

- Render one object only.
- No pedestal, base, display stand, stele, shelf, environment, UI, text, or labels.
- Center the object in a square composition.
- Keep the object around 70% of the frame.
- Prefer a transparent background.
- Use soft studio lighting.
- Use a three-quarter view.
- Use a stylized 3D prop direction with hand-painted or painterly texture.
- Keep the silhouette readable at small mobile UI sizes.
- Avoid photorealism, cartoon outlines, voxel style, low-poly style, and photography.

Object assets should represent only the object. Pedestals, stands, supports, shelves, and scene elements should be separate future UI or scene assets so the same object can be reused in Workshop, Ritual, Vault, Collection, and future 3D scenes.

## Material Asset Prompt Pattern

Use one shared master prompt for all material visuals. Replace only the `MINERAL DESCRIPTION` block.

Each material description should define its own shape language. Avoid generic square rock blocks unless the material intentionally calls for that form.

Examples:

- Clay can be block-like, soft-edged, earthy, and handmade.
- Obsidian can be shard-like, sharp, glossy, and fractured.
- Geode can be a cracked outer shell with a visible crystal cavity.

Template:

```txt
Create a single stylized 3D material object for a mobile focus ritual app.

Art direction:
- calm, symbolic, premium mobile UI prop
- hand-painted / painterly texture
- soft studio lighting
- three-quarter view
- readable at small UI sizes

Composition:
- one object only
- centered square composition
- object fills about 70% of the frame
- transparent background preferred
- no pedestal, base, display stand, stele, shelf, environment, UI, text, or labels

MINERAL DESCRIPTION:
[Describe the material shape language, surface, color, wear, and identifying features.]

Avoid:
- photorealism
- cartoon outlines
- voxel or low-poly style
- photography
- generic rock shape unless intentional
```

## Artifact Asset Prompt Pattern

Use one shared master prompt for artifact visuals. Replace only the `ARTIFACT DESCRIPTION` block.

The artifact description should define:

- object type
- silhouette
- material appearance
- wear or age details
- emotional/product role

Example direction for `clay-common-urn`:

- small ancient clay urn
- rounded vessel silhouette
- warm earthen ceramic surface
- subtle age marks and ritual wear
- calm reward object for Collection inspection

Template:

```txt
Create a single stylized 3D artifact object for a mobile focus ritual app.

Art direction:
- calm, symbolic, collectible artifact
- hand-painted / painterly texture
- soft studio lighting
- three-quarter view
- readable at small UI sizes

Composition:
- one object only
- centered square composition
- object fills about 70% of the frame
- transparent background preferred
- no pedestal, base, display stand, stele, shelf, environment, UI, text, or labels

ARTIFACT DESCRIPTION:
[Describe the object type, silhouette, material, age/wear, and emotional role.]

Avoid:
- photorealism
- cartoon outlines
- voxel or low-poly style
- photography
- unrelated props or environmental context
```

## Export And Naming Rules

- Material assets should be named after material IDs, for example `clay.avif`.
- Artifact assets should be named after artifact IDs, for example `clay-common-urn.png`.
- AVIF is the preferred active format when available.
- PNG and WebP can exist as alternate or source exports.
- Material visuals live in `src/lib/assets/materials/`.
- Artifact visuals live in `src/lib/assets/artifacts/`.
- Assets are wired through registries:
  - `src/lib/assets/materialAssets.ts`
  - `src/lib/assets/artifactAssets.ts`
- Do not import gameplay assets directly in routes or feature components.
- Future assets may exist in asset folders, but they must remain unused until the matching material or artifact exists in domain/data and is intentionally wired.

## Current Status

- Active material visuals are wired for Clay, Limestone, and Marble.
- The first artifact visual is wired for `clay-common-urn`.
- Other artifact visuals currently use Collection placeholders.
- `/dev/assets` is the internal development route for reviewing active and future visual assets.

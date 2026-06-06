<script lang="ts">
  import type { MaterialType } from '../../../core/models';
  import { getMaterialAsset } from '$lib/assets/materialAssets';

  export let materialType: MaterialType;
  export let materialName: string;
  export let visualThemeHint: string | null = null;

  $: materialAsset = getMaterialAsset(materialType);
  $: previewImage = materialAsset.illustration ?? materialAsset.thumbnail;
  $: hasModel3d = materialAsset.model3d !== null;
</script>

<section aria-labelledby="mineral-media-heading" class="media-panel">
  <h3 id="mineral-media-heading">Mineral Visual Surface</h3>
  {#if previewImage}
    <img class="media-preview-image" src={previewImage} alt={`${materialName} mineral visual preview`} />
    {#if hasModel3d}
      <p class="media-theme-hint">3D model available for future viewer integration.</p>
    {/if}
  {:else}
    <p class="media-placeholder-label">Visual Placeholder</p>
    <p class="media-note">
      Future update: this area will host mineral artwork, SVG, image assets, or 3D presentation.
    </p>
    {#if hasModel3d}
      <p class="media-theme-hint">3D model available for future viewer integration.</p>
    {:else if visualThemeHint}
      <p class="media-theme-hint">Theme hint: {visualThemeHint} ({materialName})</p>
    {/if}
  {/if}
</section>

<style>
  h3,
  p {
    margin: 0;
  }

  .media-panel {
    border: 1px dashed var(--color-border);
    border-radius: var(--surface-radius-sm);
    padding: var(--surface-padding-sm);
    background: var(--color-surface);
    display: grid;
    gap: var(--space-1);
  }

  .media-placeholder-label {
    font-weight: 700;
    font-size: 0.92rem;
  }

  .media-note,
  .media-theme-hint {
    color: var(--color-muted-text);
    font-size: 0.9rem;
  }

  .media-preview-image {
    width: 100%;
    border-radius: var(--surface-radius-sm);
    object-fit: cover;
  }
</style>

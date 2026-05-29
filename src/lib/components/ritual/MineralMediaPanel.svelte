<script lang="ts">
  export let materialName: string;
  export let visualThemeHint: string | null = null;
</script>

<section aria-labelledby="mineral-media-heading" class="media-panel">
  <h3 id="mineral-media-heading">Mineral Visual Surface</h3>
  <p class="media-placeholder-label">Visual Placeholder</p>
  <p class="media-note">
    Future update: this area will host mineral artwork, SVG, image assets, or 3D presentation.
  </p>
  {#if visualThemeHint}
    <p class="media-theme-hint">Theme hint: {visualThemeHint} ({materialName})</p>
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
</style>

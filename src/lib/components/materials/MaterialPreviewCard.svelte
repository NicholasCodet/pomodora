<script lang="ts">
  export let displayName: string;
  export let shortDescription: string;
  export let artifactFamily: string | null = null;
  export let visualThemeHint: string | null = null;
</script>

<section aria-label={`${displayName} preview`} class="material-preview-card">
  <header class="preview-header">
    <h3>{displayName}</h3>
    <p class="preview-description">{shortDescription}</p>
  </header>

  {#if artifactFamily}
    <p class="preview-family">Family: {artifactFamily}</p>
  {/if}

  <section class="preview-media-placeholder" aria-label="Future material visual area">
    <p class="placeholder-title">Material Visual Placeholder</p>
    <p class="placeholder-note">
      Reserved for future SVG, image, or 3D presentation.
    </p>
    {#if visualThemeHint}
      <p class="placeholder-hint">Theme hint: {visualThemeHint}</p>
    {/if}
  </section>
</section>

<style>
  h3,
  p {
    margin: 0;
  }

  .material-preview-card {
    display: grid;
    gap: var(--surface-gap-sm);
  }

  .preview-header {
    display: grid;
    gap: 0.2rem;
  }

  .preview-description,
  .preview-family {
    color: var(--color-muted-text);
    font-size: 0.92rem;
  }

  .preview-media-placeholder {
    border: 1px dashed var(--color-border);
    border-radius: var(--surface-radius-sm);
    padding: var(--surface-padding-sm);
    background: var(--color-surface);
    display: grid;
    gap: var(--space-1);
  }

  .placeholder-title {
    font-size: 0.88rem;
    font-weight: 700;
  }

  .placeholder-note,
  .placeholder-hint {
    color: var(--color-muted-text);
    font-size: 0.85rem;
  }
</style>

<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  function getStatusLabel(status: PageData['assets'][number]['status']): string {
    return status === 'active' ? 'Active gameplay' : 'Future asset';
  }

  function formatLabel(value: string): string {
    return value.replaceAll('-', ' ');
  }
</script>

<svelte:head>
  <title>Asset Preview | Pomodora Sanctuary</title>
</svelte:head>

<section aria-labelledby="asset-preview-heading" class="panel asset-preview-panel">
  <header class="page-header">
    <p class="eyebrow">Development only</p>
    <h1 id="asset-preview-heading">Material Asset Preview</h1>
    <p class="section-intro">
      Internal QA surface for active and future material visuals. Future assets shown here are not
      playable materials until they are added to the domain model and data definitions.
    </p>
  </header>

  <div class="asset-summary" aria-label="Asset preview summary">
    <p><strong>{data.assets.length}</strong> material visuals loaded for review.</p>
    <p>
      Active assets are wired through the material registry. Future assets are file-only candidates.
    </p>
  </div>

  <div class="asset-grid">
    {#each data.assets as asset}
      <article class={`asset-card status-${asset.status}`}>
        <div class="asset-media">
          <img src={asset.image} alt={`${asset.label} material visual preview`} loading="lazy" />
        </div>

        <div class="asset-content">
          <div class="asset-title-row">
            <h2>{asset.label}</h2>
            <div class="badge-group" aria-label={`${asset.label} asset status`}>
              <span class="status-badge">{getStatusLabel(asset.status)}</span>
              <span class={`qa-badge qa-${asset.qaStatus}`}>{formatLabel(asset.qaStatus)}</span>
            </div>
          </div>

          <dl class="asset-meta">
            <div>
              <dt>Role</dt>
              <dd>{formatLabel(asset.role)}</dd>
            </div>
            <div>
              <dt>File</dt>
              <dd><code>{asset.fileName}</code></dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>{asset.format.toUpperCase()}</dd>
            </div>
            <div>
              <dt>Asset ID</dt>
              <dd><code>{asset.id}</code></dd>
            </div>
          </dl>

          {#if asset.note}
            <p class="asset-note">{asset.note}</p>
          {/if}
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  .asset-preview-panel {
    display: grid;
    gap: var(--surface-gap-md);
  }

  .page-header,
  .asset-content {
    display: grid;
    gap: var(--space-1);
  }

  .eyebrow {
    margin: 0;
    color: var(--color-muted-text);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h1,
  h2,
  p {
    margin: 0;
  }

  h1 {
    font-size: clamp(1.6rem, 8vw, 2.4rem);
    line-height: 1.05;
  }

  h2 {
    font-size: 1rem;
    line-height: 1.2;
  }

  .section-intro,
  .asset-note,
  .asset-summary {
    color: var(--color-muted-text);
    line-height: 1.5;
  }

  .asset-summary {
    display: grid;
    gap: var(--space-1);
    border: var(--surface-border);
    border-radius: var(--surface-radius-md);
    background: var(--color-surface);
    padding: var(--surface-padding-md);
  }

  .asset-grid {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  }

  .asset-card {
    display: grid;
    gap: var(--space-2);
    border: var(--surface-border);
    border-radius: var(--surface-radius-md);
    background: var(--color-surface);
    padding: var(--surface-padding-md);
  }

  .status-active {
    border-color: color-mix(in srgb, var(--color-primary) 45%, var(--color-border));
  }

  .asset-media {
    min-height: 12rem;
    aspect-ratio: 5 / 4;
    display: grid;
    place-items: center;
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    background: linear-gradient(180deg, #ffffff 0%, #eef2f7 100%);
    padding: var(--space-3);
    box-sizing: border-box;
    overflow: hidden;
  }

  .asset-media img {
    display: block;
    width: auto;
    height: auto;
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  }

  .asset-title-row {
    display: grid;
    gap: var(--space-1);
  }

  .badge-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .status-badge,
  .qa-badge {
    display: inline-flex;
    width: fit-content;
    border-radius: var(--chip-radius);
    background: var(--color-secondary);
    color: var(--color-text);
    padding: var(--chip-padding-y) var(--chip-padding-x);
    font-size: var(--chip-font-size);
    font-weight: var(--chip-font-weight);
  }

  .status-active .status-badge {
    background: var(--color-primary);
    color: #ffffff;
  }

  .qa-ready {
    border: 1px solid color-mix(in srgb, var(--color-primary) 45%, var(--color-border));
    background: #ecfdf5;
    color: #065f46;
  }

  .qa-review {
    border: 1px solid #fbbf24;
    background: #fffbeb;
    color: #92400e;
  }

  .qa-placeholder {
    border: 1px dashed var(--color-border);
    background: var(--color-background);
    color: var(--color-muted-text);
  }

  .asset-meta {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .asset-meta div {
    min-width: 0;
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    background: var(--color-background);
    padding: var(--space-1);
  }

  dt {
    color: var(--color-muted-text);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  dd {
    margin: 0.2rem 0 0;
    font-size: 0.82rem;
    font-weight: 700;
    line-height: 1.3;
    overflow-wrap: anywhere;
    text-transform: capitalize;
  }

  code {
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 0.85em;
    text-transform: none;
  }
</style>

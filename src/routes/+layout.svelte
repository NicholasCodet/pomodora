<script lang="ts">
  import { dev } from '$app/environment';
  import { page } from '$app/stores';
  import Icon from '$lib/components/Icon.svelte';
  import { getSelectedMineral } from '$lib/app/sanctuary';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';
  import '$lib/design/tokens.css';

  $: selectedMineral = getSelectedMineral($sanctuaryStore);
  $: currentTab = getCurrentTab($page.url.pathname);
  $: isAssetPreviewActive = $page.url.pathname.startsWith('/dev/assets');

  function getCurrentTab(pathname: string): 'ritual' | 'workshop' | 'vault' | null {
    if (pathname.startsWith('/ritual')) {
      return 'ritual';
    }

    if (pathname.startsWith('/workshop')) {
      return 'workshop';
    }

    if (pathname.startsWith('/vault')) {
      return 'vault';
    }

    return null;
  }

  function formatMineralLabel(mineralId: string): string {
    if (mineralId.length <= 12) {
      return mineralId;
    }

    return `${mineralId.slice(0, 12)}...`;
  }
</script>

<div class="app-shell">
  <header class="app-header">
    <div class="header-top">
      <div class="brand-block">
        <p class="brand-kicker">Focus Ritual Sanctuary</p>
        <p class="brand">Pomodora Sanctuary</p>
      </div>

      {#if dev}
        <nav aria-label="Development tools" class="dev-tools-nav">
          <a href="/dev/assets" aria-current={isAssetPreviewActive ? 'page' : undefined}>
            Asset preview
          </a>
        </nav>
      {/if}
    </div>

    <section aria-labelledby="summary-heading" class="summary-section">
      <h2 id="summary-heading" class="sr-only">Sanctuary Summary</h2>
      <dl class="compact-summary">
        <div class="summary-item summary-essence">
          <dt><span class="label-with-icon"><Icon name="essence" size={14} />Essence</span></dt>
          <dd>{$sanctuaryStore.player.essence}</dd>
        </div>
        <div class="summary-item summary-selected">
          <dt>Selected Mineral</dt>
          <dd>{selectedMineral ? formatMineralLabel(selectedMineral.id) : 'none'}</dd>
        </div>
        <div class="summary-item summary-collection">
          <dt><span class="label-with-icon"><Icon name="collection" size={14} />Collection</span></dt>
          <dd>{$sanctuaryStore.collection.length}</dd>
        </div>
      </dl>
    </section>

  </header>

  <main class="page-content">
    <slot />
  </main>
</div>

<nav aria-label="Primary" class="bottom-tab-nav">
  <ul class="tab-list">
    <li>
      <a href="/ritual" aria-current={currentTab === 'ritual' ? 'page' : undefined}>
        <span class="tab-label"><Icon name="ritual" size={18} />Ritual</span>
      </a>
    </li>
    <li>
      <a href="/workshop" aria-current={currentTab === 'workshop' ? 'page' : undefined}>
        <span class="tab-label"><Icon name="workshop" size={18} />Workshop</span>
      </a>
    </li>
    <li>
      <a href="/vault" aria-current={currentTab === 'vault' ? 'page' : undefined}>
        <span class="tab-label"><Icon name="vault" size={18} />Vault</span>
      </a>
    </li>
  </ul>
</nav>

<style>
  :global(:root) {
    --bottom-tab-min-height: 3rem;
    --bottom-tab-reserved-space: 6rem;
  }

  :global(body) {
    margin: 0;
    font-family: 'Atkinson Hyperlegible', 'Segoe UI', sans-serif;
    background: var(--color-background);
    color: var(--color-text);
  }

  .app-shell {
    margin: 0 auto;
    max-width: 72rem;
    padding: var(--surface-padding-sm);
    display: grid;
    gap: var(--surface-gap-sm);
  }

  .app-header {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border: var(--surface-border);
    border-radius: var(--surface-radius-md);
    padding: var(--surface-padding-sm);
    display: grid;
    gap: var(--surface-gap-sm);
  }

  .brand-block {
    display: grid;
    gap: 0.2rem;
  }

  .header-top {
    display: flex;
    gap: var(--space-2);
    align-items: flex-start;
    justify-content: space-between;
  }

  .brand-kicker {
    margin: 0;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: var(--color-muted-text);
  }

  .brand {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
  }

  .dev-tools-nav a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 1.8rem;
    border: 1px dashed var(--color-border);
    border-radius: var(--chip-radius);
    padding: 0.2rem 0.65rem;
    color: var(--color-muted-text);
    background: var(--color-background);
    font-size: 0.75rem;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
  }

  .dev-tools-nav a[aria-current='page'] {
    border-style: solid;
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .dev-tools-nav a:focus-visible {
    outline: 3px solid var(--color-primary-hover);
    outline-offset: 2px;
  }

  .summary-section {
    display: grid;
    gap: var(--space-1);
  }

  .compact-summary {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-item {
    background: var(--color-background);
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    padding: var(--space-1) var(--space-2);
  }

  .summary-selected {
    grid-column: 1 / -1;
  }

  dt {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--color-muted-text);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .label-with-icon,
  .tab-label {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .tab-label {
    justify-content: center;
    flex-direction: column;
    gap: 0.2rem;
  }

  .label-with-icon :global(svg),
  .tab-label :global(svg) {
    flex-shrink: 0;
  }

  dd {
    margin: 0.2rem 0 0;
    font-size: 0.92rem;
    font-weight: 600;
  }

  .bottom-tab-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
    padding: var(--space-1) var(--space-2) calc(var(--space-1) + env(safe-area-inset-bottom));
  }

  .tab-list {
    margin: 0 auto;
    max-width: 72rem;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tab-list a {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    text-decoration: none;
    color: var(--color-text);
    background: var(--color-secondary);
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    padding: 0.5rem var(--space-2);
    min-height: var(--bottom-tab-min-height);
    font-weight: 600;
    line-height: 1.2;
  }

  .tab-list a[aria-current='page'] {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #ffffff;
    font-weight: 700;
  }

  .tab-list a:focus-visible {
    outline: 3px solid var(--color-primary-hover);
    outline-offset: 2px;
  }

  .page-content {
    display: grid;
    gap: var(--space-2);
    padding-bottom: calc(var(--bottom-tab-reserved-space) + env(safe-area-inset-bottom));
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (min-width: 40rem) {
    .app-shell {
      padding: var(--space-3);
      gap: var(--space-3);
    }

    .app-header {
      padding: var(--space-3);
      gap: var(--space-3);
    }

    .compact-summary {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-2);
    }

    .summary-selected {
      grid-column: auto;
    }

    .page-content {
      gap: var(--space-3);
      padding-bottom: calc(var(--bottom-tab-reserved-space) + env(safe-area-inset-bottom));
    }
  }
</style>

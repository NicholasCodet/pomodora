<script lang="ts">
  import { page } from '$app/stores';
  import { getSelectedMineral } from '$lib/app/sanctuary';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';
  import '$lib/design/tokens.css';

  $: selectedMineral = getSelectedMineral($sanctuaryStore);
  $: currentTab = getCurrentTab($page.url.pathname);

  function getCurrentTab(pathname: string): 'ritual' | 'workshop' | 'vault' {
    if (pathname.startsWith('/workshop')) {
      return 'workshop';
    }

    if (pathname.startsWith('/vault')) {
      return 'vault';
    }

    return 'ritual';
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
    <div class="brand-block">
      <p class="brand-kicker">Focus Ritual Sanctuary</p>
      <p class="brand">Pomodora Sanctuary</p>
    </div>

    <section aria-labelledby="summary-heading" class="summary-section">
      <h2 id="summary-heading" class="sr-only">Sanctuary Summary</h2>
      <dl class="compact-summary">
        <div class="summary-item summary-essence">
          <dt>Essence</dt>
          <dd>{$sanctuaryStore.player.essence}</dd>
        </div>
        <div class="summary-item summary-selected">
          <dt>Selected Mineral</dt>
          <dd>{selectedMineral ? formatMineralLabel(selectedMineral.id) : 'none'}</dd>
        </div>
        <div class="summary-item summary-collection">
          <dt>Collection</dt>
          <dd>{$sanctuaryStore.collection.length}</dd>
        </div>
      </dl>
    </section>

    <nav aria-label="Primary" class="primary-nav">
      <ul class="tab-list">
        <li>
          <a href="/ritual" aria-current={currentTab === 'ritual' ? 'page' : undefined}>
            Ritual{#if currentTab === 'ritual'} (current){/if}
          </a>
        </li>
        <li>
          <a href="/workshop" aria-current={currentTab === 'workshop' ? 'page' : undefined}>
            Workshop{#if currentTab === 'workshop'} (current){/if}
          </a>
        </li>
        <li>
          <a href="/vault" aria-current={currentTab === 'vault' ? 'page' : undefined}>
            Vault{#if currentTab === 'vault'} (current){/if}
          </a>
        </li>
      </ul>
    </nav>
  </header>

  <main class="page-content">
    <slot />
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Atkinson Hyperlegible', 'Segoe UI', sans-serif;
    background: var(--color-background);
    color: var(--color-text);
  }

  .app-shell {
    margin: 0 auto;
    max-width: 72rem;
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
  }

  .app-header {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
  }

  .brand-block {
    display: grid;
    gap: 0.2rem;
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
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
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

  dd {
    margin: 0.2rem 0 0;
    font-size: 0.92rem;
    font-weight: 600;
  }

  .primary-nav {
    margin-top: var(--space-1);
  }

  .tab-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tab-list a {
    display: block;
    text-align: center;
    text-decoration: none;
    color: var(--color-text);
    background: var(--color-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0.6rem var(--space-2);
    font-weight: 600;
    line-height: 1.2;
  }

  .tab-list a[aria-current='page'] {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #ffffff;
  }

  .tab-list a:focus-visible {
    outline: 3px solid var(--color-primary-hover);
    outline-offset: 2px;
  }

  .page-content {
    display: grid;
    gap: var(--space-2);
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
    }
  }
</style>

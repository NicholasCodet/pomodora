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
    <p class="brand">Pomodora Sanctuary</p>

    <dl class="compact-summary">
      <div>
        <dt>Essence</dt>
        <dd>{$sanctuaryStore.player.essence}</dd>
      </div>
      <div>
        <dt>Selected Mineral</dt>
        <dd>{selectedMineral ? formatMineralLabel(selectedMineral.id) : 'none'}</dd>
      </div>
      <div>
        <dt>Collection</dt>
        <dd>{$sanctuaryStore.collection.length}</dd>
      </div>
    </dl>

    <nav aria-label="Primary">
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
    padding: var(--space-3);
    display: grid;
    gap: var(--space-3);
  }

  .app-header {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    display: grid;
    gap: var(--space-2);
  }

  .brand {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
  }

  .compact-summary {
    margin: 0;
    display: grid;
    gap: var(--space-2);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .compact-summary div {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-1) var(--space-2);
  }

  dt {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-muted-text);
  }

  dd {
    margin: 0.25rem 0 0;
    font-size: 0.95rem;
    font-weight: 600;
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
    padding: var(--space-1) var(--space-2);
    font-weight: 600;
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
    gap: var(--space-3);
  }
</style>

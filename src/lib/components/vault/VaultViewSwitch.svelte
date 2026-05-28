<script lang="ts">
  import Button from '$lib/components/Button.svelte';

  export let view: 'materials' | 'collection';
  export let onChangeView: (view: 'materials' | 'collection') => void;
</script>

<section aria-labelledby="vault-view-heading" class="switch-panel">
  <h2 id="vault-view-heading">View</h2>
  <div class="vault-switch" role="group" aria-label="Vault view">
    <Button
      variant={view === 'materials' ? 'primary' : 'secondary'}
      on:click={() => onChangeView('materials')}
    >
      Materials{#if view === 'materials'} (current){/if}
    </Button>
    <Button
      variant={view === 'collection' ? 'primary' : 'secondary'}
      on:click={() => onChangeView('collection')}
    >
      Collection{#if view === 'collection'} (current){/if}
    </Button>
  </div>

  {#if view === 'materials'}
    <p class="view-intro">Operational view: choose the active mineral and manage Ritual Slots.</p>
  {:else}
    <p class="view-intro">Showcase view: review discovered artifacts grouped by rarity.</p>
  {/if}
</section>

<style>
  h2 {
    margin: 0;
    line-height: 1.2;
  }

  p {
    margin: 0;
  }

  .switch-panel {
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    background: var(--color-background);
    padding: var(--surface-padding-sm);
    display: grid;
    gap: var(--surface-gap-sm);
  }

  .vault-switch {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .view-intro {
    font-size: 0.92rem;
    color: var(--color-muted-text);
  }
</style>

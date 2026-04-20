<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { getShopMaterialStates } from '$lib/app/sanctuary';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';

  let lastActionMessage = '';

  $: shopMaterials = getShopMaterialStates($sanctuaryStore);
  $: currentEssence = $sanctuaryStore.player.essence;

  function getShopStateLabel(material: (typeof shopMaterials)[number]): string {
    if (material.canPurchase) {
      return 'Available';
    }

    if (material.blockedReason === 'material_locked') {
      return 'Locked';
    }

    if (material.blockedReason === 'insufficient_essence') {
      return 'Insufficient Essence';
    }

    return 'Unavailable';
  }

  function getShopStateHint(material: (typeof shopMaterials)[number]): string {
    if (material.canPurchase) {
      return 'Ready to buy now.';
    }

    if (material.blockedReason === 'material_locked') {
      return 'Progress further to unlock this material.';
    }

    if (material.blockedReason === 'insufficient_essence') {
      const missingEssence = Math.max(0, material.cost - currentEssence);
      return `Need ${missingEssence} more Essence.`;
    }

    return 'This material is not purchasable right now.';
  }

  function getStatusClass(material: (typeof shopMaterials)[number]): string {
    if (material.canPurchase) {
      return 'status-available';
    }

    if (material.blockedReason === 'material_locked') {
      return 'status-locked';
    }

    return 'status-blocked';
  }

  function handleBuyMaterial(materialType: (typeof shopMaterials)[number]['type']): void {
    const result = sanctuaryStore.buyMineral(materialType);
    lastActionMessage = result.ok
      ? `Bought and selected ${result.material.name}.`
      : `Buy failed: ${formatFailureReason(result.reason)}.`;
  }

  function formatFailureReason(reason: string): string {
    return reason.replaceAll('_', ' ');
  }
</script>

<svelte:head>
  <title>Workshop | Pomodora Sanctuary</title>
</svelte:head>

<section aria-labelledby="workshop-heading" class="panel workshop-panel">
  <header>
    <h1 id="workshop-heading">Workshop</h1>
    <p class="section-intro">Buy minerals that are unlocked and affordable.</p>
  </header>

  <section aria-labelledby="materials-heading" class="materials-panel">
    <h2 id="materials-heading">Available Materials</h2>

    <ul class="material-list">
      {#each shopMaterials as material}
        <li>
          <article class="material-card">
            <header class="material-header">
              <h3>{material.name}</h3>
              <p class="material-cost">Cost: {material.cost} Essence</p>
            </header>

            <p class="material-state">
              <span class={`state-badge ${getStatusClass(material)}`}>{getShopStateLabel(material)}</span>
              <span class="state-hint">{getShopStateHint(material)}</span>
            </p>

            <Button
              variant={material.canPurchase ? 'primary' : 'secondary'}
              disabled={!material.canPurchase}
              on:click={() => handleBuyMaterial(material.type)}
            >
              Buy
            </Button>
          </article>
        </li>
      {/each}
    </ul>
  </section>

  <section aria-labelledby="last-action-heading" class="last-action-panel">
    <h2 id="last-action-heading">Last Action</h2>
    <p>{lastActionMessage || 'No action yet.'}</p>
  </section>
</section>

<style>
  .panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
  }

  .workshop-panel {
    display: grid;
    gap: var(--space-3);
  }

  h1,
  h2,
  h3 {
    margin: 0;
    line-height: 1.2;
  }

  p {
    margin: 0;
  }

  .section-intro,
  .state-hint {
    color: var(--color-muted-text);
  }

  .materials-panel,
  .last-action-panel {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-background);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
  }

  .material-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-2);
  }

  .material-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
  }

  .material-header {
    display: grid;
    gap: 0.25rem;
  }

  .material-cost {
    font-weight: 600;
  }

  .material-state {
    display: grid;
    gap: 0.35rem;
  }

  .state-badge {
    display: inline-block;
    width: fit-content;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    padding: 0.15rem 0.6rem;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .status-available {
    background: #d1fae5;
    border-color: #6ee7b7;
    color: #065f46;
  }

  .status-locked {
    background: #e5e7eb;
    border-color: #9ca3af;
    color: #374151;
  }

  .status-blocked {
    background: #fef3c7;
    border-color: #f59e0b;
    color: #92400e;
  }

  .material-card :global(button) {
    width: 100%;
  }

  .last-action-panel {
    background: var(--color-surface);
  }

  @media (min-width: 40rem) {
    .material-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .material-card :global(button) {
      width: auto;
      justify-self: start;
    }
  }
</style>

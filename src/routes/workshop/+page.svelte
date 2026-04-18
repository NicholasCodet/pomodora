<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { getShopMaterialStates } from '$lib/app/sanctuary';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';

  let lastActionMessage = '';

  $: shopMaterials = getShopMaterialStates($sanctuaryStore);

  function getShopStateLabel(material: (typeof shopMaterials)[number]): string {
    if (material.canPurchase) {
      return 'available';
    }

    if (material.blockedReason === 'material_locked') {
      return 'locked';
    }

    if (material.blockedReason === 'insufficient_essence') {
      return 'insufficient';
    }

    return material.blockedReason ?? 'unavailable';
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

<section aria-labelledby="workshop-heading" class="panel">
  <h1 id="workshop-heading">Workshop</h1>
  <p class="section-intro">Buy minerals that are unlocked and affordable.</p>

  <table>
    <caption>Available materials</caption>
    <thead>
      <tr>
        <th scope="col">Material</th>
        <th scope="col">Cost</th>
        <th scope="col">State</th>
        <th scope="col">Action</th>
      </tr>
    </thead>
    <tbody>
      {#each shopMaterials as material}
        <tr>
          <th scope="row">{material.name}</th>
          <td>{material.cost}</td>
          <td>{getShopStateLabel(material)}</td>
          <td>
            <Button
              variant="secondary"
              disabled={!material.canPurchase}
              on:click={() => handleBuyMaterial(material.type)}
            >
              Buy
            </Button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<section aria-labelledby="last-action-heading" class="panel">
  <h2 id="last-action-heading">Last Action</h2>
  <p>{lastActionMessage || 'No action yet.'}</p>
</section>

<style>
  .panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
  }

  h1,
  h2 {
    margin: 0 0 var(--space-2);
    line-height: 1.2;
  }

  p {
    margin: 0;
  }

  .section-intro {
    color: var(--color-muted-text);
    margin-bottom: var(--space-2);
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  caption {
    font-weight: 600;
    margin-bottom: var(--space-2);
    text-align: left;
  }

  th,
  td {
    border: 1px solid var(--color-border);
    padding: var(--space-1) var(--space-2);
    text-align: left;
    vertical-align: top;
  }
</style>

<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import {
    RITUAL_SLOT_LIMIT,
    getCollectionArtifactViews,
    getMineralProgressView,
    getShopMaterialStates,
  } from '$lib/app/sanctuary';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';

  let vaultView: 'materials' | 'collection' = 'materials';
  let lastActionMessage = '';

  $: shopMaterials = getShopMaterialStates($sanctuaryStore);
  $: collectionArtifacts = getCollectionArtifactViews($sanctuaryStore);
  $: ritualSlotMineralIds = $sanctuaryStore.ritualSlotMineralIds;
  $: ritualSlotLimitReached = ritualSlotMineralIds.length >= RITUAL_SLOT_LIMIT;
  $: inventoryRows = $sanctuaryStore.inventory.map((mineral) => ({
    mineral,
    progress: getMineralProgressView(mineral),
    materialLabel: getMaterialLabel(mineral.materialType),
    isSelected: $sanctuaryStore.selectedMineralId === mineral.id,
    isSlotted: ritualSlotMineralIds.includes(mineral.id),
  }));

  function getMaterialLabel(materialType: (typeof shopMaterials)[number]['type']): string {
    const material = shopMaterials.find((entry) => entry.type === materialType);
    return material ? material.name : materialType;
  }

  function handleSelectMineral(mineralId: string): void {
    const result = sanctuaryStore.selectMineral(mineralId);
    lastActionMessage = result.ok
      ? `Selected mineral ${formatMineralId(result.mineral.id)}.`
      : `Selection failed: ${formatFailureReason(result.reason)}.`;
  }

  function handleAddRitualSlot(mineralId: string): void {
    const result = sanctuaryStore.addRitualSlot(mineralId);
    lastActionMessage = result.ok
      ? `Added ${formatMineralId(result.mineral.id)} to Ritual Slots.`
      : `Add slot failed: ${formatFailureReason(result.reason)}.`;
  }

  function handleRemoveRitualSlot(mineralId: string): void {
    const result = sanctuaryStore.removeRitualSlot(mineralId);
    lastActionMessage = result.ok
      ? `Removed ${formatMineralId(result.mineralId)} from Ritual Slots.`
      : `Remove slot failed: ${formatFailureReason(result.reason)}.`;
  }

  function formatMineralId(mineralId: string): string {
    if (mineralId.length <= 14) {
      return mineralId;
    }

    return `${mineralId.slice(0, 14)}...`;
  }

  function formatFailureReason(reason: string): string {
    return reason.replaceAll('_', ' ');
  }
</script>

<svelte:head>
  <title>Vault | Pomodora Sanctuary</title>
</svelte:head>

<section aria-labelledby="vault-heading" class="panel">
  <h1 id="vault-heading">Vault</h1>
  <p class="section-intro">Manage your current materials and discovered artifacts.</p>

  <div class="vault-switch" role="group" aria-label="Vault view">
    <Button
      variant={vaultView === 'materials' ? 'primary' : 'secondary'}
      on:click={() => {
        vaultView = 'materials';
      }}
    >
      Materials{#if vaultView === 'materials'} (current){/if}
    </Button>
    <Button
      variant={vaultView === 'collection' ? 'primary' : 'secondary'}
      on:click={() => {
        vaultView = 'collection';
      }}
    >
      Collection{#if vaultView === 'collection'} (current){/if}
    </Button>
  </div>

  {#if vaultView === 'materials'}
    <section aria-labelledby="materials-heading" class="subsection">
      <h2 id="materials-heading">Materials</h2>
      <p class="section-intro">
        Ritual Slots: {ritualSlotMineralIds.length}/{RITUAL_SLOT_LIMIT}
      </p>
      {#if ritualSlotLimitReached}
        <p class="slot-helper">Ritual Slots are full. Remove one to add another mineral.</p>
      {/if}
      {#if inventoryRows.length === 0}
        <p>No actionable minerals in inventory.</p>
      {:else}
        <table>
          <caption>Actionable inventory and active selection</caption>
          <thead>
            <tr>
              <th scope="col">Mineral ID</th>
              <th scope="col">Material</th>
              <th scope="col">Worked Minutes</th>
              <th scope="col">Stage</th>
              <th scope="col">Selected</th>
              <th scope="col">Ritual Slot</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {#each inventoryRows as row}
              <tr>
                <td>
                  <code title={row.mineral.id}>{formatMineralId(row.mineral.id)}</code>
                </td>
                <td>{row.materialLabel}</td>
                <td>{row.mineral.workedMinutes}</td>
                <td>
                  {#if row.progress.ok}
                    {row.progress.view.currentStage} / {row.progress.view.stageCount}
                  {:else}
                    unavailable ({row.progress.reason})
                  {/if}
                </td>
                <td>{row.isSelected ? 'Yes (active)' : 'No'}</td>
                <td>{row.isSlotted ? 'Yes' : 'No'}</td>
                <td>
                  <Button
                    variant={row.isSelected ? 'primary' : 'secondary'}
                    disabled={row.isSelected}
                    on:click={() => handleSelectMineral(row.mineral.id)}
                  >
                    {row.isSelected ? 'Selected' : 'Select'}
                  </Button>
                  {#if row.isSlotted}
                    <Button variant="secondary" on:click={() => handleRemoveRitualSlot(row.mineral.id)}>
                      Remove Slot
                    </Button>
                  {:else}
                    <Button
                      variant="secondary"
                      disabled={ritualSlotLimitReached}
                      on:click={() => handleAddRitualSlot(row.mineral.id)}
                    >
                      Add Slot
                    </Button>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </section>
  {:else}
    <section aria-labelledby="collection-heading" class="subsection">
      <h2 id="collection-heading">Collection</h2>
      {#if collectionArtifacts.length === 0}
        <p>No artifacts revealed yet.</p>
      {:else}
        <table>
          <caption>Discovered artifacts</caption>
          <thead>
            <tr>
              <th scope="col">Artifact</th>
              <th scope="col">Rarity</th>
              <th scope="col">Source Material</th>
            </tr>
          </thead>
          <tbody>
            {#each collectionArtifacts as artifact}
              <tr>
                <th scope="row">{artifact.name}</th>
                <td>{artifact.rarity}</td>
                <td>{artifact.materialType}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </section>
  {/if}
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

  .subsection {
    margin-top: var(--space-3);
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

  .vault-switch {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .slot-helper {
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

  td :global(button) {
    margin-right: var(--space-1);
    margin-bottom: var(--space-1);
  }
</style>

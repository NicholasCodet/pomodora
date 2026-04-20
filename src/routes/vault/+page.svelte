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
  $: ritualIsRunning = $sanctuaryStore.ritualRuntime.isRunning;
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

<section aria-labelledby="vault-heading" class="panel vault-panel">
  <header>
    <h1 id="vault-heading">Vault</h1>
    <p class="section-intro">Manage your current materials and discovered artifacts.</p>
  </header>

  <section aria-labelledby="vault-view-heading" class="switch-panel">
    <h2 id="vault-view-heading">View</h2>
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
  </section>

  {#if vaultView === 'materials'}
    <section aria-labelledby="materials-heading" class="content-panel">
      <h2 id="materials-heading">Materials</h2>
      <p class="section-intro">Ritual Slots: {ritualSlotMineralIds.length}/{RITUAL_SLOT_LIMIT}</p>
      {#if ritualIsRunning}
        <p class="hint-text">Selection is locked while a ritual is running.</p>
      {/if}
      {#if ritualSlotLimitReached}
        <p class="hint-text">Ritual Slots are full. Remove one to add another mineral.</p>
      {/if}

      {#if inventoryRows.length === 0}
        <p>No actionable minerals in inventory.</p>
      {:else}
        <ul class="card-list">
          {#each inventoryRows as row}
            <li>
              <article class="vault-card">
                <header class="card-header">
                  <h3>{row.materialLabel}</h3>
                  <p class="hint-text"><code title={row.mineral.id}>{formatMineralId(row.mineral.id)}</code></p>
                </header>

                <dl class="meta-grid">
                  <div>
                    <dt>Worked Minutes</dt>
                    <dd>{row.mineral.workedMinutes}</dd>
                  </div>
                  <div>
                    <dt>Stage</dt>
                    <dd>
                      {#if row.progress.ok}
                        {row.progress.view.currentStage} / {row.progress.view.stageCount}
                      {:else}
                        unavailable
                      {/if}
                    </dd>
                  </div>
                  <div>
                    <dt>Selected</dt>
                    <dd>{row.isSelected ? 'Yes (active)' : 'No'}</dd>
                  </div>
                  <div>
                    <dt>Ritual Slot</dt>
                    <dd>{row.isSlotted ? 'Yes' : 'No'}</dd>
                  </div>
                </dl>

                <div class="card-actions" aria-label="Material actions">
                  <Button
                    variant={row.isSelected ? 'primary' : 'secondary'}
                    disabled={row.isSelected || ritualIsRunning}
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
                </div>
              </article>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {:else}
    <section aria-labelledby="collection-heading" class="content-panel">
      <h2 id="collection-heading">Collection</h2>
      {#if collectionArtifacts.length === 0}
        <p>No artifacts revealed yet.</p>
      {:else}
        <ul class="card-list">
          {#each collectionArtifacts as artifact}
            <li>
              <article class="vault-card">
                <header class="card-header">
                  <h3>{artifact.name}</h3>
                </header>
                <dl class="meta-grid">
                  <div>
                    <dt>Rarity</dt>
                    <dd>{artifact.rarity}</dd>
                  </div>
                  <div>
                    <dt>Source Material</dt>
                    <dd>{artifact.materialType}</dd>
                  </div>
                </dl>
              </article>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}

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

  .vault-panel {
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
  .hint-text {
    color: var(--color-muted-text);
  }

  .switch-panel,
  .content-panel,
  .last-action-panel {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-background);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
  }

  .vault-switch {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .card-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-2);
  }

  .vault-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
  }

  .card-header {
    display: grid;
    gap: 0.35rem;
  }

  .meta-grid {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  dt {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-muted-text);
  }

  dd {
    margin: 0.2rem 0 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .card-actions {
    display: grid;
    gap: var(--space-2);
  }

  .card-actions :global(button) {
    width: 100%;
  }

  .last-action-panel {
    background: var(--color-surface);
  }

  @media (min-width: 40rem) {
    .card-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .card-actions {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .card-actions :global(button) {
      width: auto;
    }
  }
</style>

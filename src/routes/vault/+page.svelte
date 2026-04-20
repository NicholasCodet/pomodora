<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import type { CollectionArtifactView } from '$lib/app/sanctuary';
  import {
    RITUAL_SLOT_LIMIT,
    getCollectionArtifactViews,
    getMineralProgressView,
    getShopMaterialStates,
  } from '$lib/app/sanctuary';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';

  type ArtifactRarity = CollectionArtifactView['rarity'];

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
  $: selectedMineralRow = inventoryRows.find((row) => row.isSelected) ?? null;
  $: collectionGroups = buildCollectionGroups(collectionArtifacts);

  function getMaterialLabel(materialType: (typeof shopMaterials)[number]['type']): string {
    const material = shopMaterials.find((entry) => entry.type === materialType);
    return material ? material.name : materialType;
  }

  function buildCollectionGroups(artifacts: CollectionArtifactView[]) {
    const orderedRarities: ArtifactRarity[] = ['epic', 'rare', 'common', 'unknown'];

    return orderedRarities
      .map((rarity) => ({
        rarity,
        label: getRarityLabel(rarity),
        items: artifacts.filter((artifact) => artifact.rarity === rarity),
      }))
      .filter((group) => group.items.length > 0);
  }

  function getRarityLabel(rarity: ArtifactRarity): string {
    if (rarity === 'epic') {
      return 'Epic';
    }

    if (rarity === 'rare') {
      return 'Rare';
    }

    if (rarity === 'common') {
      return 'Common';
    }

    return 'Unknown';
  }

  function getRarityClass(rarity: ArtifactRarity): string {
    if (rarity === 'epic') {
      return 'rarity-epic';
    }

    if (rarity === 'rare') {
      return 'rarity-rare';
    }

    if (rarity === 'common') {
      return 'rarity-common';
    }

    return 'rarity-unknown';
  }

  function getRemainingStageLabel(
    progress: (typeof inventoryRows)[number]['progress'],
  ): string {
    if (!progress.ok || progress.view.remainingMinutesToNextStage === null) {
      return 'none';
    }

    return `${progress.view.remainingMinutesToNextStage} min`;
  }

  function formatDiscoveredDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
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
    <p class="section-intro">Manage active minerals and browse your revealed artifacts.</p>
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

    {#if vaultView === 'materials'}
      <p class="view-intro">Operational view: choose the active mineral and manage Ritual Slots.</p>
    {:else}
      <p class="view-intro">Showcase view: review discovered artifacts grouped by rarity.</p>
    {/if}
  </section>

  {#if vaultView === 'materials'}
    <section aria-labelledby="materials-heading" class="content-panel materials-panel">
      <h2 id="materials-heading">Materials</h2>

      <dl class="summary-strip">
        <div>
          <dt>Actionable Minerals</dt>
          <dd>{inventoryRows.length}</dd>
        </div>
        <div>
          <dt>Active Mineral</dt>
          <dd>{selectedMineralRow ? formatMineralId(selectedMineralRow.mineral.id) : 'none'}</dd>
        </div>
        <div>
          <dt>Ritual Slots</dt>
          <dd>{ritualSlotMineralIds.length}/{RITUAL_SLOT_LIMIT}</dd>
        </div>
      </dl>

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
              <article class="vault-card material-card">
                <header class="card-header">
                  <h3>{row.materialLabel}</h3>
                  <p class="hint-text"><code title={row.mineral.id}>{formatMineralId(row.mineral.id)}</code></p>
                  <p class="status-badges">
                    {#if row.isSelected}
                      <span class="status-chip status-active">Active</span>
                    {/if}
                    {#if row.isSlotted}
                      <span class="status-chip status-slot">In Ritual Slots</span>
                    {/if}
                  </p>
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
                    <dt>Remaining to Next</dt>
                    <dd>{getRemainingStageLabel(row.progress)}</dd>
                  </div>
                  <div>
                    <dt>Slot State</dt>
                    <dd>{row.isSlotted ? 'Slotted' : 'Not slotted'}</dd>
                  </div>
                </dl>

                <div class="card-actions" aria-label="Material actions">
                  <Button
                    variant={row.isSelected ? 'primary' : 'secondary'}
                    disabled={row.isSelected || ritualIsRunning}
                    on:click={() => handleSelectMineral(row.mineral.id)}
                  >
                    {row.isSelected ? 'Selected' : 'Select Active'}
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
                      Add to Slots
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
    <section aria-labelledby="collection-heading" class="content-panel collection-panel">
      <h2 id="collection-heading">Collection</h2>
      <p class="section-intro">Artifacts revealed through completed rituals.</p>

      {#if collectionArtifacts.length === 0}
        <p>Your collection is empty for now.</p>
        <p class="hint-text">Complete and reveal minerals from Ritual to begin your archive.</p>
      {:else}
        <div class="collection-groups">
          {#each collectionGroups as group}
            <section aria-labelledby={`rarity-${group.rarity}`} class="rarity-group">
              <header class="rarity-header">
                <h3 id={`rarity-${group.rarity}`}>{group.label}</h3>
                <p class="hint-text">{group.items.length} discovered</p>
              </header>

              <ul class="artifact-list">
                {#each group.items as artifact}
                  <li>
                    <article class={`vault-card artifact-card ${getRarityClass(artifact.rarity)}`}>
                      <header class="card-header">
                        <h4>{artifact.name}</h4>
                        <p class="status-chip rarity-label">{group.label}</p>
                      </header>

                      <dl class="meta-grid">
                        <div>
                          <dt>Source Material</dt>
                          <dd>{artifact.materialType}</dd>
                        </div>
                        <div>
                          <dt>Discovered</dt>
                          <dd>{formatDiscoveredDate(artifact.discoveredAt)}</dd>
                        </div>
                      </dl>
                    </article>
                  </li>
                {/each}
              </ul>
            </section>
          {/each}
        </div>
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
  h3,
  h4 {
    margin: 0;
    line-height: 1.2;
  }

  p {
    margin: 0;
  }

  .section-intro,
  .hint-text,
  .view-intro {
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

  .view-intro {
    font-size: 0.92rem;
  }

  .materials-panel {
    background: var(--color-background);
  }

  .collection-panel {
    background: linear-gradient(180deg, #f8fafc 0%, #f4f6fb 100%);
  }

  .vault-switch {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .summary-strip {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .summary-strip div {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    padding: var(--space-1) var(--space-2);
  }

  .summary-strip dt {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--color-muted-text);
  }

  .summary-strip dd {
    margin: 0.2rem 0 0;
    font-size: 0.95rem;
    font-weight: 700;
  }

  .card-list,
  .artifact-list {
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

  .material-card {
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  .card-header {
    display: grid;
    gap: 0.35rem;
  }

  .status-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .status-chip {
    display: inline-block;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    padding: 0.15rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .status-active {
    background: #dbeafe;
    border-color: #93c5fd;
    color: #1e3a8a;
  }

  .status-slot {
    background: #ede9fe;
    border-color: #c4b5fd;
    color: #4c1d95;
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

  .collection-groups {
    display: grid;
    gap: var(--space-3);
  }

  .rarity-group {
    display: grid;
    gap: var(--space-2);
  }

  .rarity-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-2);
  }

  .artifact-card {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  }

  .rarity-label {
    width: fit-content;
  }

  .rarity-epic {
    border-color: #7c3aed;
  }

  .rarity-rare {
    border-color: #2563eb;
  }

  .rarity-common {
    border-color: #6b7280;
  }

  .rarity-unknown {
    border-color: var(--color-border);
  }

  .last-action-panel {
    background: var(--color-surface);
  }

  @media (min-width: 40rem) {
    .card-list,
    .artifact-list {
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

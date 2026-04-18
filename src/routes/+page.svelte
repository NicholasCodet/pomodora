<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import {
    getCollectionArtifactViews,
    getMineralProgressView,
    getPlayerSummary,
    getSelectedMineral,
    getShopMaterialStates,
  } from '$lib/app/game';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';

  let shopMaterials = getShopMaterialStates($sanctuaryStore);
  let lastActionMessage = '';

  $: shopMaterials = getShopMaterialStates($sanctuaryStore);
  $: playerSummary = getPlayerSummary($sanctuaryStore);
  $: collectionArtifacts = getCollectionArtifactViews($sanctuaryStore);
  $: selectedMineral = getSelectedMineral($sanctuaryStore);
  $: selectedProgress = selectedMineral ? getMineralProgressView(selectedMineral) : null;
  $: isSelectedCompleted = selectedProgress?.ok ? selectedProgress.view.isCompleted : false;
  $: canRevealSelected = isSelectedCompleted;
  $: inventoryRows = $sanctuaryStore.inventory.map((mineral) => ({
    mineral,
    progress: getMineralProgressView(mineral),
    materialLabel: getMaterialLabel(mineral.materialType),
    isSelected: $sanctuaryStore.selectedMineralId === mineral.id,
  }));

  function getMaterialLabel(materialType: (typeof shopMaterials)[number]['type']): string {
    const material = shopMaterials.find((entry) => entry.type === materialType);
    return material ? material.name : materialType;
  }

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

  function handleCompleteRitual(minutes: number): void {
    const result = sanctuaryStore.completeSelectedRitual(minutes);
    lastActionMessage = result.ok
      ? `Ritual complete: +${minutes} min, +${result.essenceGain} Essence.`
      : `Ritual failed: ${formatFailureReason(result.reason)}.`;
  }

  function handleSelectMineral(mineralId: string): void {
    const result = sanctuaryStore.selectMineral(mineralId);
    lastActionMessage = result.ok
      ? `Selected mineral ${formatMineralId(result.mineral.id)}.`
      : `Selection failed: ${formatFailureReason(result.reason)}.`;
  }

  function handleRevealSelectedMineral(): void {
    const result = sanctuaryStore.revealSelectedMineral();
    lastActionMessage = result.ok
      ? `Artifact revealed: ${result.artifact.name} (${result.artifact.rarity}). Moved to collection (${result.state.collection.length} total).`
      : `Reveal failed: ${formatFailureReason(result.reason)}.`;
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
  <title>Pomodora Sanctuary</title>
</svelte:head>

<main>
  <header>
    <h1>Pomodora Sanctuary</h1>
    <p>Refine minerals through focused rituals and reveal hidden artifacts.</p>
  </header>

  <section aria-labelledby="overview-heading">
    <h2 id="overview-heading">Current Sanctuary State</h2>
    <p class="section-intro">Track current resources and progression before starting the next loop.</p>

    <div class="overview-grid">
      <article class="panel" aria-labelledby="live-state-heading">
        <h3 id="live-state-heading">Live State</h3>
        <dl class="summary-grid">
          <div>
            <dt>Essence</dt>
            <dd>{$sanctuaryStore.player.essence}</dd>
          </div>
          <div>
            <dt>Inventory Count</dt>
            <dd>{$sanctuaryStore.inventory.length}</dd>
          </div>
          <div>
            <dt>Selected Mineral ID</dt>
            <dd>{$sanctuaryStore.selectedMineralId ?? 'none'}</dd>
          </div>
          <div>
            <dt>Collection Count</dt>
            <dd>{$sanctuaryStore.collection.length}</dd>
          </div>
        </dl>
      </article>

      <article class="panel" aria-labelledby="summary-heading">
        <h3 id="summary-heading">Progress Summary</h3>
        <dl class="summary-grid">
          <div>
            <dt>Completed Rituals</dt>
            <dd>{playerSummary.completedRituals}</dd>
          </div>
          <div>
            <dt>Total Worked Minutes</dt>
            <dd>{playerSummary.totalWorkedMinutes}</dd>
          </div>
          <div>
            <dt>Unlocked Materials</dt>
            <dd>{playerSummary.unlockedMaterialTypes.join(', ')}</dd>
          </div>
          <div>
            <dt>Selected Mineral ID</dt>
            <dd>{playerSummary.selectedMineralId ?? 'none'}</dd>
          </div>
        </dl>
      </article>
    </div>
  </section>

  <section aria-labelledby="feedback-heading">
    <h2 id="feedback-heading">Last Action</h2>
    <p>{lastActionMessage || 'No action yet.'}</p>
  </section>

  <div class="flow-grid">
    <section aria-labelledby="shop-heading">
      <h2 id="shop-heading">1. Workshop</h2>
      <p class="section-intro">Buy available materials to expand your actionable inventory.</p>
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

    <section aria-labelledby="inventory-heading">
      <h2 id="inventory-heading">2. Owned Minerals</h2>
      <p class="section-intro">Choose which mineral is active for the next ritual.</p>

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
                <td>
                  <Button
                    variant={row.isSelected ? 'primary' : 'secondary'}
                    disabled={row.isSelected}
                    on:click={() => handleSelectMineral(row.mineral.id)}
                  >
                    {row.isSelected ? 'Selected' : 'Select'}
                  </Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </section>

    <section aria-labelledby="ritual-heading">
      <h2 id="ritual-heading">3. Ritual</h2>
      <p class="section-intro">Apply fixed ritual duration to the selected mineral.</p>

      {#if selectedMineral === null}
        <p>No mineral selected.</p>
      {:else if selectedProgress?.ok}
        <dl class="summary-grid">
          <div>
            <dt>Selected Mineral ID</dt>
            <dd>{selectedMineral.id}</dd>
          </div>
          <div>
            <dt>Material</dt>
            <dd>{getMaterialLabel(selectedProgress.view.materialType)}</dd>
          </div>
          <div>
            <dt>Stage</dt>
            <dd>{selectedProgress.view.currentStage} / {selectedProgress.view.stageCount}</dd>
          </div>
          <div>
            <dt>Worked Minutes</dt>
            <dd>{selectedProgress.view.workedMinutes}</dd>
          </div>
          <div>
            <dt>Next Threshold</dt>
            <dd>{selectedProgress.view.nextThreshold ?? 'none'}</dd>
          </div>
          <div>
            <dt>Remaining Minutes</dt>
            <dd>{selectedProgress.view.remainingMinutesToNextStage ?? 'none'}</dd>
          </div>
          <div>
            <dt>Completed</dt>
            <dd>{selectedProgress.view.isCompleted ? 'Yes' : 'No'}</dd>
          </div>
        </dl>

        <div class="ritual-actions">
          <p class="ritual-actions-label">Complete fixed ritual:</p>
          <Button
            variant="primary"
            disabled={isSelectedCompleted}
            on:click={() => handleCompleteRitual(15)}
          >
            Complete 15 min ritual
          </Button>
          <Button
            variant="primary"
            disabled={isSelectedCompleted}
            on:click={() => handleCompleteRitual(30)}
          >
            Complete 30 min ritual
          </Button>
          <Button
            variant="primary"
            disabled={isSelectedCompleted}
            on:click={() => handleCompleteRitual(45)}
          >
            Complete 45 min ritual
          </Button>
          <Button
            variant="secondary"
            disabled={!canRevealSelected}
            on:click={handleRevealSelectedMineral}
          >
            Reveal artifact
          </Button>
        </div>

        {#if isSelectedCompleted}
          <p class="ritual-helper">This mineral is fully refined. Reveal its artifact.</p>
        {:else if !canRevealSelected}
          <p class="ritual-helper">
            Complete the mineral before revealing.
            {#if selectedProgress.view.remainingMinutesToNextStage !== null}
              Remaining to next stage: {selectedProgress.view.remainingMinutesToNextStage} min.
            {/if}
          </p>
        {/if}
      {:else}
        <p>Unable to compute selected mineral progress: {selectedProgress?.reason}</p>
      {/if}
    </section>

    <section aria-labelledby="collection-heading">
      <h2 id="collection-heading">4. Collection</h2>
      <p class="section-intro">Revealed artifacts are archived here.</p>

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
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Atkinson Hyperlegible', 'Segoe UI', sans-serif;
    background: var(--color-background);
    color: var(--color-text);
  }

  main {
    margin: 0 auto;
    max-width: 72rem;
    padding: var(--space-4);
    display: grid;
    gap: var(--space-4);
  }

  header,
  section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
  }

  h1,
  h2,
  h3 {
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

  .overview-grid {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  }

  .panel {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
  }

  .flow-grid {
    display: grid;
    gap: var(--space-4);
  }

  .summary-grid {
    display: grid;
    gap: var(--space-2);
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  }

  .summary-grid div {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
  }

  dt {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-muted-text);
  }

  dd {
    margin: 0.25rem 0 0;
    font-size: 1rem;
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

  .ritual-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-3);
  }

  .ritual-actions-label {
    flex-basis: 100%;
    font-weight: 600;
  }

  .ritual-helper {
    margin-top: var(--space-2);
    color: var(--color-muted-text);
  }
</style>

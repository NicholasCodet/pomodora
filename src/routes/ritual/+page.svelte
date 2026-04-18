<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import {
    getRitualSlotMinerals,
    getMineralProgressView,
    getSelectedMineral,
    getShopMaterialStates,
  } from '$lib/app/sanctuary';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';

  let lastActionMessage = '';

  $: shopMaterials = getShopMaterialStates($sanctuaryStore);
  $: ritualSlots = getRitualSlotMinerals($sanctuaryStore);
  $: ritualSlotRows = ritualSlots.map((mineral) => ({
    mineral,
    progress: getMineralProgressView(mineral),
    materialLabel: getMaterialLabel(mineral.materialType),
    isSelected: $sanctuaryStore.selectedMineralId === mineral.id,
  }));
  $: selectedMineral = getSelectedMineral($sanctuaryStore);
  $: selectedProgress = selectedMineral ? getMineralProgressView(selectedMineral) : null;
  $: isSelectedCompleted = selectedProgress?.ok ? selectedProgress.view.isCompleted : false;

  function getMaterialLabel(materialType: (typeof shopMaterials)[number]['type']): string {
    const material = shopMaterials.find((entry) => entry.type === materialType);
    return material ? material.name : materialType;
  }

  function handleCompleteRitual(minutes: number): void {
    const result = sanctuaryStore.completeSelectedRitual(minutes);
    lastActionMessage = result.ok
      ? `Ritual complete: +${minutes} min, +${result.essenceGain} Essence.`
      : `Ritual failed: ${formatFailureReason(result.reason)}.`;
  }

  function handleRevealSelectedMineral(): void {
    const result = sanctuaryStore.revealSelectedMineral();
    lastActionMessage = result.ok
      ? `Artifact revealed: ${result.artifact.name} (${result.artifact.rarity}).`
      : `Reveal failed: ${formatFailureReason(result.reason)}.`;
  }

  function handleSelectRitualSlot(mineralId: string): void {
    const result = sanctuaryStore.selectMineral(mineralId);
    lastActionMessage = result.ok
      ? `Selected slot mineral ${result.mineral.id}.`
      : `Slot selection failed: ${formatFailureReason(result.reason)}.`;
  }

  function formatFailureReason(reason: string): string {
    return reason.replaceAll('_', ' ');
  }
</script>

<svelte:head>
  <title>Ritual | Pomodora Sanctuary</title>
</svelte:head>

<section aria-labelledby="ritual-heading" class="panel">
  <h1 id="ritual-heading">Ritual</h1>
  <p class="section-intro">Apply fixed focus durations to the currently selected mineral.</p>

  <section aria-labelledby="ritual-slots-heading" class="slot-panel">
    <h2 id="ritual-slots-heading">Ritual Slots</h2>
    {#if ritualSlotRows.length === 0}
      <p>No Ritual Slots configured. Add them in Vault > Materials.</p>
    {:else}
      <ul class="slot-list">
        {#each ritualSlotRows as slot}
          <li class="slot-item">
            <p>
              <strong>{slot.materialLabel}</strong>
              <span class="slot-meta">
                ({slot.progress.ok ? `stage ${slot.progress.view.currentStage}/${slot.progress.view.stageCount}, ${slot.progress.view.workedMinutes} min` : 'progress unavailable'})
              </span>
            </p>
            <Button
              variant={slot.isSelected ? 'primary' : 'secondary'}
              disabled={slot.isSelected}
              on:click={() => handleSelectRitualSlot(slot.mineral.id)}
            >
              {slot.isSelected ? 'Active' : 'Use for Ritual'}
            </Button>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  {#if selectedMineral === null}
    <p>No mineral selected. Go to Vault to choose one.</p>
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
      <Button variant="primary" disabled={isSelectedCompleted} on:click={() => handleCompleteRitual(15)}>
        Complete 15 min ritual
      </Button>
      <Button variant="primary" disabled={isSelectedCompleted} on:click={() => handleCompleteRitual(30)}>
        Complete 30 min ritual
      </Button>
      <Button variant="primary" disabled={isSelectedCompleted} on:click={() => handleCompleteRitual(45)}>
        Complete 45 min ritual
      </Button>
      <Button
        variant="secondary"
        disabled={!isSelectedCompleted}
        on:click={handleRevealSelectedMineral}
      >
        Reveal artifact
      </Button>
    </div>

    {#if isSelectedCompleted}
      <p class="ritual-helper">This mineral is fully refined. Reveal its artifact.</p>
    {:else}
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

  .slot-panel {
    margin-bottom: var(--space-3);
    padding: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-background);
  }

  .slot-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-2);
  }

  .slot-item {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
  }

  .slot-meta {
    color: var(--color-muted-text);
    font-size: 0.875rem;
    margin-left: var(--space-1);
  }
</style>

<script lang="ts">
  import { dev } from '$app/environment';
  import { onMount } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import RitualCountdown from '$lib/components/ritual/RitualCountdown.svelte';
  import RitualDurationPicker from '$lib/components/ritual/RitualDurationPicker.svelte';
  import RitualSlotsPanel from '$lib/components/ritual/RitualSlotsPanel.svelte';
  import {
    getRitualSlotMinerals,
    getMineralProgressView,
    getSelectedMineral,
    getShopMaterialStates,
  } from '$lib/app/sanctuary';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';

  const RITUAL_DURATION_PRESETS = [15, 30, 45] as const;

  type RitualDurationPreset = (typeof RITUAL_DURATION_PRESETS)[number];

  let lastActionMessage = '';
  let selectedDurationMinutes: RitualDurationPreset = 30;
  let isDurationPickerOpen = false;

  onMount(() => {
    sanctuaryStore.ensureRitualSelection();
  });

  $: shopMaterials = getShopMaterialStates($sanctuaryStore);
  $: ritualRuntime = $sanctuaryStore.ritualRuntime;
  $: ritualIsRunning = ritualRuntime.isRunning;
  $: ritualRemainingMs =
    ritualRuntime.isRunning && ritualRuntime.endTimestamp !== null
      ? Math.max(0, ritualRuntime.endTimestamp - ritualRuntime.tickNowTimestamp)
      : 0;
  $: ritualRemainingLabel = formatRemainingDuration(ritualRemainingMs);
  $: ritualSlots = getRitualSlotMinerals($sanctuaryStore);
  $: ritualSlotRows = ritualSlots.map((mineral) => ({
    mineral,
    progress: getMineralProgressView(mineral),
    materialLabel: getMaterialLabel(mineral.materialType),
    isSelected: $sanctuaryStore.selectedMineralId === mineral.id,
  }));
  $: ritualSlotItems = ritualSlotRows.map((slot) => ({
    mineralId: slot.mineral.id,
    materialLabel: slot.materialLabel,
    progressLabel: slot.progress.ok
      ? `stage ${slot.progress.view.currentStage}/${slot.progress.view.stageCount}, ${slot.progress.view.workedMinutes} min`
      : 'progress unavailable',
    isSelected: slot.isSelected,
    isDisabled: slot.isSelected || ritualIsRunning,
  }));
  $: selectedMineral = getSelectedMineral($sanctuaryStore);
  $: selectedProgress = selectedMineral ? getMineralProgressView(selectedMineral) : null;
  $: isSelectedCompleted = selectedProgress?.ok ? selectedProgress.view.isCompleted : false;
  $: hasInventory = $sanctuaryStore.inventory.length > 0;
  $: timerStatusText = ritualIsRunning
    ? `Ritual running (${ritualRuntime.durationMinutes ?? 0} min session).`
    : selectedMineral
      ? 'Ready. Start a ritual session to apply worked minutes.'
      : hasInventory
        ? 'No active mineral selected yet. Ritual Slots are used as default fallback.'
        : 'No mineral ready for ritual. Visit Workshop to buy one.';

  function getMaterialLabel(materialType: (typeof shopMaterials)[number]['type']): string {
    const material = shopMaterials.find((entry) => entry.type === materialType);
    return material ? material.name : materialType;
  }

  function handleStartRitual(minutes: number): void {
    sanctuaryStore.ensureRitualSelection();
    const result = sanctuaryStore.startRitual(minutes);
    lastActionMessage = result.ok
      ? `Ritual started for ${minutes} minutes.`
      : `Ritual start failed: ${formatFailureReason(result.reason)}.`;
  }

  function handleBeginRitual(): void {
    handleStartRitual(selectedDurationMinutes);
  }

  function toggleDurationPicker(): void {
    isDurationPickerOpen = !isDurationPickerOpen;
  }

  function selectDurationPreset(minutes: number): void {
    if (!RITUAL_DURATION_PRESETS.includes(minutes as RitualDurationPreset)) {
      return;
    }

    selectedDurationMinutes = minutes as RitualDurationPreset;
    isDurationPickerOpen = false;
  }

  function handleCancelRitual(): void {
    const result = sanctuaryStore.cancelRitual();
    lastActionMessage = result.ok
      ? 'Ritual canceled. No progress was applied.'
      : `Cancel failed: ${formatFailureReason(result.reason)}.`;
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

  function handleCompleteInstantDebug(): void {
    const result = sanctuaryStore.completeRitualInstantDebug();
    lastActionMessage = result.ok
      ? `Debug complete: +${result.essenceGain} Essence applied instantly.`
      : `Debug complete failed: ${formatFailureReason(result.reason)}.`;
  }

  function formatFailureReason(reason: string): string {
    return reason.replaceAll('_', ' ');
  }

  function formatRemainingDuration(remainingMs: number): string {
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  function getNextProgressLabel(): string {
    if (!selectedProgress?.ok) {
      return 'Progress unavailable';
    }

    if (selectedProgress.view.isCompleted) {
      return 'Fully refined';
    }

    if (selectedProgress.view.remainingMinutesToNextStage === null) {
      return 'Next stage unknown';
    }

    return `${selectedProgress.view.remainingMinutesToNextStage} min to next stage`;
  }
</script>

<svelte:head>
  <title>Ritual | Pomodora Sanctuary</title>
</svelte:head>

<section aria-labelledby="ritual-heading" class="panel ritual-panel">
  <header>
    <h1 id="ritual-heading">Ritual</h1>
    <p class="section-intro">Focus sessions refine the currently active mineral.</p>
  </header>

  {#if ritualIsRunning}
    <RitualCountdown
      remainingLabel={ritualRemainingLabel}
      statusText={timerStatusText}
      remainingMs={ritualRemainingMs}
      durationMinutes={ritualRuntime.durationMinutes}
      onCancel={handleCancelRitual}
    />
  {:else}
    <section aria-labelledby="ritual-status-heading" class="idle-status">
      <h2 id="ritual-status-heading">Ritual Status</h2>
      <p class="timer-status">{timerStatusText}</p>
    </section>
  {/if}

  <section aria-labelledby="selected-mineral-heading" class="primary-panel">
    <h2 id="selected-mineral-heading">Selected Mineral</h2>

    {#if selectedMineral === null}
      {#if hasInventory}
        <p>No active mineral is currently available for ritual.</p>
        <p class="hint-text">Open Vault to select one manually, or use Ritual Slots for quick access.</p>
      {:else}
        <p>No mineral ready for ritual. Visit Workshop to buy one.</p>
        <p class="hint-text"><a href="/workshop">Go to Workshop</a></p>
      {/if}
    {:else if selectedProgress?.ok}
      <p class="mineral-title">
        <strong>{getMaterialLabel(selectedProgress.view.materialType)}</strong>
        <span class="hint-text">({selectedMineral.id})</span>
      </p>

      {#if ritualIsRunning}
        <dl class="summary-grid">
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
      {:else}
        <section aria-labelledby="idle-progress-heading" class="idle-progress">
          <h3 id="idle-progress-heading">Progress</h3>
          <p class="progress-stage">
            Stage {selectedProgress.view.currentStage} / {selectedProgress.view.stageCount}
          </p>
          <p class="hint-text">{getNextProgressLabel()}</p>
          <dl class="progress-inline">
            <div>
              <dt>Worked</dt>
              <dd>{selectedProgress.view.workedMinutes} min</dd>
            </div>
            <div>
              <dt>Next Threshold</dt>
              <dd>{selectedProgress.view.nextThreshold ?? 'none'}</dd>
            </div>
          </dl>
        </section>
      {/if}

      {#if ritualIsRunning}
        <section aria-labelledby="ritual-setup-heading" class="setup-panel secondary-panel">
          <h3 id="ritual-setup-heading">Ritual Setup (Locked)</h3>
          <p class="hint-text">
            A ritual is active. Duration choice and mineral switching are temporarily disabled.
          </p>
        </section>
      {:else}
        <RitualDurationPicker
          selectedDurationMinutes={selectedDurationMinutes}
          isPickerOpen={isDurationPickerOpen}
          isBeginDisabled={isSelectedCompleted}
          presets={RITUAL_DURATION_PRESETS}
          onBegin={handleBeginRitual}
          onTogglePicker={toggleDurationPicker}
          onSelectPreset={selectDurationPreset}
        />
      {/if}

      <section aria-labelledby="reveal-heading" class="reveal-panel">
        <h3 id="reveal-heading">Reveal</h3>
        <Button
          variant="secondary"
          disabled={!isSelectedCompleted || ritualIsRunning}
          on:click={handleRevealSelectedMineral}
        >
          Reveal artifact
        </Button>
        {#if ritualIsRunning}
          <p class="hint-text">
            Ritual running ({ritualRuntime.durationMinutes} min). Reveal becomes available when the ritual ends.
          </p>
        {:else if isSelectedCompleted}
          <p class="hint-text">This mineral is fully refined. You can reveal its artifact now.</p>
        {:else}
          <p class="hint-text">
            Complete the mineral before revealing.
            {#if selectedProgress.view.remainingMinutesToNextStage !== null}
              Remaining to next stage: {selectedProgress.view.remainingMinutesToNextStage} min.
            {/if}
          </p>
        {/if}
      </section>

      {#if dev}
        <div class="debug-actions">
          <p class="hint-text">Debug tools (development only)</p>
          <Button variant="secondary" on:click={handleCompleteInstantDebug}>
            Complete instantly (debug)
          </Button>
        </div>
      {/if}
    {:else}
      <p>Unable to compute selected mineral progress: {selectedProgress?.reason}</p>
    {/if}
  </section>

  <div class:secondary-panel={ritualIsRunning}>
    <RitualSlotsPanel slots={ritualSlotItems} onSelectSlot={handleSelectRitualSlot} />
  </div>

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

  .ritual-panel {
    display: grid;
    gap: var(--space-3);
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

  .section-intro,
  .hint-text {
    color: var(--color-muted-text);
  }

  .idle-status,
  .primary-panel,
  .last-action-panel,
  .setup-panel,
  .reveal-panel,
  .idle-progress,
  .summary-grid div {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
    background: var(--color-background);
  }

  .mineral-title {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    align-items: baseline;
  }

  .summary-grid {
    display: grid;
    gap: var(--space-2);
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  }

  .progress-stage {
    font-size: 1rem;
    font-weight: 700;
  }

  .progress-inline {
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
    margin: 0.25rem 0 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .debug-actions {
    display: grid;
    gap: var(--space-1);
  }

  .secondary-panel {
    opacity: 0.72;
  }

  .last-action-panel {
    background: var(--color-surface);
  }

  @media (min-width: 40rem) {
    .summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>

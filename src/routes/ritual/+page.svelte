<script lang="ts">
  import { dev } from '$app/environment';
  import { onMount } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import {
    getRitualSlotMinerals,
    getMineralProgressView,
    getSelectedMineral,
    getShopMaterialStates,
  } from '$lib/app/sanctuary';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';

  const TIMER_RING_RADIUS = 84;
  const TIMER_RING_CIRCUMFERENCE = 2 * Math.PI * TIMER_RING_RADIUS;

  let lastActionMessage = '';

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
  $: ritualDurationMs =
    ritualRuntime.isRunning && ritualRuntime.durationMinutes !== null
      ? ritualRuntime.durationMinutes * 60 * 1000
      : 0;
  $: ritualProgressRatio =
    ritualIsRunning && ritualDurationMs > 0
      ? Math.min(1, Math.max(0, 1 - ritualRemainingMs / ritualDurationMs))
      : 0;
  $: ritualProgressDashOffset =
    TIMER_RING_CIRCUMFERENCE - ritualProgressRatio * TIMER_RING_CIRCUMFERENCE;
  $: ritualRemainingLabel = formatRemainingDuration(ritualRemainingMs);
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
</script>

<svelte:head>
  <title>Ritual | Pomodora Sanctuary</title>
</svelte:head>

<section aria-labelledby="ritual-heading" class="panel ritual-panel">
  <h1 id="ritual-heading">Ritual</h1>
  <p class="section-intro">Focus sessions refine the currently active mineral.</p>

  {#if ritualIsRunning}
    <section aria-labelledby="countdown-heading" class="timer-hero">
      <h2 id="countdown-heading">Countdown</h2>
      <div class="timer-display" role="status" aria-live="polite">
        <div class="timer-ring-shell" aria-hidden="true">
          <svg class="timer-ring" viewBox="0 0 200 200" focusable="false">
            <circle class="timer-track" cx="100" cy="100" r={TIMER_RING_RADIUS} />
            <circle
              class="timer-progress"
              cx="100"
              cy="100"
              r={TIMER_RING_RADIUS}
              style={`stroke-dasharray: ${TIMER_RING_CIRCUMFERENCE}; stroke-dashoffset: ${ritualProgressDashOffset};`}
            />
          </svg>
        </div>
        <p class="timer-value">{ritualRemainingLabel}</p>
      </div>
      <p class="timer-status">{timerStatusText}</p>
    </section>
  {:else}
    <section aria-labelledby="ritual-status-heading" class="idle-status">
      <h2 id="ritual-status-heading">Ritual Status</h2>
      <p class="timer-status">{timerStatusText}</p>
    </section>
  {/if}

  <section aria-labelledby="ritual-slots-heading" class="slot-panel">
    <h2 id="ritual-slots-heading">Ritual Slots</h2>
    {#if ritualSlotRows.length === 0}
      <p>No Ritual Slots configured. Add them in Vault &gt; Materials.</p>
    {:else}
      <ul class="slot-list">
        {#each ritualSlotRows as slot}
          <li class="slot-item">
            <p>
              <strong>{slot.materialLabel}</strong>
              <span class="slot-meta">
                ({slot.progress.ok
                  ? `stage ${slot.progress.view.currentStage}/${slot.progress.view.stageCount}, ${slot.progress.view.workedMinutes} min`
                  : 'progress unavailable'})
              </span>
            </p>
            <Button
              variant={slot.isSelected ? 'primary' : 'secondary'}
              disabled={slot.isSelected || ritualIsRunning}
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
    <section aria-labelledby="ritual-empty-heading" class="empty-panel">
      <h2 id="ritual-empty-heading">Selected Mineral</h2>
      {#if hasInventory}
        <p>No active mineral is currently available for ritual.</p>
        <p class="empty-hint">Open Vault to select one manually, or use Ritual Slots for quick access.</p>
      {:else}
        <p>No mineral ready for ritual. Visit Workshop to buy one.</p>
        <p class="empty-hint"><a href="/workshop">Go to Workshop</a></p>
      {/if}
    </section>
  {:else if selectedProgress?.ok}
    <section aria-labelledby="selected-mineral-heading" class="progress-panel">
      <h2 id="selected-mineral-heading">Selected Mineral</h2>
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
        <p class="ritual-actions-label">Start ritual:</p>
        <Button
          variant="primary"
          disabled={ritualIsRunning || isSelectedCompleted}
          on:click={() => handleStartRitual(15)}
        >
          Start 15 min ritual
        </Button>
        <Button
          variant="primary"
          disabled={ritualIsRunning || isSelectedCompleted}
          on:click={() => handleStartRitual(30)}
        >
          Start 30 min ritual
        </Button>
        <Button
          variant="primary"
          disabled={ritualIsRunning || isSelectedCompleted}
          on:click={() => handleStartRitual(45)}
        >
          Start 45 min ritual
        </Button>
        <Button variant="secondary" disabled={!ritualIsRunning} on:click={handleCancelRitual}>
          Cancel ritual
        </Button>
        <Button
          variant="secondary"
          disabled={!isSelectedCompleted || ritualIsRunning}
          on:click={handleRevealSelectedMineral}
        >
          Reveal artifact
        </Button>
      </div>

      {#if ritualIsRunning}
        <p class="ritual-helper">
          Ritual running ({ritualRuntime.durationMinutes} min). Time remaining: {ritualRemainingLabel}.
        </p>
      {:else if isSelectedCompleted}
        <p class="ritual-helper">This mineral is fully refined. Reveal its artifact.</p>
      {:else}
        <p class="ritual-helper">
          Complete the mineral before revealing.
          {#if selectedProgress.view.remainingMinutesToNextStage !== null}
            Remaining to next stage: {selectedProgress.view.remainingMinutesToNextStage} min.
          {/if}
        </p>
      {/if}

      {#if dev}
        <div class="debug-actions">
          <p class="ritual-actions-label">Debug tools (development only):</p>
          <Button variant="secondary" on:click={handleCompleteInstantDebug}>
            Complete instantly (debug)
          </Button>
        </div>
      {/if}
    </section>
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

  .ritual-panel {
    display: grid;
    gap: var(--space-3);
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
  }

  .timer-hero {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    display: grid;
    justify-items: center;
    gap: var(--space-2);
    text-align: center;
  }

  .timer-display {
    position: relative;
    display: grid;
    place-items: center;
  }

  .timer-ring-shell {
    width: min(80vw, 16rem);
    aspect-ratio: 1 / 1;
    display: grid;
    place-items: center;
  }

  .timer-ring {
    width: 100%;
    height: 100%;
  }

  .timer-track,
  .timer-progress {
    fill: none;
    stroke-width: 12;
  }

  .timer-track {
    stroke: var(--color-border);
  }

  .timer-progress {
    stroke: var(--color-primary);
    stroke-linecap: round;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    transition: stroke-dashoffset 1s linear;
  }

  .timer-value {
    position: absolute;
    margin: 0;
    font-size: clamp(2rem, 12vw, 3.25rem);
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .timer-status {
    color: var(--color-muted-text);
    font-weight: 600;
  }

  .idle-status {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-1);
  }

  .slot-panel,
  .progress-panel,
  .empty-panel {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-background);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
  }

  .empty-hint {
    color: var(--color-muted-text);
  }

  .empty-hint a {
    color: var(--color-primary);
    font-weight: 600;
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

  .summary-grid {
    display: grid;
    gap: var(--space-2);
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  }

  .summary-grid div {
    background: var(--color-surface);
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
  }

  .ritual-actions-label {
    flex-basis: 100%;
    font-weight: 600;
  }

  .ritual-helper {
    color: var(--color-muted-text);
  }

  .debug-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
</style>

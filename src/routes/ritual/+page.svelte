<script lang="ts">
  import { goto } from '$app/navigation';
  import { dev } from '$app/environment';
  import { onMount } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import ArtifactRevealModal from '$lib/components/ritual/ArtifactRevealModal.svelte';
  import RitualCountdown from '$lib/components/ritual/RitualCountdown.svelte';
  import RitualDurationPicker from '$lib/components/ritual/RitualDurationPicker.svelte';
  import MineralMediaPanel from '$lib/components/ritual/MineralMediaPanel.svelte';
  import RitualMineralHero from '$lib/components/ritual/RitualMineralHero.svelte';
  import RitualSlotsPanel from '$lib/components/ritual/RitualSlotsPanel.svelte';
  import {
    getRitualSlotMinerals,
    getMaterialPresentation,
    getMineralProgressView,
    getMaterialStageThresholds,
    getSelectedMineral,
    getShopMaterialStates,
  } from '$lib/app/sanctuary';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';

  const RITUAL_DURATION_PRESETS = [15, 30, 45] as const;

  type RitualDurationPreset = (typeof RITUAL_DURATION_PRESETS)[number];
  type RevealRarity = 'common' | 'rare' | 'epic';
  interface RevealMoment {
    artifactId: string;
    artifactName: string;
    artifactCategory: string;
    artifactDescription: string;
    rarity: RevealRarity;
    materialLabel: string;
    collectionCount: number;
    revealedAt: number;
  }

  let lastActionMessage = '';
  let latestReveal: RevealMoment | null = null;
  let isRevealModalOpen = false;
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
  $: selectedMineralName = selectedProgress?.ok
    ? getMaterialPresentation(selectedProgress.view.materialType).displayName
    : '';
  $: selectedMineralDescription = selectedProgress?.ok
    ? getMaterialPresentation(selectedProgress.view.materialType).shortDescription
    : null;
  $: selectedMineralThemeHint = selectedProgress?.ok
    ? getMaterialPresentation(selectedProgress.view.materialType).visualThemeHint
    : null;
  $: selectedStageThresholds =
    selectedProgress?.ok ? getMaterialStageThresholds(selectedProgress.view.materialType) : null;
  $: stageProgress = buildStageProgress(selectedProgress, selectedStageThresholds);
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
    if (result.ok) {
      latestReveal = {
        artifactId: result.artifact.id,
        artifactName: result.artifact.name,
        artifactCategory: result.artifact.artifactCategory,
        artifactDescription: result.artifact.description,
        rarity: result.artifact.rarity,
        materialLabel: getMaterialLabel(result.artifact.materialType),
        collectionCount: result.state.collection.length,
        revealedAt: Date.now(),
      };
      isRevealModalOpen = true;
      lastActionMessage = 'Reveal completed and artifact added to collection.';
      return;
    }

    lastActionMessage = `Reveal failed: ${formatFailureReason(result.reason)}.`;
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

  function buildStageProgress(
    progressResult: typeof selectedProgress,
    stageThresholds: readonly number[] | null,
  ): {
    stageLabel: string;
    percentage: number;
    remainingLabel: string;
    rangeLabel: string;
  } | null {
    if (!progressResult?.ok) {
      return null;
    }

    const view = progressResult.view;
    const stageLabel = `Stage ${view.currentStage} / ${view.stageCount}`;

    if (view.isCompleted) {
      return {
        stageLabel,
        percentage: 100,
        remainingLabel: 'Mineral fully refined. Reveal its artifact.',
        rangeLabel: 'Final stage completed.',
      };
    }

    const thresholds = stageThresholds ?? [];
    const currentStageStart =
      view.currentStage <= 0 ? 0 : (thresholds[view.currentStage - 1] ?? 0);
    const nextStageThreshold = thresholds[view.currentStage] ?? view.nextThreshold ?? currentStageStart;
    const span = Math.max(1, nextStageThreshold - currentStageStart);
    const progressed = Math.min(
      span,
      Math.max(0, view.workedMinutes - currentStageStart),
    );
    const percentage = Math.round((progressed / span) * 100);
    const remainingLabel =
      view.remainingMinutesToNextStage === null
        ? 'Next stage threshold unavailable.'
        : `${view.remainingMinutesToNextStage} min remaining to next stage`;

    return {
      stageLabel,
      percentage,
      remainingLabel,
      rangeLabel: `${progressed} of ${span} stage minutes completed`,
    };
  }

  function formatRarityLabel(rarity: RevealRarity): string {
    if (rarity === 'epic') {
      return 'Epic';
    }

    if (rarity === 'rare') {
      return 'Rare';
    }

    return 'Common';
  }

  function getRarityClass(rarity: RevealRarity): string {
    return `reveal-rarity-${rarity}`;
  }

  function closeRevealModal(): void {
    isRevealModalOpen = false;
  }

  async function handleGoToCollection(): Promise<void> {
    isRevealModalOpen = false;
    await goto('/vault');
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
    />

    <section aria-labelledby="running-controls-heading" class="running-cancel-panel">
      <h2 id="running-controls-heading">Ritual Control</h2>
      <Button variant="primary" on:click={handleCancelRitual}>Cancel current ritual</Button>
      <p class="hint-text">Canceling interrupts the ritual and applies no progress.</p>
    </section>
  {:else}
    <section aria-labelledby="ritual-status-heading" class="idle-status">
      <h2 id="ritual-status-heading">Ritual Status</h2>
      <p class="timer-status">{timerStatusText}</p>
    </section>
  {/if}

  <section class="primary-panel">
    {#if selectedMineral === null}
      {#if hasInventory}
        <p>No active mineral is currently available for ritual.</p>
        <p class="hint-text">Open Vault to select one manually, or use Ritual Slots for quick access.</p>
      {:else}
        <p>No minerals yet. Your first step is to buy one in Workshop.</p>
        <p class="hint-text">Once purchased, it becomes your active ritual target automatically.</p>
        <p><a class="empty-state-link" href="/workshop">Go to Workshop</a></p>
      {/if}
    {:else if selectedProgress?.ok && stageProgress}
      <RitualMineralHero
        mineralName={selectedMineralName}
        mineralDescription={selectedMineralDescription}
        mineralId={selectedMineral.id}
        stageLabel={stageProgress.stageLabel}
        workedMinutes={selectedProgress.view.workedMinutes}
        nextThreshold={selectedProgress.view.nextThreshold}
        progressPercentage={stageProgress.percentage}
        progressAriaLabel={stageProgress.rangeLabel}
        progressMessage={stageProgress.remainingLabel}
        isCompleted={selectedProgress.view.isCompleted}
        isRunning={ritualIsRunning}
      />
      {#if !ritualIsRunning}
        <MineralMediaPanel
          materialType={selectedProgress.view.materialType}
          materialName={selectedMineralName}
          visualThemeHint={selectedMineralThemeHint}
        />
      {/if}

      {#if ritualIsRunning}
        <section aria-labelledby="running-secondary-heading" class="secondary-controls-panel secondary-panel">
          <h3 id="running-secondary-heading">Secondary Controls</h3>

          <section aria-labelledby="ritual-setup-heading" class="setup-panel">
            <h4 id="ritual-setup-heading">Ritual Setup (Locked)</h4>
            <p class="hint-text">
              A ritual is active. Duration choice and mineral switching are temporarily disabled.
            </p>
          </section>

          <section aria-labelledby="reveal-heading" class="reveal-panel">
            <h4 id="reveal-heading">Reveal</h4>
            <Button
              variant="secondary"
              disabled={!isSelectedCompleted || ritualIsRunning}
              on:click={handleRevealSelectedMineral}
            >
              Reveal artifact
            </Button>
            <p class="hint-text">
              Ritual running ({ritualRuntime.durationMinutes} min). Reveal becomes available when the ritual
              ends.
            </p>
          </section>
        </section>
      {:else}
        <section aria-labelledby="ritual-actions-heading" class="ritual-action-panel">
          <h3 id="ritual-actions-heading">Ritual Action</h3>
          <RitualDurationPicker
            selectedDurationMinutes={selectedDurationMinutes}
            isPickerOpen={isDurationPickerOpen}
            isBeginDisabled={isSelectedCompleted}
            presets={RITUAL_DURATION_PRESETS}
            onBegin={handleBeginRitual}
            onTogglePicker={toggleDurationPicker}
            onSelectPreset={selectDurationPreset}
          />

          <section aria-labelledby="reveal-heading" class="reveal-panel">
            <h4 id="reveal-heading">Reveal</h4>
            <Button
              variant="secondary"
              disabled={!isSelectedCompleted || ritualIsRunning}
              on:click={handleRevealSelectedMineral}
            >
              Reveal artifact
            </Button>
            {#if isSelectedCompleted}
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
        </section>
      {/if}

      {#if latestReveal}
        <section aria-labelledby="latest-reveal-heading" aria-live="polite" class="reveal-moment-panel">
          <h3 id="latest-reveal-heading">Latest Revelation</h3>
          <p class="reveal-kicker">Artifact added to collection</p>
          <p class="reveal-artifact-name">{latestReveal.artifactName}</p>
          <p class={`reveal-rarity ${getRarityClass(latestReveal.rarity)}`}>
            {formatRarityLabel(latestReveal.rarity)}
          </p>
          <dl class="reveal-meta">
            <div>
              <dt>Source Material</dt>
              <dd>{latestReveal.materialLabel}</dd>
            </div>
            <div>
              <dt>Collection Total</dt>
              <dd>{latestReveal.collectionCount}</dd>
            </div>
            <div>
              <dt>Revealed At</dt>
              <dd>{new Date(latestReveal.revealedAt).toLocaleTimeString()}</dd>
            </div>
          </dl>
        </section>
      {/if}

      {#if dev}
        <details class="dev-tools-panel">
          <summary>Developer tools</summary>
          <div class="dev-tools-body">
            <p class="hint-text">Development only.</p>
            <Button variant="secondary" on:click={handleCompleteInstantDebug}>
              Instant complete ritual
            </Button>
          </div>
        </details>
      {/if}
    {:else if selectedProgress && !selectedProgress.ok}
      <p>Unable to compute selected mineral progress: {selectedProgress.reason}</p>
    {:else}
      <p>Unable to compute selected mineral progress.</p>
    {/if}
  </section>

  {#if hasInventory}
    <div class:secondary-panel={ritualIsRunning} class:secondary-controls-panel={ritualIsRunning}>
      <RitualSlotsPanel slots={ritualSlotItems} onSelectSlot={handleSelectRitualSlot} />
    </div>
  {/if}

  {#if lastActionMessage}
    <section aria-labelledby="last-action-heading" class="last-action-panel">
      <h2 id="last-action-heading">Recent update</h2>
      <p>{lastActionMessage}</p>
    </section>
  {/if}
</section>

<ArtifactRevealModal
  open={isRevealModalOpen}
  reveal={latestReveal}
  onClose={closeRevealModal}
  onGoToCollection={handleGoToCollection}
/>

<style>
  .panel {
    background: var(--color-surface);
    border: var(--surface-border);
    border-radius: var(--surface-radius-md);
    padding: var(--surface-padding-md);
  }

  .ritual-panel {
    display: grid;
    gap: var(--surface-gap-md);
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
  .running-cancel-panel,
  .primary-panel,
  .last-action-panel,
  .setup-panel,
  .reveal-panel,
  .reveal-moment-panel {
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    padding: var(--surface-padding-sm);
    display: grid;
    gap: var(--surface-gap-sm);
    background: var(--color-background);
  }

  .running-cancel-panel,
  .ritual-action-panel,
  .secondary-controls-panel {
    display: grid;
    gap: var(--surface-gap-sm);
  }

  .running-cancel-panel :global(button) {
    width: 100%;
  }

  .secondary-controls-panel h3,
  .ritual-action-panel h3,
  .reveal-panel h4,
  .setup-panel h4 {
    margin: 0;
    line-height: 1.2;
  }

  .dev-tools-panel {
    border: 1px dashed var(--color-border);
    border-radius: var(--surface-radius-sm);
    background: var(--color-background);
    padding: var(--space-1) var(--space-2);
  }

  .dev-tools-panel summary {
    cursor: pointer;
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--color-muted-text);
  }

  .dev-tools-body {
    display: grid;
    gap: var(--space-1);
    margin-top: var(--space-1);
  }

  .reveal-moment-panel {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border-color: #a3b2c7;
    gap: var(--space-1);
  }

  .reveal-kicker {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--color-muted-text);
  }

  .reveal-artifact-name {
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.3;
  }

  .reveal-rarity {
    width: fit-content;
    border: 1px solid var(--color-border);
    border-radius: var(--chip-radius);
    padding: var(--chip-padding-y) var(--chip-padding-x);
    font-size: var(--chip-font-size);
    font-weight: var(--chip-font-weight);
  }

  .reveal-rarity-common {
    color: #374151;
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  .reveal-rarity-rare {
    color: #1d4ed8;
    background: #dbeafe;
    border-color: #93c5fd;
  }

  .reveal-rarity-epic {
    color: #6d28d9;
    background: #ede9fe;
    border-color: #c4b5fd;
  }

  .reveal-meta {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: 1fr;
  }

  .secondary-panel {
    opacity: 0.72;
  }

  .last-action-panel {
    background: var(--color-surface);
    color: var(--color-muted-text);
  }

  .empty-state-link {
    display: inline-flex;
    align-items: center;
    font-weight: 600;
  }

  @media (min-width: 40rem) {
    .reveal-meta {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>

<script lang="ts">
  import type { CollectionArtifactView } from '$lib/app/sanctuary';
  import {
    RITUAL_SLOT_LIMIT,
    getCollectionArtifactViews,
    getMaterialStageThresholds,
    getMineralProgressView,
    getShopMaterialStates,
  } from '$lib/app/sanctuary';
  import VaultCollectionPanel from '$lib/components/vault/VaultCollectionPanel.svelte';
  import VaultMaterialsPanel from '$lib/components/vault/VaultMaterialsPanel.svelte';
  import VaultViewSwitch from '$lib/components/vault/VaultViewSwitch.svelte';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';

  type ArtifactRarity = CollectionArtifactView['rarity'];

  interface CollectionGroup {
    rarity: ArtifactRarity;
    label: string;
    items: CollectionArtifactView[];
  }

  let vaultView: 'materials' | 'collection' = 'materials';
  let lastActionMessage = '';

  $: shopMaterials = getShopMaterialStates($sanctuaryStore);
  $: collectionArtifacts = getCollectionArtifactViews($sanctuaryStore);
  $: ritualIsRunning = $sanctuaryStore.ritualRuntime.isRunning;
  $: ritualSlotMineralIds = $sanctuaryStore.ritualSlotMineralIds;
  $: ritualSlotLimitReached = ritualSlotMineralIds.length >= RITUAL_SLOT_LIMIT;
  $: inventoryRows = $sanctuaryStore.inventory.map((mineral) => {
    const progress = getMineralProgressView(mineral);
    const compactStageProgress = buildCompactStageProgress(progress);

    return {
      mineralId: mineral.id,
      shortMineralId: formatMineralId(mineral.id),
      materialLabel: getMaterialLabel(mineral.materialType),
      workedMinutes: mineral.workedMinutes,
      stageLabel: getStageLabel(progress),
      remainingToNextStageLabel: getRemainingStageLabel(progress),
      progressPercent: compactStageProgress?.percentage ?? null,
      progressText: compactStageProgress?.remainingText ?? 'Progress unavailable',
      progressAriaLabel: compactStageProgress?.ariaLabel ?? 'Progress unavailable',
      isCompleted: compactStageProgress?.isCompleted ?? false,
      slotStateLabel: ritualSlotMineralIds.includes(mineral.id) ? 'Slotted' : 'Not slotted',
      isSelected: $sanctuaryStore.selectedMineralId === mineral.id,
      isSlotted: ritualSlotMineralIds.includes(mineral.id),
    };
  });
  $: selectedMineralRow = inventoryRows.find((row) => row.isSelected) ?? null;
  $: selectedMineralShortId = selectedMineralRow ? selectedMineralRow.shortMineralId : null;
  $: collectionGroups = buildCollectionGroups(collectionArtifacts);

  function handleChangeView(view: 'materials' | 'collection'): void {
    vaultView = view;
  }

  function getMaterialLabel(materialType: (typeof shopMaterials)[number]['type']): string {
    const material = shopMaterials.find((entry) => entry.type === materialType);
    return material ? material.name : materialType;
  }

  function getStageLabel(progress: ReturnType<typeof getMineralProgressView>): string {
    if (!progress.ok) {
      return 'unavailable';
    }

    return `${progress.view.currentStage} / ${progress.view.stageCount}`;
  }

  function buildCollectionGroups(artifacts: CollectionArtifactView[]): CollectionGroup[] {
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

  function getRemainingStageLabel(progress: ReturnType<typeof getMineralProgressView>): string {
    if (!progress.ok || progress.view.remainingMinutesToNextStage === null) {
      return 'none';
    }

    return `${progress.view.remainingMinutesToNextStage} min`;
  }

  function buildCompactStageProgress(progress: ReturnType<typeof getMineralProgressView>): {
    percentage: number;
    remainingText: string;
    ariaLabel: string;
    isCompleted: boolean;
  } | null {
    if (!progress.ok) {
      return null;
    }

    const view = progress.view;
    if (view.isCompleted) {
      return {
        percentage: 100,
        remainingText: 'Reveal ready',
        ariaLabel: 'Mineral fully refined and ready to reveal',
        isCompleted: true,
      };
    }

    const thresholds = getMaterialStageThresholds(view.materialType);
    const stageStart = view.currentStage <= 0 ? 0 : (thresholds[view.currentStage - 1] ?? 0);
    const stageEnd = thresholds[view.currentStage] ?? view.nextThreshold ?? stageStart;
    const span = Math.max(1, stageEnd - stageStart);
    const progressed = Math.min(span, Math.max(0, view.workedMinutes - stageStart));
    const percentage = Math.round((progressed / span) * 100);
    const remainingText =
      view.remainingMinutesToNextStage === null
        ? 'Remaining time unavailable'
        : `${view.remainingMinutesToNextStage} min remaining`;

    return {
      percentage,
      remainingText,
      ariaLabel: `${view.currentStage} of ${view.stageCount} stages, ${remainingText}`,
      isCompleted: false,
    };
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

  <VaultViewSwitch view={vaultView} onChangeView={handleChangeView} />

  {#if vaultView === 'materials'}
    <VaultMaterialsPanel
      rows={inventoryRows}
      selectedMineralShortId={selectedMineralShortId}
      ritualSlotCount={ritualSlotMineralIds.length}
      ritualSlotLimit={RITUAL_SLOT_LIMIT}
      ritualIsRunning={ritualIsRunning}
      ritualSlotLimitReached={ritualSlotLimitReached}
      onSelectMineral={handleSelectMineral}
      onAddRitualSlot={handleAddRitualSlot}
      onRemoveRitualSlot={handleRemoveRitualSlot}
    />
  {:else}
    <VaultCollectionPanel
      artifacts={collectionArtifacts}
      groups={collectionGroups}
      hasActionableMinerals={inventoryRows.length > 0}
    />
  {/if}

  {#if lastActionMessage}
    <section aria-labelledby="last-action-heading" class="last-action-panel">
      <h2 id="last-action-heading">Recent update</h2>
      <p>{lastActionMessage}</p>
    </section>
  {/if}
</section>

<style>
  .panel {
    background: var(--color-surface);
    border: var(--surface-border);
    border-radius: var(--surface-radius-md);
    padding: var(--surface-padding-md);
  }

  .vault-panel {
    display: grid;
    gap: var(--surface-gap-md);
  }

  h1,
  h2 {
    margin: 0;
    line-height: 1.2;
  }

  p {
    margin: 0;
  }

  .section-intro {
    color: var(--color-muted-text);
  }

  .last-action-panel {
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    background: var(--color-surface);
    color: var(--color-muted-text);
    padding: var(--surface-padding-sm);
    display: grid;
    gap: var(--surface-gap-sm);
  }
</style>

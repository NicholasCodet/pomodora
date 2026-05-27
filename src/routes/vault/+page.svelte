<script lang="ts">
  import type { CollectionArtifactView } from '$lib/app/sanctuary';
  import {
    RITUAL_SLOT_LIMIT,
    getCollectionArtifactViews,
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

    return {
      mineralId: mineral.id,
      shortMineralId: formatMineralId(mineral.id),
      materialLabel: getMaterialLabel(mineral.materialType),
      workedMinutes: mineral.workedMinutes,
      stageLabel: getStageLabel(progress),
      remainingToNextStageLabel: getRemainingStageLabel(progress),
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
    <VaultCollectionPanel artifacts={collectionArtifacts} groups={collectionGroups} />
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
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
  }
</style>

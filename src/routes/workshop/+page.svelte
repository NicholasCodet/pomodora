<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import MaterialPreviewCard from '$lib/components/materials/MaterialPreviewCard.svelte';
  import { getMaterialPresentation, getShopMaterialStates } from '$lib/app/sanctuary';
  import { sanctuaryStore } from '$lib/stores/sanctuaryStore';
  import type { MaterialType } from '../../core/models';

  let lastActionMessage = '';
  let selectedMaterialType: MaterialType | null = null;

  $: shopMaterials = getShopMaterialStates($sanctuaryStore);
  $: materialPresentationByType = Object.fromEntries(
    shopMaterials.map((material) => [material.type, getMaterialPresentation(material.type)]),
  );
  $: if (selectedMaterialType === null && shopMaterials.length > 0) {
    selectedMaterialType = shopMaterials[0].type;
  }
  $: if (
    selectedMaterialType !== null &&
    !shopMaterials.some((material) => material.type === selectedMaterialType)
  ) {
    selectedMaterialType = shopMaterials[0]?.type ?? null;
  }
  $: selectedMaterial =
    selectedMaterialType === null
      ? null
      : (shopMaterials.find((material) => material.type === selectedMaterialType) ?? null);
  $: otherMaterials = shopMaterials.filter((material) => material.type !== selectedMaterialType);
  $: currentEssence = $sanctuaryStore.player.essence;
  $: inventory = $sanctuaryStore.inventory;
  $: isFirstRun = inventory.length === 0;
  $: ownedByType = inventory.reduce<Record<string, number>>((counts, mineral) => {
    counts[mineral.materialType] = (counts[mineral.materialType] ?? 0) + 1;
    return counts;
  }, {});

  function getShopStateLabel(material: (typeof shopMaterials)[number]): string {
    if (material.canPurchase) {
      return 'Available';
    }

    if (material.blockedReason === 'material_locked') {
      return 'Locked';
    }

    if (material.blockedReason === 'insufficient_essence') {
      return 'Insufficient Essence';
    }

    return 'Unavailable';
  }

  function getOwnedCountLabel(materialType: (typeof shopMaterials)[number]['type']): string {
    const ownedCount = ownedByType[materialType] ?? 0;
    return ownedCount === 0 ? 'Owned: none yet' : `Owned: ${ownedCount}`;
  }

  function getShopStateHint(material: (typeof shopMaterials)[number]): string {
    if (material.canPurchase) {
      return 'Ready now. Buying sets this mineral as your active ritual target.';
    }

    if (material.blockedReason === 'material_locked') {
      return 'Locked by progression. Complete more rituals to unlock this tier.';
    }

    if (material.blockedReason === 'insufficient_essence') {
      const missingEssence = Math.max(0, material.cost - currentEssence);
      return `Need ${missingEssence} more Essence to begin this tier.`;
    }

    return 'This material is not purchasable right now.';
  }

  function getStatusClass(material: (typeof shopMaterials)[number]): string {
    if (material.canPurchase) {
      return 'status-available';
    }

    if (material.blockedReason === 'material_locked') {
      return 'status-locked';
    }

    return 'status-blocked';
  }

  function getToneClass(materialType: (typeof shopMaterials)[number]['type']): string {
    if (materialType === 'clay') {
      return 'material-clay';
    }

    if (materialType === 'limestone') {
      return 'material-limestone';
    }

    return 'material-marble';
  }

  function handleBuyMaterial(materialType: (typeof shopMaterials)[number]['type']): void {
    const result = sanctuaryStore.buyMineral(materialType);
    lastActionMessage = result.ok
      ? `Bought and selected ${result.material.name}.`
      : `Buy failed: ${formatFailureReason(result.reason)}.`;
  }

  function handleSelectMaterial(materialType: MaterialType): void {
    selectedMaterialType = materialType;
  }

  function formatFailureReason(reason: string): string {
    return reason.replaceAll('_', ' ');
  }
</script>

<svelte:head>
  <title>Workshop | Pomodora Sanctuary</title>
</svelte:head>

<section aria-labelledby="workshop-heading" class="panel workshop-panel">
  <header>
    <h1 id="workshop-heading">Workshop</h1>
    <p class="section-intro">Buy minerals with Essence to prepare future rituals.</p>
  </header>

  {#if isFirstRun}
    <section aria-labelledby="first-step-heading" class="first-step-panel">
      <h2 id="first-step-heading">First step</h2>
      <p>Buy your first mineral to begin ritual progression.</p>
    </section>
  {/if}

  <section aria-labelledby="selected-material-heading" class="materials-panel">
    <h2 id="selected-material-heading">Selected Material</h2>
    {#if selectedMaterial}
      <p class="selection-state-text">
        Currently selected: <strong>{materialPresentationByType[selectedMaterial.type].displayName}</strong>
      </p>
      <article class={`material-card selected-material-card ${getToneClass(selectedMaterial.type)}`}>
        <MaterialPreviewCard
          displayName={materialPresentationByType[selectedMaterial.type].displayName}
          shortDescription={materialPresentationByType[selectedMaterial.type].shortDescription}
          artifactFamily={materialPresentationByType[selectedMaterial.type].artifactFamily}
          visualThemeHint={materialPresentationByType[selectedMaterial.type].visualThemeHint}
        />
        <p class="material-profile">{materialPresentationByType[selectedMaterial.type].refinementProfile}</p>

        <section aria-labelledby="acquisition-heading" class="acquisition-panel">
          <h3 id="acquisition-heading">Acquisition</h3>
          <p class="material-state">
            <span class={`state-badge ${getStatusClass(selectedMaterial)}`}>
              {#if selectedMaterial.canPurchase}
                <span class="badge-with-icon"><Icon name="check" size={13} />{getShopStateLabel(selectedMaterial)}</span>
              {:else if selectedMaterial.blockedReason === 'insufficient_essence'}
                <span class="badge-with-icon"><Icon name="essence" size={13} />{getShopStateLabel(selectedMaterial)}</span>
              {:else if selectedMaterial.blockedReason === 'material_locked'}
                <span class="badge-with-icon"><Icon name="lock" size={13} />{getShopStateLabel(selectedMaterial)}</span>
              {:else}
                {getShopStateLabel(selectedMaterial)}
              {/if}
            </span>
            <span class="state-hint">{getShopStateHint(selectedMaterial)}</span>
          </p>

          <dl class="material-meta">
            <div>
              <dt>Cost</dt>
              <dd class="cost-value">
                <span class="badge-with-icon"><Icon name="essence" size={13} />{selectedMaterial.cost} Essence</span>
              </dd>
            </div>
            <div>
              <dt>Ownership</dt>
              <dd>{getOwnedCountLabel(selectedMaterial.type)}</dd>
            </div>
          </dl>

          <div class="action-row">
            <Button
              variant={selectedMaterial.canPurchase ? 'primary' : 'secondary'}
              disabled={!selectedMaterial.canPurchase}
              on:click={() => handleBuyMaterial(selectedMaterial.type)}
            >
              Buy {selectedMaterial.name}
            </Button>
            <p class="action-hint">
              {#if selectedMaterial.blockedReason === 'material_locked'}
                Unlock required before purchase.
              {:else if selectedMaterial.blockedReason === 'insufficient_essence'}
                Earn more Essence through rituals.
              {:else}
                Buying immediately sets this as your active mineral.
              {/if}
            </p>
          </div>
        </section>
      </article>
    {:else}
      <p>No material available for selection.</p>
    {/if}
  </section>

  <section aria-labelledby="other-materials-heading" class="materials-panel">
    <h2 id="other-materials-heading">Other Materials</h2>
    {#if otherMaterials.length === 0}
      <p>All available materials are currently focused above.</p>
    {:else}
      <ul class="material-list other-material-list">
        {#each otherMaterials as material}
          <li>
            <article class={`material-card material-option-card ${getToneClass(material.type)}`}>
              <header class="option-header">
                <h3>{materialPresentationByType[material.type].displayName}</h3>
                <p class="state-hint">{materialPresentationByType[material.type].shortDescription}</p>
              </header>

              <p class="material-state">
                <span class={`state-badge ${getStatusClass(material)}`}>
                  {#if material.canPurchase}
                    <span class="badge-with-icon"><Icon name="check" size={13} />{getShopStateLabel(material)}</span>
                  {:else if material.blockedReason === 'insufficient_essence'}
                    <span class="badge-with-icon"><Icon name="essence" size={13} />{getShopStateLabel(material)}</span>
                  {:else if material.blockedReason === 'material_locked'}
                    <span class="badge-with-icon"><Icon name="lock" size={13} />{getShopStateLabel(material)}</span>
                  {:else}
                    {getShopStateLabel(material)}
                  {/if}
                </span>
              </p>

              <Button variant="secondary" on:click={() => handleSelectMaterial(material.type)}>
                Select {materialPresentationByType[material.type].displayName}
              </Button>
            </article>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

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

  .workshop-panel {
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

  .section-intro,
  .state-hint,
  .action-hint {
    color: var(--color-muted-text);
  }

  .materials-panel,
  .first-step-panel,
  .last-action-panel {
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    background: var(--color-background);
    padding: var(--surface-padding-sm);
    display: grid;
    gap: var(--surface-gap-sm);
  }

  .first-step-panel {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  }

  .material-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-2);
  }

  .material-card {
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    background: var(--color-surface);
    padding: var(--surface-padding-sm);
    display: grid;
    gap: var(--surface-gap-sm);
  }

  .selection-state-text {
    color: var(--color-muted-text);
  }

  .selected-material-card {
    gap: var(--surface-gap-md);
  }

  .acquisition-panel {
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    padding: var(--surface-padding-sm);
    background: var(--color-background);
    display: grid;
    gap: var(--surface-gap-sm);
  }

  .option-header {
    display: grid;
    gap: 0.2rem;
  }

  .material-option-card {
    gap: var(--surface-gap-sm);
  }

  .material-clay {
    border-color: #94a3b8;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  }

  .material-limestone {
    border-color: #64748b;
    background: linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%);
  }

  .material-marble {
    border-color: #334155;
    background: linear-gradient(180deg, #ffffff 0%, #eef2f7 100%);
  }

  .material-profile {
    color: var(--color-muted-text);
    font-size: 0.88rem;
    font-weight: 600;
  }

  .material-state {
    display: grid;
    gap: 0.35rem;
  }

  .material-meta {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .material-meta dt {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-muted-text);
  }

  .material-meta dd {
    margin: 0.2rem 0 0;
    font-size: 0.92rem;
    font-weight: 700;
  }

  .cost-value {
    font-weight: 700;
  }

  .badge-with-icon {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .action-row {
    display: grid;
    gap: 0.5rem;
  }

  .state-badge {
    display: inline-block;
    width: fit-content;
    border: 1px solid var(--color-border);
    border-radius: var(--chip-radius);
    padding: var(--chip-padding-y) var(--chip-padding-x);
    font-size: var(--chip-font-size);
    font-weight: var(--chip-font-weight);
  }

  .status-available {
    background: #d1fae5;
    border-color: #6ee7b7;
    color: #065f46;
  }

  .status-locked {
    background: #e5e7eb;
    border-color: #9ca3af;
    color: #374151;
  }

  .status-blocked {
    background: #fef3c7;
    border-color: #f59e0b;
    color: #92400e;
  }

  .material-card :global(button) {
    width: 100%;
  }

  .action-hint {
    font-size: 0.88rem;
  }

  .last-action-panel {
    background: var(--color-surface);
    color: var(--color-muted-text);
  }

  @media (min-width: 40rem) {
    .material-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .material-card :global(button) {
      width: auto;
      justify-self: start;
    }
  }
</style>

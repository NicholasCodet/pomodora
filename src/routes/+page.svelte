<script lang="ts">
  import type { PageData } from './$types';
  import ShopMaterialTable from '$lib/components/ShopMaterialTable.svelte';

  export let data: PageData;
</script>

<svelte:head>
  <title>Pomodora Sanctuary</title>
</svelte:head>

<main>
  <header>
    <h1>Pomodora Sanctuary</h1>
    <p>Read-only SvelteKit snapshot powered by the TypeScript domain layer.</p>
  </header>

  <section aria-labelledby="summary-heading">
    <h2 id="summary-heading">Player Summary</h2>
    <dl class="summary-grid">
      <div>
        <dt>Essence</dt>
        <dd>{data.summary.essence}</dd>
      </div>
      <div>
        <dt>Completed Rituals</dt>
        <dd>{data.summary.completedRituals}</dd>
      </div>
      <div>
        <dt>Total Worked Minutes</dt>
        <dd>{data.summary.totalWorkedMinutes}</dd>
      </div>
      <div>
        <dt>Unlocked Materials</dt>
        <dd>{data.summary.unlockedMaterialTypes.join(', ')}</dd>
      </div>
      <div>
        <dt>Collection Count</dt>
        <dd>{data.summary.collectionCount}</dd>
      </div>
      <div>
        <dt>Selected Mineral ID</dt>
        <dd>{data.summary.selectedMineralId ?? 'none'}</dd>
      </div>
    </dl>
  </section>

  <section aria-labelledby="shop-heading">
    <h2 id="shop-heading">Shop Material States</h2>
    <ShopMaterialTable materials={data.shopMaterials} />
  </section>

  <section aria-labelledby="selected-heading">
    <h2 id="selected-heading">Selected Mineral Progress</h2>

    {#if data.selectedMineral === null}
      <p>No mineral is currently selected.</p>
    {:else if data.selectedProgress?.ok}
      <dl class="summary-grid">
        <div>
          <dt>Material Type</dt>
          <dd>{data.selectedProgress.view.materialType}</dd>
        </div>
        <div>
          <dt>Stage</dt>
          <dd>{data.selectedProgress.view.currentStage} / {data.selectedProgress.view.stageCount}</dd>
        </div>
        <div>
          <dt>Worked Minutes</dt>
          <dd>{data.selectedProgress.view.workedMinutes}</dd>
        </div>
        <div>
          <dt>Next Threshold</dt>
          <dd>{data.selectedProgress.view.nextThreshold ?? 'none'}</dd>
        </div>
        <div>
          <dt>Remaining Minutes</dt>
          <dd>{data.selectedProgress.view.remainingMinutesToNextStage ?? 'none'}</dd>
        </div>
        <div>
          <dt>Completed</dt>
          <dd>{data.selectedProgress.view.isCompleted ? 'Yes' : 'No'}</dd>
        </div>
      </dl>
    {:else}
      <p>Unable to compute selected mineral progress: {data.selectedProgress?.reason}</p>
    {/if}
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Atkinson Hyperlegible', 'Segoe UI', sans-serif;
    background: #f8fafc;
    color: #111827;
  }

  main {
    margin: 0 auto;
    max-width: 72rem;
    padding: 1.5rem;
    display: grid;
    gap: 1.5rem;
  }

  header,
  section {
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  h1,
  h2 {
    margin: 0 0 0.75rem;
    line-height: 1.2;
  }

  p {
    margin: 0;
  }

  .summary-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  }

  .summary-grid div {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    padding: 0.75rem;
  }

  dt {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  dd {
    margin: 0.25rem 0 0;
    font-size: 1rem;
  }
</style>

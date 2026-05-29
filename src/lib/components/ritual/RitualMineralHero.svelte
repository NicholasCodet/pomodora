<script lang="ts">
  export let mineralName: string;
  export let mineralDescription: string | null = null;
  export let mineralId: string;
  export let stageLabel: string;
  export let workedMinutes: number;
  export let nextThreshold: number | null;
  export let progressPercentage: number;
  export let progressAriaLabel: string;
  export let progressMessage: string;
  export let isCompleted: boolean;
  export let isRunning = false;
</script>

<section aria-labelledby="selected-mineral-heading" class:running={isRunning} class="mineral-hero">
  <header class="hero-header">
    <h2 id="selected-mineral-heading">Selected Mineral</h2>
    {#if isRunning}
      <p class="running-label">Currently refining</p>
    {/if}
    <p class="mineral-title">
      <strong>{mineralName}</strong>
      <span class="mineral-id">({mineralId})</span>
    </p>
    {#if mineralDescription}
      <p class="mineral-description">{mineralDescription}</p>
    {/if}
  </header>

  <dl class="meta-grid">
    <div>
      <dt>Stage</dt>
      <dd>{stageLabel}</dd>
    </div>
    <div>
      <dt>Worked Minutes</dt>
      <dd>{workedMinutes}</dd>
    </div>
    <div>
      <dt>Next Threshold</dt>
      <dd>{nextThreshold ?? 'none'}</dd>
    </div>
  </dl>

  <section aria-labelledby="hero-progress-heading" class="progress-panel">
    <h3 id="hero-progress-heading">Refinement Progress</h3>
    <progress class="stage-progress-bar" value={progressPercentage} max="100" aria-label={progressAriaLabel}
    ></progress>
    <p class="stage-progress-percent">{progressPercentage}%</p>
    <p class="progress-message" data-completed={isCompleted}>{progressMessage}</p>
  </section>
</section>

<style>
  h2,
  h3 {
    margin: 0;
    line-height: 1.2;
  }

  p {
    margin: 0;
  }

  .mineral-hero {
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    padding: var(--surface-padding-sm);
    display: grid;
    gap: var(--surface-gap-sm);
    background: var(--color-background);
  }

  .hero-header {
    display: grid;
    gap: var(--space-1);
  }

  .mineral-title {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    align-items: baseline;
  }

  .mineral-id {
    color: var(--color-muted-text);
  }

  .mineral-description {
    color: var(--color-muted-text);
    font-size: 0.92rem;
  }

  .running-label {
    width: fit-content;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-muted-text);
  }

  .meta-grid {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

  .progress-panel {
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    padding: var(--surface-padding-sm);
    display: grid;
    gap: var(--surface-gap-sm);
    background: var(--color-surface);
  }

  .stage-progress-bar {
    width: 100%;
    height: 0.75rem;
  }

  .stage-progress-percent {
    font-size: 0.9rem;
    font-weight: 700;
  }

  .progress-message[data-completed='true'] {
    font-weight: 600;
  }

  .mineral-hero.running {
    padding: var(--space-2);
    gap: var(--space-2);
  }

  .mineral-hero.running .progress-panel {
    padding: var(--space-2);
  }

  @media (max-width: 24rem) {
    .meta-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

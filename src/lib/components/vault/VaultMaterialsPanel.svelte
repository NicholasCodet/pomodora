<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';

  interface VaultMaterialRowView {
    mineralId: string;
    shortMineralId: string;
    materialLabel: string;
    workedMinutes: number;
    stageLabel: string;
    remainingToNextStageLabel: string;
    progressPercent: number | null;
    progressText: string;
    progressAriaLabel: string;
    isCompleted: boolean;
    slotStateLabel: string;
    isSelected: boolean;
    isSlotted: boolean;
  }

  export let rows: VaultMaterialRowView[];
  export let selectedMineralShortId: string | null;
  export let ritualSlotCount: number;
  export let ritualSlotLimit: number;
  export let ritualIsRunning: boolean;
  export let ritualSlotLimitReached: boolean;
  export let onSelectMineral: (mineralId: string) => void;
  export let onAddRitualSlot: (mineralId: string) => void;
  export let onRemoveRitualSlot: (mineralId: string) => void;
</script>

<section aria-labelledby="materials-heading" class="content-panel materials-panel">
  <h2 id="materials-heading">Materials</h2>

  <dl class="summary-strip">
    <div>
      <dt>Actionable Minerals</dt>
      <dd>{rows.length}</dd>
    </div>
    <div>
      <dt>Active Mineral</dt>
      <dd>
        {#if selectedMineralShortId}
          <span class="inline-icon"><Icon name="check" size={14} />{selectedMineralShortId}</span>
        {:else}
          none
        {/if}
      </dd>
    </div>
    <div>
      <dt>Ritual Slots</dt>
      <dd>{ritualSlotCount}/{ritualSlotLimit}</dd>
    </div>
  </dl>

  {#if ritualIsRunning}
    <p class="hint-text">Selection is locked while a ritual is running.</p>
  {/if}
  {#if ritualSlotLimitReached}
    <p class="hint-text">Ritual Slots are full. Remove one to add another mineral.</p>
  {/if}

  {#if rows.length === 0}
    <p>No owned minerals yet.</p>
    <p class="hint-text">Purchased minerals will appear here for selection and slot assignment.</p>
    <p><a class="empty-state-link" href="/workshop">Go to Workshop</a></p>
  {:else}
    <ul class="card-list">
      {#each rows as row}
        <li>
          <article class="vault-card material-card">
            <header class="card-header">
              <h3>{row.materialLabel}</h3>
              <p class="hint-text"><code title={row.mineralId}>{row.shortMineralId}</code></p>
              <p class="status-badges">
                {#if row.isSelected}
                  <span class="status-chip status-active">
                    <span class="inline-icon"><Icon name="check" size={13} />Active</span>
                  </span>
                {/if}
                {#if row.isSlotted}
                  <span class="status-chip status-slot">In Ritual Slots</span>
                {/if}
              </p>
            </header>

            <dl class="meta-grid">
              <div>
                <dt>Worked Minutes</dt>
                <dd>{row.workedMinutes}</dd>
              </div>
              <div>
                <dt>Stage</dt>
                <dd>{row.stageLabel}</dd>
              </div>
              <div>
                <dt>Remaining to Next</dt>
                <dd>{row.remainingToNextStageLabel}</dd>
              </div>
              <div>
                <dt>Slot State</dt>
                <dd>{row.slotStateLabel}</dd>
              </div>
            </dl>

            <section class="card-progress" aria-label="Refinement progress">
              <p class="progress-stage">{row.stageLabel}</p>
              {#if row.progressPercent !== null}
                <progress
                  class="progress-bar"
                  value={row.progressPercent}
                  max="100"
                  aria-label={row.progressAriaLabel}
                ></progress>
                <p class={`progress-hint ${row.isCompleted ? 'progress-ready' : ''}`}>
                  {#if row.isCompleted}
                    Mineral fully refined. Reveal ready.
                  {:else}
                    {row.progressText}
                  {/if}
                </p>
              {:else}
                <p class="progress-hint">Progress unavailable</p>
              {/if}
            </section>

            <div class="card-actions" aria-label="Material actions">
              <Button
                variant={row.isSelected ? 'primary' : 'secondary'}
                disabled={row.isSelected || ritualIsRunning}
                on:click={() => onSelectMineral(row.mineralId)}
              >
                {row.isSelected ? 'Selected' : 'Select Active'}
              </Button>

              {#if row.isSlotted}
                <Button variant="secondary" on:click={() => onRemoveRitualSlot(row.mineralId)}>
                  Remove Slot
                </Button>
              {:else}
                <Button
                  variant="secondary"
                  disabled={ritualSlotLimitReached}
                  on:click={() => onAddRitualSlot(row.mineralId)}
                >
                  Add to Slots
                </Button>
              {/if}
            </div>
          </article>
        </li>
      {/each}
    </ul>
  {/if}
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

  .content-panel {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-background);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
  }

  .materials-panel {
    background: var(--color-background);
  }

  .hint-text {
    color: var(--color-muted-text);
  }

  .empty-state-link {
    display: inline-flex;
    align-items: center;
    font-weight: 600;
  }

  .summary-strip {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .summary-strip div {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    padding: var(--space-1) var(--space-2);
  }

  .summary-strip dt {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--color-muted-text);
  }

  .summary-strip dd {
    margin: 0.2rem 0 0;
    font-size: 0.95rem;
    font-weight: 700;
  }

  .card-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-2);
  }

  .vault-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
  }

  .material-card {
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  .card-header {
    display: grid;
    gap: 0.35rem;
  }

  .status-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .status-chip {
    display: inline-block;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    padding: 0.15rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .inline-icon {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
  }

  .status-active {
    background: #dbeafe;
    border-color: #93c5fd;
    color: #1e3a8a;
  }

  .status-slot {
    background: #ede9fe;
    border-color: #c4b5fd;
    color: #4c1d95;
  }

  .meta-grid {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .card-progress {
    border-top: 1px dashed var(--color-border);
    padding-top: var(--space-2);
    display: grid;
    gap: 0.35rem;
  }

  .progress-stage {
    font-size: 0.9rem;
    font-weight: 700;
  }

  .progress-bar {
    width: 100%;
    height: 0.6rem;
  }

  .progress-hint {
    font-size: 0.85rem;
    color: var(--color-muted-text);
  }

  .progress-ready {
    color: #1e3a8a;
    font-weight: 700;
  }

  dt {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-muted-text);
  }

  dd {
    margin: 0.2rem 0 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .card-actions {
    display: grid;
    gap: var(--space-2);
  }

  .card-actions :global(button) {
    width: 100%;
  }

  @media (min-width: 40rem) {
    .card-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .card-actions {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .card-actions :global(button) {
      width: auto;
    }
  }
</style>

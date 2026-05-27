<script lang="ts">
  import Button from '$lib/components/Button.svelte';

  export let selectedDurationMinutes: number;
  export let isPickerOpen: boolean;
  export let isBeginDisabled = false;
  export let presets: readonly number[] = [15, 30, 45];
  export let onBegin: () => void = () => {};
  export let onTogglePicker: () => void = () => {};
  export let onSelectPreset: (minutes: number) => void = () => {};
</script>

<section aria-labelledby="ritual-setup-heading" class="setup-panel">
  <h3 id="ritual-setup-heading">Start Ritual</h3>
  <p class="hint-text">Set your ritual duration, then begin your focus session.</p>

  <div class="ritual-actions ritual-actions--primary" aria-label="Ritual actions">
    <p class="duration-selected-text">Selected duration: {selectedDurationMinutes} min</p>
    <Button variant="primary" disabled={isBeginDisabled} on:click={onBegin}>Begin Ritual</Button>
  </div>

  <div class="ritual-actions ritual-actions--secondary" aria-label="Duration controls">
    <Button variant="secondary" on:click={onTogglePicker}>
      {isPickerOpen ? 'Close duration options' : 'Change duration'}
    </Button>
  </div>

  {#if isPickerOpen}
    <div class="duration-presets" role="group" aria-label="Duration presets">
      {#each presets as durationPreset}
        <button
          class="duration-option"
          class:duration-option-selected={selectedDurationMinutes === durationPreset}
          type="button"
          aria-pressed={selectedDurationMinutes === durationPreset}
          on:click={() => onSelectPreset(durationPreset)}
        >
          {durationPreset} min{selectedDurationMinutes === durationPreset ? ' (selected)' : ''}
        </button>
      {/each}
    </div>
  {/if}
</section>

<style>
  h3 {
    margin: 0 0 var(--space-2);
    line-height: 1.2;
  }

  p {
    margin: 0;
  }

  .setup-panel {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
    background: var(--color-background);
  }

  .hint-text {
    color: var(--color-muted-text);
  }

  .ritual-actions {
    display: grid;
    gap: var(--space-2);
  }

  .duration-selected-text {
    margin: 0;
    font-weight: 600;
  }

  .ritual-actions--secondary {
    grid-template-columns: 1fr;
  }

  .duration-presets {
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .duration-option {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    line-height: 1.2;
    min-height: 2.5rem;
    padding: 0.45rem var(--space-1);
    text-align: center;
  }

  .duration-option:hover {
    background: var(--color-secondary);
  }

  .duration-option:focus-visible {
    outline: 3px solid var(--color-primary-hover);
    outline-offset: 2px;
  }

  .duration-option-selected {
    border-color: var(--color-primary);
    background: #e6fffa;
  }

  .ritual-actions :global(button) {
    width: 100%;
  }

  @media (min-width: 40rem) {
    .ritual-actions--secondary {
      grid-template-columns: auto;
    }

    .ritual-actions :global(button) {
      width: auto;
    }
  }
</style>

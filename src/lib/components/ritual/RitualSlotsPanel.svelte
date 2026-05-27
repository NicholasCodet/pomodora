<script lang="ts">
  import Button from '$lib/components/Button.svelte';

  interface RitualSlotItemView {
    mineralId: string;
    materialLabel: string;
    progressLabel: string;
    isSelected: boolean;
    isDisabled: boolean;
  }

  export let slots: RitualSlotItemView[] = [];
  export let onSelectSlot: (mineralId: string) => void = () => {};
</script>

<section aria-labelledby="ritual-slots-heading" class="support-panel">
  <h2 id="ritual-slots-heading">Ritual Slots</h2>

  {#if slots.length === 0}
    <p>No Ritual Slots configured. Add them in Vault &gt; Materials.</p>
  {:else}
    <ul class="slot-list">
      {#each slots as slot}
        <li class="slot-item">
          <p>
            <strong>{slot.materialLabel}</strong>
            <span class="slot-meta">{slot.progressLabel}</span>
          </p>
          <Button
            variant={slot.isSelected ? 'primary' : 'secondary'}
            disabled={slot.isDisabled}
            on:click={() => onSelectSlot(slot.mineralId)}
          >
            {slot.isSelected ? 'Active' : 'Use for Ritual'}
          </Button>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  h2 {
    margin: 0 0 var(--space-2);
    line-height: 1.2;
  }

  p {
    margin: 0;
  }

  .support-panel {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
    background: var(--color-background);
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
    display: grid;
    gap: var(--space-2);
  }

  .slot-meta {
    display: block;
    margin-top: 0.25rem;
    color: var(--color-muted-text);
    font-size: 0.875rem;
  }

  .slot-item :global(button) {
    width: 100%;
  }

  @media (min-width: 40rem) {
    .slot-item {
      grid-template-columns: 1fr auto;
      align-items: center;
    }

    .slot-item :global(button) {
      width: auto;
    }
  }
</style>

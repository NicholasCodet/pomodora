<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';

  const TIMER_RING_RADIUS = 84;
  const TIMER_RING_CIRCUMFERENCE = 2 * Math.PI * TIMER_RING_RADIUS;

  export let remainingLabel: string;
  export let statusText: string;
  export let remainingMs: number;
  export let durationMinutes: number | null;
  export let onCancel: () => void = () => {};

  $: durationMs = durationMinutes ? durationMinutes * 60 * 1000 : 0;
  $: progressRatio =
    durationMs > 0 ? Math.min(1, Math.max(0, 1 - remainingMs / durationMs)) : 0;
  $: progressDashOffset =
    TIMER_RING_CIRCUMFERENCE - progressRatio * TIMER_RING_CIRCUMFERENCE;
</script>

<section aria-labelledby="countdown-heading" class="timer-hero">
  <h2 id="countdown-heading">
    <span class="heading-with-icon"><Icon name="timer" size={18} />Countdown</span>
  </h2>
  <div class="timer-display" role="status" aria-live="polite">
    <div class="timer-ring-shell" aria-hidden="true">
      <svg class="timer-ring" viewBox="0 0 200 200" focusable="false">
        <circle class="timer-track" cx="100" cy="100" r={TIMER_RING_RADIUS} />
        <circle
          class="timer-progress"
          cx="100"
          cy="100"
          r={TIMER_RING_RADIUS}
          style={`stroke-dasharray: ${TIMER_RING_CIRCUMFERENCE}; stroke-dashoffset: ${progressDashOffset};`}
        />
      </svg>
    </div>
    <p class="timer-value">{remainingLabel}</p>
  </div>
  <p class="timer-status">{statusText}</p>
  <Button variant="primary" on:click={onCancel}>Cancel current ritual</Button>
</section>

<style>
  h2 {
    margin: 0 0 var(--space-2);
    line-height: 1.2;
  }

  p {
    margin: 0;
  }

  .heading-with-icon {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .timer-hero {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
    background: var(--color-background);
    justify-items: center;
    text-align: center;
  }

  .timer-hero :global(button) {
    width: 100%;
    max-width: 16rem;
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
  }

  @media (min-width: 40rem) {
    .timer-hero :global(button) {
      width: auto;
    }
  }
</style>

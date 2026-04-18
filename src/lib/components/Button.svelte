<script lang="ts">
  export let variant: 'primary' | 'secondary' = 'primary';
  export let disabled = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
</script>

<button class={variant} {disabled} {type} on:click>
  <slot />
</button>

<style>
  button {
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    line-height: 1.2;
    padding: var(--space-1) var(--space-3);
    transition: background-color 0.15s ease;
  }

  button:focus-visible {
    outline: 3px solid var(--color-primary-hover);
    outline-offset: 2px;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .primary {
    background: var(--color-primary);
    color: #ffffff;
  }

  .primary:hover:not(:disabled) {
    background: var(--color-primary-hover);
  }

  .secondary {
    background: var(--color-secondary);
    color: var(--color-text);
    border-color: var(--color-border);
  }

  .secondary:hover:not(:disabled) {
    background: var(--color-secondary-hover);
  }
</style>

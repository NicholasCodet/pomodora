<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { getArtifactAsset } from '$lib/assets/artifactAssets';
  import Button from '$lib/components/Button.svelte';

  type RevealRarity = 'common' | 'rare' | 'epic';

  interface ArtifactRevealView {
    artifactId: string;
    artifactName: string;
    artifactCategory: string;
    artifactDescription: string;
    rarity: RevealRarity;
    materialLabel: string;
    collectionCount: number;
  }

  export let open = false;
  export let reveal: ArtifactRevealView | null = null;
  export let onClose: () => void = () => {};
  export let onGoToCollection: () => void | Promise<void> = () => {};

  let modalElement: HTMLDivElement | null = null;
  let isBodyScrollLocked = false;
  let previousBodyOverflow = '';
  let previousBodyTouchAction = '';
  let wasOpen = false;

  $: artifactIllustration = reveal === null ? null : getArtifactAsset(reveal.artifactId).illustration;
  $: if (open && !wasOpen) {
    lockBodyScroll();
    void focusModal();
    wasOpen = true;
  } else if (!open && wasOpen) {
    unlockBodyScroll();
    wasOpen = false;
  }

  onDestroy(() => {
    unlockBodyScroll();
  });

  function formatRarityLabel(rarity: RevealRarity): string {
    if (rarity === 'epic') {
      return 'Epic';
    }

    if (rarity === 'rare') {
      return 'Rare';
    }

    return 'Common';
  }

  function getRarityClass(rarity: RevealRarity): string {
    return `reveal-rarity-${rarity}`;
  }

  function handleBackdropPointerDown(event: PointerEvent): void {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && open) {
      onClose();
    }
  }

  function lockBodyScroll(): void {
    if (isBodyScrollLocked || typeof document === 'undefined') {
      return;
    }

    previousBodyOverflow = document.body.style.overflow;
    previousBodyTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    isBodyScrollLocked = true;
  }

  function unlockBodyScroll(): void {
    if (!isBodyScrollLocked || typeof document === 'undefined') {
      return;
    }

    document.body.style.overflow = previousBodyOverflow;
    document.body.style.touchAction = previousBodyTouchAction;
    isBodyScrollLocked = false;
  }

  async function focusModal(): Promise<void> {
    await tick();
    modalElement?.focus();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open && reveal}
  <div class="modal-backdrop" role="presentation" on:pointerdown={handleBackdropPointerDown}>
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-modal-heading"
      class="reveal-modal"
      tabindex="-1"
      bind:this={modalElement}
      on:pointerdown|stopPropagation
    >
      <h2 id="reveal-modal-heading">Artifact revealed</h2>
      <section aria-label={`${reveal.artifactName} visual`} class="reveal-modal-visual">
        {#if artifactIllustration}
          <div class="reveal-modal-visual-surface reveal-modal-visual-filled">
            <img
              src={artifactIllustration}
              alt={`${reveal.artifactName} artifact visual`}
              loading="lazy"
            />
          </div>
        {:else}
          <div class="reveal-modal-visual-surface reveal-modal-visual-placeholder">
            <p class="placeholder-kicker">Visual pending</p>
            <p class="hint-text">Future artwork or 3D presentation will appear here.</p>
          </div>
        {/if}
      </section>
      <p class="reveal-artifact-name">{reveal.artifactName}</p>
      <p class={`reveal-rarity ${getRarityClass(reveal.rarity)}`}>
        {formatRarityLabel(reveal.rarity)}
      </p>
      <dl class="reveal-meta">
        <div>
          <dt>Source Material</dt>
          <dd>{reveal.materialLabel}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{reveal.artifactCategory}</dd>
        </div>
        <div>
          <dt>Collection</dt>
          <dd>{reveal.collectionCount} total</dd>
        </div>
      </dl>
      <p class="reveal-description">{reveal.artifactDescription}</p>
      <p class="hint-text reveal-collection-status">Added to Collection.</p>

      <div class="modal-actions">
        <Button variant="primary" on:click={onGoToCollection}>Go to Collection</Button>
        <Button variant="secondary" on:click={onClose}>Continue</Button>
      </div>
    </div>
  </div>
{/if}

<style>
  h2,
  p {
    margin: 0;
  }

  .hint-text {
    color: var(--color-muted-text);
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(15, 23, 42, 0.5);
    display: grid;
    place-items: center;
    padding:
      max(16px, env(safe-area-inset-top))
      max(16px, env(safe-area-inset-right))
      max(16px, env(safe-area-inset-bottom))
      max(16px, env(safe-area-inset-left));
  }

  .reveal-modal {
    box-sizing: border-box;
    border: 1px solid #a3b2c7;
    border-radius: var(--surface-radius-md);
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    padding: var(--surface-padding-sm);
    display: grid;
    gap: var(--space-1);
    width: min(calc(100vw - 32px), 23.75rem);
    max-height: calc(100dvh - 32px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    overflow-y: auto;
    overflow-x: hidden;
    margin: 0;
  }

  .reveal-modal-visual {
    display: grid;
    gap: var(--space-1);
  }

  .reveal-modal-visual-surface {
    min-height: 9rem;
    aspect-ratio: 1 / 1;
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    background: var(--color-background);
    box-sizing: border-box;
    display: grid;
    place-items: center;
    overflow: hidden;
    padding: clamp(var(--space-2), 8%, var(--space-4));
    text-align: center;
  }

  .reveal-modal-visual-filled {
    background: linear-gradient(180deg, #ffffff 0%, #eef2f7 100%);
  }

  .reveal-modal-visual-placeholder {
    min-height: 7rem;
    aspect-ratio: 5 / 3;
    border-style: dashed;
    padding: var(--space-2);
  }

  .reveal-modal-visual-surface img {
    display: block;
    width: auto;
    height: auto;
    max-width: 88%;
    max-height: 88%;
    object-fit: contain;
  }

  .placeholder-kicker {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-muted-text);
  }

  .reveal-artifact-name {
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.3;
  }

  .reveal-rarity {
    width: fit-content;
    border: 1px solid var(--color-border);
    border-radius: var(--chip-radius);
    padding: var(--chip-padding-y) var(--chip-padding-x);
    font-size: var(--chip-font-size);
    font-weight: var(--chip-font-weight);
  }

  .reveal-rarity-common {
    color: #374151;
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  .reveal-rarity-rare {
    color: #1d4ed8;
    background: #dbeafe;
    border-color: #93c5fd;
  }

  .reveal-rarity-epic {
    color: #6d28d9;
    background: #ede9fe;
    border-color: #c4b5fd;
  }

  .reveal-meta {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: 1fr;
  }

  .reveal-description {
    color: var(--color-muted-text);
    font-size: 0.92rem;
    line-height: 1.45;
  }

  .reveal-collection-status {
    font-size: 0.88rem;
  }

  .modal-actions {
    display: grid;
    gap: var(--space-1);
  }

  .modal-actions :global(button) {
    width: 100%;
  }

  @media (min-width: 40rem) {
    .reveal-meta {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>

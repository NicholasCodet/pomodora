<script lang="ts">
  import { getArtifactAsset } from '$lib/assets/artifactAssets';
  import Button from '$lib/components/Button.svelte';

  type ArtifactRarity = 'common' | 'rare' | 'epic' | 'unknown';

  interface VaultCollectionArtifactView {
    artifactId: string;
    name: string;
    description: string;
    artifactCategory: string;
    rarity: ArtifactRarity;
    materialType: string;
    materialDisplayName: string;
    artifactFamily: string;
    visualThemeHint: string;
    sourceMineralId: string;
    discoveredAt: number;
  }

  interface VaultCollectionGroupView {
    key: string;
    familyName: string;
    materialName: string;
    visualThemeHint: string;
    items: VaultCollectionArtifactView[];
  }

  export let artifacts: VaultCollectionArtifactView[];
  export let groups: VaultCollectionGroupView[];
  export let hasActionableMinerals = false;
  let selectedArtifactKey: string | null = null;

  function formatDiscoveredDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }

  function formatDiscoveredDateTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
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

  function getRarityClass(rarity: ArtifactRarity): string {
    if (rarity === 'epic') {
      return 'rarity-epic';
    }

    if (rarity === 'rare') {
      return 'rarity-rare';
    }

    if (rarity === 'common') {
      return 'rarity-common';
    }

    return 'rarity-unknown';
  }

  function buildArtifactKey(artifact: VaultCollectionArtifactView): string {
    return `${artifact.artifactId}:${artifact.sourceMineralId}:${artifact.discoveredAt}`;
  }

  function toggleArtifactSelection(artifact: VaultCollectionArtifactView): void {
    const artifactKey = buildArtifactKey(artifact);
    selectedArtifactKey = selectedArtifactKey === artifactKey ? null : artifactKey;
  }

  function getArtifactIllustration(artifactId: string): string | null {
    return getArtifactAsset(artifactId).illustration;
  }
</script>

<section aria-labelledby="collection-heading" class="content-panel collection-panel">
  <h2 id="collection-heading">Collection</h2>
  <p class="section-intro">Artifacts revealed through completed rituals.</p>

  {#if artifacts.length === 0}
    <p>Your collection is empty for now.</p>
    <p class="hint-text">Complete and reveal minerals from Ritual to begin your archive.</p>
    {#if hasActionableMinerals}
      <p><a class="empty-state-link" href="/ritual">Go to Ritual</a></p>
    {/if}
  {:else}
    <div class="collection-groups">
      {#each groups as group}
        <section
          aria-labelledby={`family-${group.key}`}
          class="rarity-group"
          data-family-theme={group.visualThemeHint}
        >
          <header class="rarity-header">
            <div class="group-title">
              <h3 id={`family-${group.key}`}>{group.familyName}</h3>
              <p class="hint-text">Source material: {group.materialName}</p>
            </div>
            <p class="hint-text">{group.items.length} artifacts</p>
          </header>

          <ul class="artifact-list">
            {#each group.items as artifact}
              <li>
                <article
                  class={`vault-card artifact-card ${getRarityClass(artifact.rarity)} ${selectedArtifactKey === buildArtifactKey(artifact) ? 'artifact-card-expanded' : ''}`}
                >
                  <header class="card-header">
                    <h4>{artifact.name}</h4>
                    <p class="status-chip rarity-label">{getRarityLabel(artifact.rarity)}</p>
                  </header>

                  <dl class="meta-grid">
                    <div>
                      <dt>Source Material</dt>
                      <dd>{artifact.materialDisplayName}</dd>
                    </div>
                    <div>
                      <dt>Discovered</dt>
                      <dd>{formatDiscoveredDate(artifact.discoveredAt)}</dd>
                    </div>
                  </dl>

                  {#if selectedArtifactKey === buildArtifactKey(artifact)}
                    <section
                      aria-labelledby={`artifact-expanded-${buildArtifactKey(artifact)}`}
                      class="artifact-expanded-details"
                    >
                      <h5 id={`artifact-expanded-${buildArtifactKey(artifact)}`}>Expanded detail (selected)</h5>
                      <dl class="meta-grid expanded-meta">
                        <div>
                          <dt>Category</dt>
                          <dd>{artifact.artifactCategory}</dd>
                        </div>
                        <div>
                          <dt>Rarity</dt>
                          <dd>{getRarityLabel(artifact.rarity)}</dd>
                        </div>
                        <div>
                          <dt>Source Material</dt>
                          <dd>{artifact.materialDisplayName}</dd>
                        </div>
                        <div>
                          <dt>Discovered (exact)</dt>
                          <dd>{formatDiscoveredDateTime(artifact.discoveredAt)}</dd>
                        </div>
                      </dl>

                      <section
                        aria-labelledby={`artifact-description-${buildArtifactKey(artifact)}`}
                        class="artifact-description"
                      >
                        <h6 id={`artifact-description-${buildArtifactKey(artifact)}`}>Description</h6>
                        <p>{artifact.description}</p>
                      </section>

                      <section
                        aria-labelledby={`artifact-visual-${buildArtifactKey(artifact)}`}
                        class="artifact-visual"
                      >
                        <h6 id={`artifact-visual-${buildArtifactKey(artifact)}`}>Artifact visual</h6>
                        {#if getArtifactIllustration(artifact.artifactId)}
                          <div class="artifact-visual-surface artifact-visual-surface-filled">
                            <img
                              src={getArtifactIllustration(artifact.artifactId) ?? ''}
                              alt={`${artifact.name} artifact visual`}
                              loading="lazy"
                            />
                          </div>
                        {:else}
                          <div class="artifact-visual-surface artifact-visual-surface-placeholder">
                            <p class="placeholder-kicker">Visual pending</p>
                            <p class="hint-text">
                              Future artwork or 3D presentation will appear here.
                            </p>
                          </div>
                        {/if}
                      </section>
                    </section>
                  {/if}

                  <div class="card-actions">
                    <Button
                      variant={selectedArtifactKey === buildArtifactKey(artifact) ? 'primary' : 'secondary'}
                      on:click={() => toggleArtifactSelection(artifact)}
                    >
                      {#if selectedArtifactKey === buildArtifactKey(artifact)}
                        Inspecting (selected)
                      {:else}
                        Inspect artifact
                      {/if}
                    </Button>
                  </div>
                </article>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  {/if}
</section>

<style>
  h2,
  h3,
  h4 {
    margin: 0;
    line-height: 1.2;
  }

  p {
    margin: 0;
  }

  .content-panel {
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    background: var(--color-background);
    padding: var(--surface-padding-sm);
    display: grid;
    gap: var(--surface-gap-sm);
  }

  .collection-panel {
    background: linear-gradient(180deg, #f8fafc 0%, #f4f6fb 100%);
  }

  .section-intro,
  .hint-text {
    color: var(--color-muted-text);
  }

  .empty-state-link {
    display: inline-flex;
    align-items: center;
    font-weight: 600;
  }

  .collection-groups {
    display: grid;
    gap: var(--space-3);
  }

  .rarity-group {
    display: grid;
    gap: var(--space-2);
  }

  .rarity-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .group-title {
    display: grid;
    gap: 0.2rem;
  }

  .artifact-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-2);
  }

  .vault-card {
    border: var(--surface-border);
    border-radius: var(--surface-radius-sm);
    background: var(--color-surface);
    padding: var(--surface-padding-sm);
    display: grid;
    gap: var(--surface-gap-sm);
  }

  .artifact-card {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  }

  .artifact-card-expanded {
    border-color: #93c5fd;
  }

  .card-header {
    display: grid;
    gap: 0.35rem;
  }

  .status-chip {
    display: inline-block;
    border: 1px solid var(--color-border);
    border-radius: var(--chip-radius);
    padding: var(--chip-padding-y) var(--chip-padding-x);
    font-size: var(--chip-font-size);
    font-weight: var(--chip-font-weight);
  }

  .rarity-label {
    width: fit-content;
  }

  .meta-grid {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .card-actions :global(button) {
    width: 100%;
  }

  .artifact-expanded-details {
    border-top: 1px dashed var(--color-border);
    padding-top: var(--space-2);
    display: grid;
    gap: var(--space-2);
  }

  .artifact-visual {
    display: grid;
    gap: var(--space-1);
  }

  .artifact-visual-surface {
    min-height: 10rem;
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

  .artifact-visual-surface-filled {
    background: linear-gradient(180deg, #ffffff 0%, #eef2f7 100%);
  }

  .artifact-visual-surface-placeholder {
    min-height: 8rem;
    aspect-ratio: 5 / 3;
    border-style: dashed;
    padding: var(--space-2);
  }

  .artifact-visual-surface img {
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

  .artifact-description {
    display: grid;
    gap: var(--space-1);
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

  .rarity-epic {
    border-color: #7c3aed;
  }

  .rarity-rare {
    border-color: #2563eb;
  }

  .rarity-common {
    border-color: #6b7280;
  }

  .rarity-unknown {
    border-color: var(--color-border);
  }

  h5,
  h6 {
    margin: 0;
    line-height: 1.2;
  }

  .expanded-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 40rem) {
    .artifact-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>

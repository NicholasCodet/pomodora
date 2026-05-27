<script lang="ts">
  type ArtifactRarity = 'common' | 'rare' | 'epic' | 'unknown';

  interface VaultCollectionArtifactView {
    name: string;
    rarity: ArtifactRarity;
    materialType: string;
    discoveredAt: number;
  }

  interface VaultCollectionGroupView {
    rarity: ArtifactRarity;
    label: string;
    items: VaultCollectionArtifactView[];
  }

  export let artifacts: VaultCollectionArtifactView[];
  export let groups: VaultCollectionGroupView[];
  function formatDiscoveredDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
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
</script>

<section aria-labelledby="collection-heading" class="content-panel collection-panel">
  <h2 id="collection-heading">Collection</h2>
  <p class="section-intro">Artifacts revealed through completed rituals.</p>

  {#if artifacts.length === 0}
    <p>Your collection is empty for now.</p>
    <p class="hint-text">Complete and reveal minerals from Ritual to begin your archive.</p>
  {:else}
    <div class="collection-groups">
      {#each groups as group}
        <section aria-labelledby={`rarity-${group.rarity}`} class="rarity-group">
          <header class="rarity-header">
            <h3 id={`rarity-${group.rarity}`}>{group.label}</h3>
            <p class="hint-text">{group.items.length} discovered</p>
          </header>

          <ul class="artifact-list">
            {#each group.items as artifact}
              <li>
                <article class={`vault-card artifact-card ${getRarityClass(artifact.rarity)}`}>
                  <header class="card-header">
                    <h4>{artifact.name}</h4>
                    <p class="status-chip rarity-label">{group.label}</p>
                  </header>

                  <dl class="meta-grid">
                    <div>
                      <dt>Source Material</dt>
                      <dd>{artifact.materialType}</dd>
                    </div>
                    <div>
                      <dt>Discovered</dt>
                      <dd>{formatDiscoveredDate(artifact.discoveredAt)}</dd>
                    </div>
                  </dl>
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
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-background);
    padding: var(--space-2);
    display: grid;
    gap: var(--space-2);
  }

  .collection-panel {
    background: linear-gradient(180deg, #f8fafc 0%, #f4f6fb 100%);
  }

  .section-intro,
  .hint-text {
    color: var(--color-muted-text);
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
    align-items: baseline;
    gap: var(--space-2);
  }

  .artifact-list {
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

  .artifact-card {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  }

  .card-header {
    display: grid;
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

  .rarity-label {
    width: fit-content;
  }

  .meta-grid {
    margin: 0;
    display: grid;
    gap: var(--space-1);
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  @media (min-width: 40rem) {
    .artifact-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>

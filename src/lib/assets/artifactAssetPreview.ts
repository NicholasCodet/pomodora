import type { ArtifactId, MaterialType, Rarity } from '../../core/models';
import { ARTIFACTS } from '../../data/artifacts';
import { getArtifactAsset } from './artifactAssets';

export type ArtifactAssetPreviewRole = 'playable-artifact';
export type ArtifactAssetQaStatus = 'ready' | 'placeholder';
export type ArtifactAssetFormat = 'avif' | 'png' | 'webp';

export interface ArtifactAssetPreviewEntry {
  id: ArtifactId;
  label: string;
  image: string | null;
  fileName: string | null;
  format: ArtifactAssetFormat | null;
  sourceMaterial: MaterialType;
  rarity: Rarity;
  category: string;
  role: ArtifactAssetPreviewRole;
  qaStatus: ArtifactAssetQaStatus;
  note: string;
}

const ARTIFACT_FILE_NAMES: Partial<Record<ArtifactId, string>> = {
  'clay-common-urn': 'clay-common-urn.png',
};

function getAssetFormat(fileName: string | null): ArtifactAssetFormat | null {
  if (fileName === null) {
    return null;
  }

  const extension = fileName.split('.').at(-1);

  if (extension === 'avif' || extension === 'png' || extension === 'webp') {
    return extension;
  }

  return null;
}

export const ARTIFACT_ASSET_PREVIEW_ENTRIES: readonly ArtifactAssetPreviewEntry[] = ARTIFACTS.map(
  (artifact) => {
    const asset = getArtifactAsset(artifact.id);
    const image = asset.illustration ?? asset.thumbnail;
    const fileName = ARTIFACT_FILE_NAMES[artifact.id] ?? null;

    return {
      id: artifact.id,
      label: artifact.name,
      image,
      fileName,
      format: getAssetFormat(fileName),
      sourceMaterial: artifact.materialType,
      rarity: artifact.rarity,
      category: artifact.artifactCategory,
      role: 'playable-artifact',
      qaStatus: image === null ? 'placeholder' : 'ready',
      note:
        image === null
          ? 'No artifact visual wired yet. Collection uses the placeholder fallback.'
          : 'Artifact visual is wired through artifactAssets.ts.',
    };
  },
);

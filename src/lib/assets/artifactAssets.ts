import type { ArtifactId } from '../../core/models';

export interface ArtifactAssetEntry {
  thumbnail: string | null;
  illustration: string | null;
  model3d: string | null;
}

const ARTIFACT_ASSETS: Readonly<Record<ArtifactId, ArtifactAssetEntry>> = {
  'clay-common-urn': {
    thumbnail: null,
    illustration: null,
    model3d: null,
  },
  'clay-rare-seal': {
    thumbnail: null,
    illustration: null,
    model3d: null,
  },
  'clay-epic-mask': {
    thumbnail: null,
    illustration: null,
    model3d: null,
  },
  'limestone-common-tablet': {
    thumbnail: null,
    illustration: null,
    model3d: null,
  },
  'limestone-rare-lintel': {
    thumbnail: null,
    illustration: null,
    model3d: null,
  },
  'limestone-epic-crown': {
    thumbnail: null,
    illustration: null,
    model3d: null,
  },
  'marble-common-inlay': {
    thumbnail: null,
    illustration: null,
    model3d: null,
  },
  'marble-rare-bust': {
    thumbnail: null,
    illustration: null,
    model3d: null,
  },
  'marble-epic-monolith': {
    thumbnail: null,
    illustration: null,
    model3d: null,
  },
};

const EMPTY_ARTIFACT_ASSET: ArtifactAssetEntry = {
  thumbnail: null,
  illustration: null,
  model3d: null,
};

export function getArtifactAsset(artifactId: ArtifactId): ArtifactAssetEntry {
  return ARTIFACT_ASSETS[artifactId] ?? EMPTY_ARTIFACT_ASSET;
}

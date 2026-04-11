import type { ArtifactDefinition, MaterialType } from '../core/models';

export const ARTIFACTS: readonly ArtifactDefinition[] = [
  {
    id: 'clay-common-urn',
    materialType: 'clay',
    rarity: 'common',
    name: 'Urn Fragment',
    description: 'A humble shard carrying traces of old rituals.',
  },
  
  {
    id: 'clay-rare-seal',
    materialType: 'clay',
    rarity: 'rare',
    name: 'Keeper Seal',
    description: 'A stamped mark once used to certify sacred clay.',
  },

  {
    id: 'clay-epic-mask',
    materialType: 'clay',
    rarity: 'epic',
    name: 'Sanctum Mask',
    description: 'A ceremonial mask preserved beneath the dust.',
  },

  {
    id: 'limestone-common-tablet',
    materialType: 'limestone',
    rarity: 'common',
    name: 'Weathered Tablet',
    description: 'A limestone plate etched with simple symbols.',
  },

  {
    id: 'limestone-rare-lintel',
    materialType: 'limestone',
    rarity: 'rare',
    name: 'Temple Lintel',
    description: 'A carved fragment from a forgotten doorway.',
  },

  {
    id: 'limestone-epic-crown',
    materialType: 'limestone',
    rarity: 'epic',
    name: 'Crown of Echoes',
    description: 'An ornate relic tied to ancient processions.',
  },

  {
    id: 'marble-common-inlay',
    materialType: 'marble',
    rarity: 'common',
    name: 'Marble Inlay',
    description: 'A polished inlay once used in a shrine floor.',
  },

  {
    id: 'marble-rare-bust',
    materialType: 'marble',
    rarity: 'rare',
    name: 'Silent Bust',
    description: 'A sculpted profile with missing inscriptions.',
  },
  
  {
    id: 'marble-epic-monolith',
    materialType: 'marble',
    rarity: 'epic',
    name: 'Veiled Monolith',
    description: 'A pristine marble relic with unknown purpose.',
  },
];

export function getArtifactsForMaterial(materialType: MaterialType): ArtifactDefinition[] {
  return ARTIFACTS.filter((artifact) => artifact.materialType === materialType);
}

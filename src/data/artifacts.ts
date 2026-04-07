import type { ArtifactDefinition, MaterialType } from '../core/models';

export const ARTIFACTS: readonly ArtifactDefinition[] = [
  {
    id: 'argile-common-urn',
    materialType: 'argile',
    rarity: 'common',
    name: 'Urn Fragment',
    description: 'A humble shard carrying traces of old rituals.',
  },
  {
    id: 'argile-rare-seal',
    materialType: 'argile',
    rarity: 'rare',
    name: 'Keeper Seal',
    description: 'A stamped mark once used to certify sacred clay.',
  },
  {
    id: 'argile-epic-mask',
    materialType: 'argile',
    rarity: 'epic',
    name: 'Sanctum Mask',
    description: 'A ceremonial mask preserved beneath the dust.',
  },
  {
    id: 'calcaire-common-tablet',
    materialType: 'calcaire',
    rarity: 'common',
    name: 'Weathered Tablet',
    description: 'A limestone plate etched with simple symbols.',
  },
  {
    id: 'calcaire-rare-lintel',
    materialType: 'calcaire',
    rarity: 'rare',
    name: 'Temple Lintel',
    description: 'A carved fragment from a forgotten doorway.',
  },
  {
    id: 'calcaire-epic-crown',
    materialType: 'calcaire',
    rarity: 'epic',
    name: 'Crown of Echoes',
    description: 'An ornate relic tied to ancient processions.',
  },
  {
    id: 'marbre-common-inlay',
    materialType: 'marbre',
    rarity: 'common',
    name: 'Marble Inlay',
    description: 'A polished inlay once used in a shrine floor.',
  },
  {
    id: 'marbre-rare-bust',
    materialType: 'marbre',
    rarity: 'rare',
    name: 'Silent Bust',
    description: 'A sculpted profile with missing inscriptions.',
  },
  {
    id: 'marbre-epic-monolith',
    materialType: 'marbre',
    rarity: 'epic',
    name: 'Veiled Monolith',
    description: 'A pristine marble relic with unknown purpose.',
  },
];

export function getArtifactsForMaterial(materialType: MaterialType): ArtifactDefinition[] {
  return ARTIFACTS.filter((artifact) => artifact.materialType === materialType);
}

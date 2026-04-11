import type { MaterialDefinition, MaterialType } from '../core/models';

export const MATERIAL_DEFINITIONS: Readonly<Record<MaterialType, MaterialDefinition>> = {
  clay: {
    type: 'clay',
    name: 'Clay',
    cost: 1,
    stageCount: 3,
    stageThresholds: [30, 60, 90],
    possibleArtifactIds: ['clay-common-urn', 'clay-rare-seal', 'clay-epic-mask'],
  },

  limestone: {
    type: 'limestone',
    name: 'Limestone',
    cost: 10,
    stageCount: 4,
    stageThresholds: [45, 90, 135, 180],
    possibleArtifactIds: [
      'limestone-common-tablet',
      'limestone-rare-lintel',
      'limestone-epic-crown',
    ],
  },
  
  marble: {
    type: 'marble',
    name: 'Marble',
    cost: 40,
    stageCount: 5,
    stageThresholds: [60, 120, 180, 240, 300],
    possibleArtifactIds: ['marble-common-inlay', 'marble-rare-bust', 'marble-epic-monolith'],
  },
};

export const MATERIALS: readonly MaterialDefinition[] = Object.values(MATERIAL_DEFINITIONS);

export function getMaterialDefinition(type: MaterialType): MaterialDefinition {
  return MATERIAL_DEFINITIONS[type];
}

import type { MaterialDefinition, MaterialType } from '../core/models';

export const MATERIAL_DEFINITIONS: Readonly<Record<MaterialType, MaterialDefinition>> = {
  clay: {
    type: 'clay',
    name: 'Clay',
    displayName: 'Clay',
    shortDescription: 'Humble earth used to begin focus refinement.',
    artifactFamily: 'Earthen Relics',
    visualThemeHint: 'matte_earth',
    cost: 1,
    stageCount: 3,
    stageThresholds: [30, 60, 90],
    possibleArtifactIds: ['clay-common-urn', 'clay-rare-seal', 'clay-epic-mask'],
  },

  limestone: {
    type: 'limestone',
    name: 'Limestone',
    displayName: 'Limestone',
    shortDescription: 'Carved stone suited for deliberate ritual practice.',
    artifactFamily: 'Temple Fragments',
    visualThemeHint: 'weathered_stone',
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
    displayName: 'Marble',
    shortDescription: 'Pristine stone reserved for advanced refinement.',
    artifactFamily: 'Sanctum Monuments',
    visualThemeHint: 'polished_marble',
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

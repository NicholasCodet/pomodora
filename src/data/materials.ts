import type { MaterialDefinition, MaterialType } from '../core/models';

export const MATERIALS: readonly MaterialDefinition[] = [
  {
    type: 'argile',
    cost: 1,
    stageThresholdsMinutes: [30, 60, 90],
  },
  {
    type: 'calcaire',
    cost: 10,
    stageThresholdsMinutes: [45, 90, 135, 180],
  },
  {
    type: 'marbre',
    cost: 40,
    stageThresholdsMinutes: [60, 120, 180, 240, 300],
  },
];

export const MATERIALS_BY_TYPE: Readonly<Record<MaterialType, MaterialDefinition>> = {
  argile: MATERIALS[0],
  calcaire: MATERIALS[1],
  marbre: MATERIALS[2],
};

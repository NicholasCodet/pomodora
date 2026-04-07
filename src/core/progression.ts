import type { MaterialDefinition, Minutes, OwnedMineral } from './models';

/**
 * Returns how many stages are currently completed for a mineral.
 */
export function getCompletedStageCount(
  workedMinutes: Minutes,
  stageThresholdsMinutes: readonly Minutes[],
): number {
  return stageThresholdsMinutes.filter((threshold) => workedMinutes >= threshold).length;
}

/**
 * Returns true when the mineral reached its final stage threshold.
 */
export function isMineralFullyRefined(
  mineral: OwnedMineral,
  material: MaterialDefinition,
): boolean {
  const finalThreshold = material.stageThresholdsMinutes[material.stageThresholdsMinutes.length - 1];
  return mineral.workedMinutes >= finalThreshold;
}

/**
 * Pure helper to add worked minutes to a mineral.
 */
export function addWorkedMinutesToMineral(
  mineral: OwnedMineral,
  additionalMinutes: Minutes,
): OwnedMineral {
  if (additionalMinutes <= 0) {
    return mineral;
  }

  return {
    ...mineral,
    workedMinutes: mineral.workedMinutes + additionalMinutes,
  };
}

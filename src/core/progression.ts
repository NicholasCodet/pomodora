/**
 * Progression helpers for mineral stages and material unlocks.
 * These are read-focused rules used by actions and UI-facing views.
 */
import {
  LIMESTONE_UNLOCK_COMPLETED_RITUALS,
  MARBLE_UNLOCK_TOTAL_WORKED_MINUTES,
} from './constants';
import type {
  GameState,
  MaterialDefinition,
  MaterialType,
  Minutes,
  OwnedMineral,
} from './models';

export type MaterialDefinitionValidationReason =
  | 'invalid_stage_count'
  | 'empty_stage_thresholds'
  | 'non_positive_stage_threshold'
  | 'non_increasing_stage_thresholds';

export interface MaterialDefinitionValidationError {
  reason: MaterialDefinitionValidationReason;
  message: string;
}

/**
 * Returns how many stages are currently completed for a mineral.
 */
export function getCompletedStageCount(
  workedMinutes: Minutes,
  stageThresholds: readonly Minutes[],
): number {
  return stageThresholds.filter((threshold) => workedMinutes >= threshold).length;
}

/**
 * Validates static progression data for one material definition.
 */
export function validateMaterialDefinition(
  material: MaterialDefinition,
): MaterialDefinitionValidationError | null {
  if (material.stageCount !== material.stageThresholds.length) {
    return {
      reason: 'invalid_stage_count',
      message: `stageCount (${material.stageCount}) does not match stageThresholds length (${material.stageThresholds.length}).`,
    };
  }

  if (material.stageThresholds.length === 0) {
    return {
      reason: 'empty_stage_thresholds',
      message: 'stageThresholds must contain at least one value.',
    };
  }

  for (let i = 0; i < material.stageThresholds.length; i += 1) {
    const threshold = material.stageThresholds[i];
    if (threshold <= 0) {
      return {
        reason: 'non_positive_stage_threshold',
        message: `stageThresholds[${i}] must be > 0.`,
      };
    }

    if (i > 0 && threshold <= material.stageThresholds[i - 1]) {
      return {
        reason: 'non_increasing_stage_thresholds',
        message: 'stageThresholds must be strictly increasing.',
      };
    }
  }

  return null;
}

/**
 * Returns true when the mineral reached its final stage threshold.
 */
export function isMineralFullyRefined(
  mineral: OwnedMineral,
  material: MaterialDefinition,
): boolean {
  if (material.stageThresholds.length === 0) {
    return false;
  }

  const finalThreshold = material.stageThresholds[material.stageThresholds.length - 1];
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

/**
 * Unlock rules derived from player progression stats.
 */
export function isMaterialUnlocked(state: GameState, materialType: MaterialType): boolean {
  // Unlocks are derived from player stats (not persisted separately).
  if (materialType === 'clay') {
    return true;
  }

  if (materialType === 'limestone') {
    return state.player.stats.completedRituals >= LIMESTONE_UNLOCK_COMPLETED_RITUALS;
  }

  return state.player.stats.totalWorkedMinutes >= MARBLE_UNLOCK_TOTAL_WORKED_MINUTES;
}

/**
 * Returns all currently unlocked material definitions.
 */
export function getUnlockedMaterials(
  state: GameState,
  materials: readonly MaterialDefinition[],
): MaterialDefinition[] {
  return materials.filter((material) => isMaterialUnlocked(state, material.type));
}

export interface MineralProgressView {
  materialType: MaterialType;
  currentStage: number;
  stageCount: number;
  workedMinutes: Minutes;
  nextThreshold: Minutes | null;
  remainingMinutesToNextStage: Minutes | null;
  isCompleted: boolean;
}

export type MineralProgressViewFailureReason =
  | 'material_type_mismatch'
  | 'invalid_material_definition';

export type MineralProgressViewResult =
  | {
      ok: true;
      view: MineralProgressView;
    }
  | {
      ok: false;
      reason: MineralProgressViewFailureReason;
    };

/**
 * Builds a safe progress snapshot for one owned mineral.
 */
export function getMineralProgressView(
  mineral: OwnedMineral,
  material: MaterialDefinition,
): MineralProgressViewResult {
  if (material.type !== mineral.materialType) {
    return {
      ok: false,
      reason: 'material_type_mismatch',
    };
  }

  const materialValidation = validateMaterialDefinition(material);
  if (materialValidation) {
    return {
      ok: false,
      reason: 'invalid_material_definition',
    };
  }

  const completedStages = getCompletedStageCount(mineral.workedMinutes, material.stageThresholds);
  const currentStage = Math.min(completedStages, material.stageCount);
  const isCompleted = isMineralFullyRefined(mineral, material);
  // When completed, there is no "next" threshold to display.
  const nextThreshold = isCompleted ? null : material.stageThresholds[currentStage];
  const remainingMinutesToNextStage =
    nextThreshold === null ? null : Math.max(0, nextThreshold - mineral.workedMinutes);

  return {
    ok: true,
    view: {
      materialType: mineral.materialType,
      currentStage,
      stageCount: material.stageCount,
      workedMinutes: mineral.workedMinutes,
      nextThreshold,
      remainingMinutesToNextStage,
      isCompleted,
    },
  };
}

/**
 * Ritual action rules.
 * Applies completed worked time to a mineral and player progression.
 */
import { ESSENCE_MINUTES_DIVISOR } from './constants';
import { addWorkedMinutesToMineral, isMineralFullyRefined, validateMaterialDefinition } from './progression';
import type {
  Essence,
  GameState,
  MaterialDefinition,
  MaterialType,
  MineralId,
  Minutes,
  OwnedMineral,
} from './models';

/**
 * Core economy rule: reward essence from completed ritual minutes.
 */
export function calculateEssenceFromMinutes(minutes: Minutes): Essence {
  if (minutes <= 0) {
    return 0;
  }

  return Math.floor(minutes / ESSENCE_MINUTES_DIVISOR);
}

export type ApplyCompletedRitualFailureReason =
  | 'invalid_minutes'
  | 'mineral_not_found'
  | 'material_not_found'
  | 'material_type_mismatch'
  | 'invalid_material_definition'
  | 'already_revealed'
  | 'already_complete';

export type ApplyCompletedRitualResult =
  | {
      ok: true;
      state: GameState;
      mineral: OwnedMineral;
      essenceGain: Essence;
    }
  | {
      ok: false;
      reason: ApplyCompletedRitualFailureReason;
      state: GameState;
    };

/**
 * Applies a completed ritual to game state.
 * A completed ritual must represent strictly positive worked time.
 */
export function applyCompletedRitual(
  state: GameState,
  mineralId: MineralId,
  completedMinutes: Minutes,
  materialDefinitions: Readonly<Record<MaterialType, MaterialDefinition>>,
): ApplyCompletedRitualResult {
  if (completedMinutes <= 0) {
    return {
      ok: false,
      reason: 'invalid_minutes',
      state,
    };
  }

  const mineral = state.inventory.find((entry) => entry.id === mineralId);
  if (!mineral) {
    return {
      ok: false,
      reason: 'mineral_not_found',
      state,
    };
  }

  const material = materialDefinitions[mineral.materialType];
  if (!material) {
    return {
      ok: false,
      reason: 'material_not_found',
      state,
    };
  }

  if (material.type !== mineral.materialType) {
    return {
      ok: false,
      reason: 'material_type_mismatch',
      state,
    };
  }

  const materialValidation = validateMaterialDefinition(material);
  if (materialValidation) {
    return {
      ok: false,
      reason: 'invalid_material_definition',
      state,
    };
  }

  if (mineral.revealedAt !== null) {
    return {
      ok: false,
      reason: 'already_revealed',
      state,
    };
  }

  if (isMineralFullyRefined(mineral, material)) {
    return {
      ok: false,
      reason: 'already_complete',
      state,
    };
  }

  const essenceGain = calculateEssenceFromMinutes(completedMinutes);
  const updatedMineral = addWorkedMinutesToMineral(mineral, completedMinutes);
  const updatedState: GameState = {
    ...state,
    player: {
      ...state.player,
      essence: state.player.essence + essenceGain,
      stats: {
        ...state.player.stats,
        completedRituals: state.player.stats.completedRituals + 1,
        totalWorkedMinutes: state.player.stats.totalWorkedMinutes + completedMinutes,
      },
    },
    inventory: state.inventory.map((entry) => (entry.id === mineralId ? updatedMineral : entry)),
  };

  return {
    ok: true,
    state: updatedState,
    mineral: updatedMineral,
    essenceGain,
  };
}

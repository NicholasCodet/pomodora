import { ESSENCE_MINUTES_DIVISOR } from './constants';
import { addWorkedMinutesToMineral } from './progression';
import type { Essence, GameState, MineralId, Minutes } from './models';

/**
 * Core economy rule: reward essence from completed ritual minutes.
 */
export function calculateEssenceFromMinutes(minutes: Minutes): Essence {
  if (minutes <= 0) {
    return 0;
  }

  return Math.floor(minutes / ESSENCE_MINUTES_DIVISOR);
}

/**
 * Applies a completed ritual to game state.
 * Early stops should pass 0 minutes and therefore produce no changes.
 */
export function applyCompletedRitual(
  state: GameState,
  mineralId: MineralId,
  completedMinutes: Minutes,
): GameState {
  if (completedMinutes <= 0) {
    return state;
  }

  const essenceGain = calculateEssenceFromMinutes(completedMinutes);

  return {
    ...state,
    essence: state.essence + essenceGain,
    inventory: state.inventory.map((mineral) =>
      mineral.id === mineralId
        ? addWorkedMinutesToMineral(mineral, completedMinutes)
        : mineral,
    ),
  };
}

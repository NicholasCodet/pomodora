/**
 * Selected mineral action and read helper.
 */
import type { GameState, MineralId, OwnedMineral } from './models';

export type SelectMineralFailureReason = 'mineral_not_found';

export type SelectMineralResult =
  | {
      ok: true;
      state: GameState;
      mineral: OwnedMineral;
    }
  | {
      ok: false;
      reason: SelectMineralFailureReason;
      state: GameState;
    };

/**
 * Sets the active mineral by id when it exists in inventory.
 */
export function selectMineral(state: GameState, mineralId: MineralId): SelectMineralResult {
  const mineral = state.inventory.find((entry) => entry.id === mineralId);
  if (!mineral) {
    return {
      ok: false,
      reason: 'mineral_not_found',
      state,
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      selectedMineralId: mineralId,
    },
    mineral,
  };
}

/**
 * Returns the currently selected mineral, or null when selection is missing/stale.
 */
export function getSelectedMineral(state: GameState): OwnedMineral | null {
  if (state.selectedMineralId === null) {
    return null;
  }

  return state.inventory.find((entry) => entry.id === state.selectedMineralId) ?? null;
}

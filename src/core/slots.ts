/**
 * Ritual slot actions and read helpers.
 * Slots provide quick cross-screen mineral selection while keeping rules in domain state.
 */
import { QUICK_SLOT_COUNT } from './constants';
import type { GameState, MineralId, OwnedMineral } from './models';

export type AddRitualSlotFailureReason =
  | 'mineral_not_found'
  | 'already_slotted'
  | 'slot_limit_reached';

export type AddRitualSlotResult =
  | {
      ok: true;
      state: GameState;
      mineral: OwnedMineral;
    }
  | {
      ok: false;
      reason: AddRitualSlotFailureReason;
      state: GameState;
    };

export type RemoveRitualSlotFailureReason = 'slot_not_found';

export type RemoveRitualSlotResult =
  | {
      ok: true;
      state: GameState;
      mineralId: MineralId;
    }
  | {
      ok: false;
      reason: RemoveRitualSlotFailureReason;
      state: GameState;
    };

export function addRitualSlot(state: GameState, mineralId: MineralId): AddRitualSlotResult {
  const mineral = state.inventory.find((entry) => entry.id === mineralId);
  if (!mineral) {
    return {
      ok: false,
      reason: 'mineral_not_found',
      state,
    };
  }

  if (state.ritualSlotMineralIds.includes(mineralId)) {
    return {
      ok: false,
      reason: 'already_slotted',
      state,
    };
  }

  if (state.ritualSlotMineralIds.length >= QUICK_SLOT_COUNT) {
    return {
      ok: false,
      reason: 'slot_limit_reached',
      state,
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      ritualSlotMineralIds: [...state.ritualSlotMineralIds, mineralId],
    },
    mineral,
  };
}

export function removeRitualSlot(state: GameState, mineralId: MineralId): RemoveRitualSlotResult {
  if (!state.ritualSlotMineralIds.includes(mineralId)) {
    return {
      ok: false,
      reason: 'slot_not_found',
      state,
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      ritualSlotMineralIds: state.ritualSlotMineralIds.filter((entry) => entry !== mineralId),
    },
    mineralId,
  };
}

export function getRitualSlotMinerals(state: GameState): OwnedMineral[] {
  return state.ritualSlotMineralIds
    .map((id) => state.inventory.find((entry) => entry.id === id))
    .filter((entry): entry is OwnedMineral => entry !== undefined);
}

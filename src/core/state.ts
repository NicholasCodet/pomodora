/**
 * Initial state factories for the domain.
 * Centralizing this avoids ad-hoc state objects across callers.
 */
import { STARTING_ESSENCE } from './constants';
import type { Essence, GameState, PlayerProgress, PlayerStats } from './models';

/**
 * Creates zeroed gameplay stats.
 */
export function createInitialPlayerStats(): PlayerStats {
  return {
    completedRituals: 0,
    totalWorkedMinutes: 0,
  };
}

/**
 * Creates the player progress node with optional initial essence.
 */
export function createInitialPlayerProgress(startingEssence: Essence = STARTING_ESSENCE): PlayerProgress {
  return {
    essence: startingEssence,
    stats: createInitialPlayerStats(),
  };
}

/**
 * Creates a full valid game state for a new save.
 */
export function createInitialGameState(startingEssence: Essence = STARTING_ESSENCE): GameState {
  return {
    player: createInitialPlayerProgress(startingEssence),
    selectedMineralId: null,
    inventory: [],
    collection: [],
  };
}

/**
 * Shared domain constants.
 * Keep numeric rules centralized so balancing changes remain explicit.
 */
import type { Rarity } from './models';

export const STARTING_ESSENCE = 0;

export const ESSENCE_MINUTES_DIVISOR = 10;

export const QUICK_SLOT_COUNT = 3;

export const STORAGE_KEY = 'pomodora-sanctuary.game-state.v1';

export const LIMESTONE_UNLOCK_COMPLETED_RITUALS = 3;
export const MARBLE_UNLOCK_TOTAL_WORKED_MINUTES = 180;

export const ARTIFACT_RARITY_WEIGHTS: Readonly<Record<Rarity, number>> = {
  common: 60,
  rare: 30,
  epic: 10,
};

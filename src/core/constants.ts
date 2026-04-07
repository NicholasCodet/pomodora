import type { ArtifactRarity } from './models';

export const STARTING_ESSENCE = 0;

export const ESSENCE_MINUTES_DIVISOR = 10;

export const QUICK_SLOT_COUNT = 3;

export const STORAGE_KEY = 'pomodora-sanctuary.game-state.v1';

export const ARTIFACT_RARITY_WEIGHTS: Readonly<Record<ArtifactRarity, number>> = {
  common: 60,
  rare: 30,
  epic: 10,
};

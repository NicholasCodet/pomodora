/**
 * Core domain models.
 * This module intentionally contains only types and no runtime logic.
 */

export type MaterialType = 'clay' | 'limestone' | 'marble';

export type Rarity = 'common' | 'rare' | 'epic';

export type MineralId = string;
export type ArtifactId = string;

export type Essence = number;
export type Minutes = number;

/**
 * Static definition for each material family.
 * `stageThresholds` values are cumulative minute checkpoints.
 */
export interface MaterialDefinition {
  type: MaterialType;
  name: string;
  cost: Essence;
  stageCount: number;
  stageThresholds: readonly Minutes[];
  possibleArtifactIds: readonly ArtifactId[];
}

/**
 * Static definition for a revealable artifact.
 */
export interface ArtifactDefinition {
  id: ArtifactId;
  materialType: MaterialType;
  rarity: Rarity;
  name: string;
  description: string;
}

/**
 * A purchased mineral in the player's inventory.
 * `hiddenArtifactId` is rolled on purchase and revealed when completed.
 */
export interface OwnedMineral {
  id: MineralId;
  materialType: MaterialType;
  workedMinutes: Minutes;
  hiddenArtifactId: ArtifactId;
  revealedAt: number | null;
}

export interface OwnedArtifact {
  artifactId: ArtifactId;
  sourceMineralId: MineralId;
  discoveredAt: number;
}

export interface PlayerStats {
  completedRituals: number;
  totalWorkedMinutes: Minutes;
}

export interface PlayerProgress {
  essence: Essence;
  stats: PlayerStats;
}

/**
 * Persisted game state for local-first MVP.
 */
export interface GameState {
  player: PlayerProgress;
  selectedMineralId: MineralId | null;
  ritualSlotMineralIds: MineralId[];
  inventory: OwnedMineral[];
  collection: OwnedArtifact[];
}

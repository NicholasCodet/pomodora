/**
 * Core domain models.
 * This module intentionally contains only types and no runtime logic.
 */

export type MaterialType = 'argile' | 'calcaire' | 'marbre';

export type ArtifactRarity = 'common' | 'rare' | 'epic';

export type MineralId = string;
export type ArtifactId = string;

export type Essence = number;
export type Minutes = number;

/**
 * Static definition for each material family.
 * `stageThresholdsMinutes` values are cumulative checkpoints.
 */
export interface MaterialDefinition {
  type: MaterialType;
  cost: Essence;
  stageThresholdsMinutes: readonly Minutes[];
}

/**
 * Static definition for a revealable artifact.
 */
export interface ArtifactDefinition {
  id: ArtifactId;
  materialType: MaterialType;
  rarity: ArtifactRarity;
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

export interface CollectionEntry {
  artifactId: ArtifactId;
  discoveredAt: number;
  sourceMineralId: MineralId;
}

/**
 * Persisted game state for local-first MVP.
 */
export interface GameState {
  essence: Essence;
  activeMineralId: MineralId | null;
  inventory: OwnedMineral[];
  collection: CollectionEntry[];
}

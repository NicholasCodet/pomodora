import type { GameState, MaterialType } from '../core/models';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isMaterialType(value: unknown): value is MaterialType {
  return value === 'clay' || value === 'limestone' || value === 'marble';
}

/**
 * Converts a valid game state into a JSON string for persistence.
 */
export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

/**
 * Minimal runtime validation for persisted game-state payloads.
 */
export function isValidGameState(value: unknown): value is GameState {
  if (!isObjectRecord(value)) {
    return false;
  }

  const player = value.player;
  const selectedMineralId = value.selectedMineralId;
  const inventory = value.inventory;
  const collection = value.collection;

  if (!isObjectRecord(player)) {
    return false;
  }

  if (!isNonNegativeNumber(player.essence)) {
    return false;
  }

  if (!isObjectRecord(player.stats)) {
    return false;
  }

  if (!isNonNegativeNumber(player.stats.completedRituals)) {
    return false;
  }

  if (!isNonNegativeNumber(player.stats.totalWorkedMinutes)) {
    return false;
  }

  if (!(selectedMineralId === null || typeof selectedMineralId === 'string')) {
    return false;
  }

  if (!Array.isArray(inventory)) {
    return false;
  }

  if (
    !inventory.every((item) => {
      return (
        isObjectRecord(item) &&
        typeof item.id === 'string' &&
        isMaterialType(item.materialType) &&
        isNonNegativeNumber(item.workedMinutes) &&
        typeof item.hiddenArtifactId === 'string' &&
        (item.revealedAt === null || isNonNegativeNumber(item.revealedAt))
      );
    })
  ) {
    return false;
  }

  if (!Array.isArray(collection)) {
    return false;
  }

  if (
    !collection.every((item) => {
      return (
        isObjectRecord(item) &&
        typeof item.artifactId === 'string' &&
        typeof item.sourceMineralId === 'string' &&
        isNonNegativeNumber(item.discoveredAt)
      );
    })
  ) {
    return false;
  }

  // Optional consistency check: if a selection exists, it must exist in inventory.
  if (
    selectedMineralId !== null &&
    !inventory.some((item) => isObjectRecord(item) && item.id === selectedMineralId)
  ) {
    return false;
  }

  return true;
}

/**
 * Parses persisted JSON and returns null when payload is invalid or corrupted.
 */
export function deserializeGameState(raw: string): GameState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValidGameState(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

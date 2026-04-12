/**
 * Player-facing read-only summary helpers.
 * This module aggregates useful progression facts from raw game state.
 */
import { isMaterialUnlocked } from './progression';
import type { GameState, MaterialDefinition, MaterialType, MineralId, Minutes } from './models';

const DEFAULT_MATERIAL_TYPES: readonly MaterialType[] = ['clay', 'limestone', 'marble'];

export interface PlayerSummary {
  essence: number;
  completedRituals: number;
  totalWorkedMinutes: Minutes;
  unlockedMaterialTypes: MaterialType[];
  unlockedMaterialCount: number;
  collectionCount: number;
  selectedMineralId: MineralId | null;
  inventoryCount: number;
}

/**
 * Builds a compact player summary for dashboards/headers.
 * The optional materials input lets callers control which material list is considered.
 */
export function getPlayerSummary(
  state: GameState,
  materials?: readonly MaterialDefinition[],
): PlayerSummary {
  const materialTypes = materials
    ? [...new Set(materials.map((material) => material.type))]
    : [...DEFAULT_MATERIAL_TYPES];

  const unlockedMaterialTypes = materialTypes.filter((type) => isMaterialUnlocked(state, type));

  return {
    essence: state.player.essence,
    completedRituals: state.player.stats.completedRituals,
    totalWorkedMinutes: state.player.stats.totalWorkedMinutes,
    unlockedMaterialTypes,
    unlockedMaterialCount: unlockedMaterialTypes.length,
    collectionCount: state.collection.length,
    selectedMineralId: state.selectedMineralId,
    inventoryCount: state.inventory.length,
  };
}

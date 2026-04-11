/**
 * Read-only shop view helpers.
 * This file prepares purchase-related state without mutating GameState.
 */
import { isMaterialUnlocked } from './progression';
import { getPurchaseBlockedReason } from './purchase';
import type { Essence, GameState, MaterialDefinition, MaterialType } from './models';
import type { ShopMaterialBlockedReason } from './purchase';

export interface ShopMaterialState {
  type: MaterialType;
  name: string;
  cost: Essence;
  isUnlocked: boolean;
  canAfford: boolean;
  canPurchase: boolean;
  blockedReason: ShopMaterialBlockedReason | null;
}

/**
 * Builds read-only shop rows for each material definition.
 */
export function getShopMaterialStates(
  state: GameState,
  materials: readonly MaterialDefinition[],
): ShopMaterialState[] {
  return materials.map((material) => {
    const blockedReason = getPurchaseBlockedReason(state, material);
    return {
      type: material.type,
      name: material.name,
      cost: material.cost,
      isUnlocked: isMaterialUnlocked(state, material.type),
      canAfford: state.player.essence >= material.cost,
      canPurchase: blockedReason === null,
      blockedReason,
    };
  });
}

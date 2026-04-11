/**
 * Mineral purchase action and related validation helpers.
 */
import { isMaterialUnlocked, validateMaterialDefinition } from './progression';
import type {
  GameState,
  MaterialDefinition,
  MaterialType,
  MineralId,
  OwnedMineral,
} from './models';

export type ShopMaterialBlockedReason =
  | 'invalid_material_definition'
  | 'material_locked'
  | 'insufficient_essence'
  | 'no_possible_artifacts';

export type PurchaseMineralFailureReason =
  | 'material_not_found'
  | 'material_locked'
  | 'insufficient_essence'
  | 'invalid_material_definition'
  | 'material_type_mismatch'
  | 'no_possible_artifacts';

export type PurchaseMineralResult =
  | {
      ok: true;
      state: GameState;
      mineral: OwnedMineral;
      material: MaterialDefinition;
    }
  | {
      ok: false;
      reason: PurchaseMineralFailureReason;
      state: GameState;
    };

/**
 * Returns the first reason a material cannot be purchased in current state.
 */
export function getPurchaseBlockedReason(
  state: GameState,
  material: MaterialDefinition,
): ShopMaterialBlockedReason | null {
  // Order matters: return the first actionable blocking reason.
  const materialValidation = validateMaterialDefinition(material);
  if (materialValidation) {
    return 'invalid_material_definition';
  }

  if (!isMaterialUnlocked(state, material.type)) {
    return 'material_locked';
  }

  if (state.player.essence < material.cost) {
    return 'insufficient_essence';
  }

  if (material.possibleArtifactIds.length === 0) {
    return 'no_possible_artifacts';
  }

  return null;
}

/**
 * Purchases one mineral and returns an updated immutable game state.
 */
export function purchaseMineral(
  state: GameState,
  materialType: MaterialType,
  materialDefinitions: Readonly<Record<MaterialType, MaterialDefinition>>,
  createMineralId: () => MineralId,
  random: () => number = Math.random,
): PurchaseMineralResult {
  /**
   * This action owns purchase invariants:
   * - material exists
   * - material shape is valid
   * - material is unlocked
   * - player can afford it
   */
  const material = materialDefinitions[materialType];
  if (!material) {
    return {
      ok: false,
      reason: 'material_not_found',
      state,
    };
  }

  if (material.type !== materialType) {
    return {
      ok: false,
      reason: 'material_type_mismatch',
      state,
    };
  }

  const blockedReason = getPurchaseBlockedReason(state, material);
  if (blockedReason !== null) {
    return {
      ok: false,
      reason: blockedReason,
      state,
    };
  }

  const randomIndex = Math.floor(random() * material.possibleArtifactIds.length);
  const safeIndex = Math.min(Math.max(randomIndex, 0), material.possibleArtifactIds.length - 1);
  const hiddenArtifactId = material.possibleArtifactIds[safeIndex];
  if (!hiddenArtifactId) {
    return {
      ok: false,
      reason: 'no_possible_artifacts',
      state,
    };
  }

  const mineral: OwnedMineral = {
    id: createMineralId(),
    materialType: material.type,
    workedMinutes: 0,
    hiddenArtifactId,
    revealedAt: null,
  };

  return {
    ok: true,
    state: {
      ...state,
      player: {
        ...state.player,
        essence: state.player.essence - material.cost,
      },
      selectedMineralId: state.selectedMineralId ?? mineral.id,
      inventory: [...state.inventory, mineral],
    },
    mineral,
    material,
  };
}

/**
 * Thin app bridge between SvelteKit UI and domain modules.
 * UI calls functions from here instead of wiring core/data modules directly.
 */
import {
  buyAndSelectMineral as runBuyAndSelectMineral,
  getPlayerSummary as buildPlayerSummary,
  getSelectedMineral as findSelectedMineral,
  getShopMaterialStates as buildShopMaterialStates,
  selectMineral as runSelectMineral,
} from '../../core/logic';
import { getMineralProgressView as buildMineralProgressView } from '../../core/progression';
import { createInitialGameState } from '../../core/state';
import type { GameState, MaterialType, MineralId, OwnedMineral } from '../../core/models';
import type { ShopMaterialState } from '../../core/shop';
import type { PlayerSummary } from '../../core/summary';
import type { MineralProgressViewResult } from '../../core/progression';
import type { BuyAndSelectMineralResult } from '../../core/use-cases';
import type { SelectMineralResult } from '../../core/selection';
import { MATERIAL_DEFINITIONS, MATERIALS } from '../../data/materials';
import { createId } from '../../utils/id';
import { deserializeGameState, serializeGameState } from '../../utils/storage';

export function createGameState(startingEssence = 0): GameState {
  return createInitialGameState(startingEssence);
}

export function loadGameState(raw: string | null | undefined, startingEssence = 0): GameState {
  if (!raw) {
    return createGameState(startingEssence);
  }

  const parsed = deserializeGameState(raw);
  return parsed ?? createGameState(startingEssence);
}

export function saveGameState(state: GameState): string {
  return serializeGameState(state);
}

export function getPlayerSummary(state: GameState): PlayerSummary {
  return buildPlayerSummary(state, MATERIALS);
}

export function getShopMaterialStates(state: GameState): ShopMaterialState[] {
  return buildShopMaterialStates(state, MATERIALS);
}

export function buyAndSelectMineral(
  state: GameState,
  materialType: MaterialType,
  random: () => number = Math.random,
): BuyAndSelectMineralResult {
  return runBuyAndSelectMineral(
    state,
    materialType,
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    random,
  );
}

export function selectMineral(state: GameState, mineralId: MineralId): SelectMineralResult {
  return runSelectMineral(state, mineralId);
}

export function getSelectedMineral(state: GameState): OwnedMineral | null {
  return findSelectedMineral(state);
}

export function getMineralProgressView(mineral: OwnedMineral): MineralProgressViewResult {
  return buildMineralProgressView(mineral, MATERIAL_DEFINITIONS[mineral.materialType]);
}

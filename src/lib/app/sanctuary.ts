/**
 * Thin app bridge between SvelteKit UI and domain modules.
 * UI calls functions from here instead of wiring core/data modules directly.
 */
import {
  addRitualSlot as runAddRitualSlot,
  buyAndSelectMineral as runBuyAndSelectMineral,
  completeRitualOnSelectedMineral as runCompleteRitualOnSelectedMineral,
  getRitualSlotMinerals as buildRitualSlotMinerals,
  getPlayerSummary as buildPlayerSummary,
  getSelectedMineral as findSelectedMineral,
  getShopMaterialStates as buildShopMaterialStates,
  removeRitualSlot as runRemoveRitualSlot,
  revealSelectedMineralIfComplete as runRevealSelectedMineralIfComplete,
  selectMineral as runSelectMineral,
} from '../../core/logic';
import { QUICK_SLOT_COUNT } from '../../core/constants';
import { getMineralProgressView as buildMineralProgressView } from '../../core/progression';
import { createInitialGameState } from '../../core/state';
import type { GameState, MaterialType, MineralId, OwnedMineral, Rarity } from '../../core/models';
import type { ShopMaterialState } from '../../core/shop';
import type { PlayerSummary } from '../../core/summary';
import type { MineralProgressViewResult } from '../../core/progression';
import type {
  BuyAndSelectMineralResult,
  CompleteRitualOnSelectedMineralResult,
  RevealSelectedMineralIfCompleteResult,
} from '../../core/use-cases';
import type { SelectMineralResult } from '../../core/selection';
import type { AddRitualSlotResult, RemoveRitualSlotResult } from '../../core/slots';
import { ARTIFACTS } from '../../data/artifacts';
import { MATERIAL_DEFINITIONS, MATERIALS } from '../../data/materials';
import { createId } from '../../utils/id';
import { deserializeGameState, serializeGameState } from '../../utils/storage';

export function createGameState(startingEssence = 0): GameState {
  return createInitialGameState(startingEssence);
}

export const RITUAL_SLOT_LIMIT = QUICK_SLOT_COUNT;

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

export function completeSelectedRitual(
  state: GameState,
  minutes: number,
): CompleteRitualOnSelectedMineralResult {
  return runCompleteRitualOnSelectedMineral(state, minutes, MATERIAL_DEFINITIONS);
}

export function revealSelectedMineral(
  state: GameState,
  now: () => number = Date.now,
): RevealSelectedMineralIfCompleteResult {
  return runRevealSelectedMineralIfComplete(
    state,
    MATERIAL_DEFINITIONS,
    ARTIFACTS,
    now,
  );
}

export function addRitualSlot(state: GameState, mineralId: MineralId): AddRitualSlotResult {
  return runAddRitualSlot(state, mineralId);
}

export function removeRitualSlot(state: GameState, mineralId: MineralId): RemoveRitualSlotResult {
  return runRemoveRitualSlot(state, mineralId);
}

export function getRitualSlotMinerals(state: GameState): OwnedMineral[] {
  return buildRitualSlotMinerals(state);
}

export interface CollectionArtifactView {
  artifactId: string;
  name: string;
  rarity: Rarity | 'unknown';
  materialType: MaterialType | 'unknown';
  sourceMineralId: string;
  discoveredAt: number;
}

export function getCollectionArtifactViews(state: GameState): CollectionArtifactView[] {
  return state.collection.map((entry) => {
    const artifact = ARTIFACTS.find((definition) => definition.id === entry.artifactId);

    return {
      artifactId: entry.artifactId,
      name: artifact?.name ?? entry.artifactId,
      rarity: artifact?.rarity ?? 'unknown',
      materialType: artifact?.materialType ?? 'unknown',
      sourceMineralId: entry.sourceMineralId,
      discoveredAt: entry.discoveredAt,
    };
  });
}

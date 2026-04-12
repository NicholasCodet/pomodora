import type { PageLoad } from './$types';
import {
  buyAndSelectMineral,
  createGameState,
  getMineralProgressView,
  getPlayerSummary,
  getSelectedMineral,
  getShopMaterialStates,
} from '$lib/app/game';

export const load: PageLoad = () => {
  let state = createGameState(12);

  // Read-only UI snapshot: seed one selected mineral so progress panel has data.
  const buyResult = buyAndSelectMineral(state, 'clay', () => 0);
  if (buyResult.ok) {
    state = buyResult.state;
  }

  const summary = getPlayerSummary(state);
  const shopMaterials = getShopMaterialStates(state);
  const selectedMineral = getSelectedMineral(state);
  const selectedProgress = selectedMineral ? getMineralProgressView(selectedMineral) : null;

  return {
    summary,
    shopMaterials,
    selectedMineral,
    selectedProgress,
  };
};

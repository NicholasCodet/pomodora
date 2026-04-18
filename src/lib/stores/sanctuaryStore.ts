import { writable } from 'svelte/store';
import {
  buyAndSelectMineral,
  completeSelectedRitual as runCompleteSelectedRitual,
  createGameState,
  revealSelectedMineral as runRevealSelectedMineral,
  selectMineral as runSelectMineral,
} from '$lib/app/sanctuary';
import type { GameState, MaterialType, MineralId } from '../../core/models';

function createSanctuaryStore(initialEssence = 12) {
  const { subscribe, update } = writable<GameState>(createGameState(initialEssence));
  const buy = (materialType: MaterialType) => {
    let actionResult!: ReturnType<typeof buyAndSelectMineral>;
    update((state) => {
      const result = buyAndSelectMineral(state, materialType);
      actionResult = result;
      console.log(`Buy ${materialType} result:`, result);
      return result.ok ? result.state : state;
    });

    return actionResult;
  };

  return {
    subscribe,
    buyMineral(materialType: MaterialType) {
      return buy(materialType);
    },
    buyClay() {
      return buy('clay');
    },
    completeSelectedRitual(minutes: number) {
      let actionResult!: ReturnType<typeof runCompleteSelectedRitual>;
      update((state) => {
        const result = runCompleteSelectedRitual(state, minutes);
        actionResult = result;
        console.log(`Complete ritual (${minutes} min) result:`, result);
        return result.ok ? result.state : state;
      });

      return actionResult;
    },
    selectMineral(mineralId: MineralId) {
      let actionResult!: ReturnType<typeof runSelectMineral>;
      update((state) => {
        const result = runSelectMineral(state, mineralId);
        actionResult = result;
        console.log(`Select mineral (${mineralId}) result:`, result);
        return result.ok ? result.state : state;
      });

      return actionResult;
    },
    revealSelectedMineral() {
      let actionResult!: ReturnType<typeof runRevealSelectedMineral>;
      update((state) => {
        const result = runRevealSelectedMineral(state);
        actionResult = result;
        console.log('Reveal selected mineral result:', result);
        return result.ok ? result.state : state;
      });

      return actionResult;
    },
  };
}

export const sanctuaryStore = createSanctuaryStore();

import { writable } from 'svelte/store';
import {
  buyAndSelectMineral,
  completeSelectedRitual as runCompleteSelectedRitual,
  createGameState,
  revealSelectedMineral as runRevealSelectedMineral,
  selectMineral as runSelectMineral,
} from '$lib/app/game';
import type { GameState, MaterialType, MineralId } from '../../core/models';

function createSanctuaryStore(initialEssence = 12) {
  const { subscribe, update } = writable<GameState>(createGameState(initialEssence));
  const buy = (materialType: MaterialType) => {
    update((state) => {
      const result = buyAndSelectMineral(state, materialType);
      console.log(`Buy ${materialType} result:`, result);
      return result.ok ? result.state : state;
    });
  };

  return {
    subscribe,
    buyMineral(materialType: MaterialType) {
      buy(materialType);
    },
    buyClay() {
      buy('clay');
    },
    completeSelectedRitual(minutes: number) {
      update((state) => {
        const result = runCompleteSelectedRitual(state, minutes);
        console.log(`Complete ritual (${minutes} min) result:`, result);
        return result.ok ? result.state : state;
      });
    },
    selectMineral(mineralId: MineralId) {
      update((state) => {
        const result = runSelectMineral(state, mineralId);
        console.log(`Select mineral (${mineralId}) result:`, result);
        return result.ok ? result.state : state;
      });
    },
    revealSelectedMineral() {
      update((state) => {
        const result = runRevealSelectedMineral(state);
        console.log('Reveal selected mineral result:', result);
        return result.ok ? result.state : state;
      });
    },
  };
}

export const sanctuaryStore = createSanctuaryStore();

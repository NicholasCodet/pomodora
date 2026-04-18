import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import {
  addRitualSlot as runAddRitualSlot,
  buyAndSelectMineral,
  completeSelectedRitual as runCompleteSelectedRitual,
  createGameState,
  loadGameState,
  removeRitualSlot as runRemoveRitualSlot,
  revealSelectedMineral as runRevealSelectedMineral,
  saveGameState,
  selectMineral as runSelectMineral,
} from '$lib/app/sanctuary';
import { STORAGE_KEY } from '../../core/constants';
import type { GameState, MaterialType, MineralId } from '../../core/models';

function createSanctuaryStore(initialEssence = 12) {
  const { subscribe, set, update } = writable<GameState>(hydrateInitialState(initialEssence));

  function hydrateInitialState(startingEssence: number): GameState {
    if (!browser) {
      return createGameState(startingEssence);
    }

    try {
      return loadGameState(localStorage.getItem(STORAGE_KEY), startingEssence);
    } catch {
      return createGameState(startingEssence);
    }
  }

  function persistState(state: GameState): void {
    if (!browser) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, saveGameState(state));
    } catch {
      // Ignore storage write errors to keep gameplay usable.
    }
  }

  const buy = (materialType: MaterialType) => {
    let actionResult!: ReturnType<typeof buyAndSelectMineral>;
    update((state) => {
      const result = buyAndSelectMineral(state, materialType);
      actionResult = result;
      console.log(`Buy ${materialType} result:`, result);
      if (result.ok) {
        persistState(result.state);
        return result.state;
      }

      return state;
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
        if (result.ok) {
          persistState(result.state);
          return result.state;
        }

        return state;
      });

      return actionResult;
    },
    selectMineral(mineralId: MineralId) {
      let actionResult!: ReturnType<typeof runSelectMineral>;
      update((state) => {
        const result = runSelectMineral(state, mineralId);
        actionResult = result;
        console.log(`Select mineral (${mineralId}) result:`, result);
        if (result.ok) {
          persistState(result.state);
          return result.state;
        }

        return state;
      });

      return actionResult;
    },
    addRitualSlot(mineralId: MineralId) {
      let actionResult!: ReturnType<typeof runAddRitualSlot>;
      update((state) => {
        const result = runAddRitualSlot(state, mineralId);
        actionResult = result;
        console.log(`Add ritual slot (${mineralId}) result:`, result);
        if (result.ok) {
          persistState(result.state);
          return result.state;
        }

        return state;
      });

      return actionResult;
    },
    removeRitualSlot(mineralId: MineralId) {
      let actionResult!: ReturnType<typeof runRemoveRitualSlot>;
      update((state) => {
        const result = runRemoveRitualSlot(state, mineralId);
        actionResult = result;
        console.log(`Remove ritual slot (${mineralId}) result:`, result);
        if (result.ok) {
          persistState(result.state);
          return result.state;
        }

        return state;
      });

      return actionResult;
    },
    revealSelectedMineral() {
      let actionResult!: ReturnType<typeof runRevealSelectedMineral>;
      update((state) => {
        const result = runRevealSelectedMineral(state);
        actionResult = result;
        console.log('Reveal selected mineral result:', result);
        if (result.ok) {
          persistState(result.state);
          return result.state;
        }

        return state;
      });

      return actionResult;
    },
    resetSanctuary() {
      const resetState = createGameState(initialEssence);
      persistState(resetState);
      set(resetState);
      console.log('Sanctuary state reset.');
    },
  };
}

export const sanctuaryStore = createSanctuaryStore();

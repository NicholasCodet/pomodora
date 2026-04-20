import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import {
  getMineralProgressView,
  getSelectedMineral,
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

const RITUAL_TIMER_STORAGE_KEY = `${STORAGE_KEY}.ritual-timer`;
const ALLOWED_RITUAL_DURATIONS = [15, 30, 45] as const;

type RitualDurationMinutes = (typeof ALLOWED_RITUAL_DURATIONS)[number];

interface RitualRuntimeState {
  isRunning: boolean;
  durationMinutes: RitualDurationMinutes | null;
  endTimestamp: number | null;
  tickNowTimestamp: number;
}

type SanctuaryState = GameState & {
  ritualRuntime: RitualRuntimeState;
};

type StartRitualFailureReason =
  | 'already_running'
  | 'invalid_duration'
  | 'no_selected_mineral'
  | 'selected_mineral_completed'
  | 'selected_mineral_invalid';

type StartRitualResult =
  | {
      ok: true;
      state: SanctuaryState;
    }
  | {
      ok: false;
      reason: StartRitualFailureReason;
      state: SanctuaryState;
    };

type CancelRitualResult =
  | {
      ok: true;
      state: SanctuaryState;
    }
  | {
      ok: false;
      reason: 'not_running';
      state: SanctuaryState;
    };

type DebugCompleteRitualResult =
  | ReturnType<typeof runCompleteSelectedRitual>
  | {
      ok: false;
      reason: 'invalid_running_ritual';
      state: SanctuaryState;
    };

type SelectMineralActionResult =
  | ReturnType<typeof runSelectMineral>
  | {
      ok: false;
      reason: 'ritual_running';
      state: SanctuaryState;
    };

function createIdleRitualRuntime(now = Date.now()): RitualRuntimeState {
  return {
    isRunning: false,
    durationMinutes: null,
    endTimestamp: null,
    tickNowTimestamp: now,
  };
}

function isRitualDuration(value: number): value is RitualDurationMinutes {
  return ALLOWED_RITUAL_DURATIONS.some((duration) => duration === value);
}

function deserializeRitualRuntime(raw: string | null | undefined): RitualRuntimeState {
  if (!raw) {
    return createIdleRitualRuntime();
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return createIdleRitualRuntime();
    }

    const record = parsed as Record<string, unknown>;
    if (typeof record.isRunning !== 'boolean') {
      return createIdleRitualRuntime();
    }

    const durationMinutes = record.durationMinutes;
    const endTimestamp = record.endTimestamp;
    const tickNowTimestamp = record.tickNowTimestamp;
    const validDuration =
      durationMinutes === null || (typeof durationMinutes === 'number' && isRitualDuration(durationMinutes));
    const validEnd =
      endTimestamp === null ||
      (typeof endTimestamp === 'number' && Number.isFinite(endTimestamp) && endTimestamp > 0);
    const validTick =
      typeof tickNowTimestamp === 'number' &&
      Number.isFinite(tickNowTimestamp) &&
      tickNowTimestamp > 0;

    if (!validDuration || !validEnd || !validTick) {
      return createIdleRitualRuntime();
    }

    if (!record.isRunning) {
      return createIdleRitualRuntime(tickNowTimestamp);
    }

    if (durationMinutes === null || endTimestamp === null) {
      return createIdleRitualRuntime(tickNowTimestamp);
    }

    return {
      isRunning: true,
      durationMinutes,
      endTimestamp,
      tickNowTimestamp,
    };
  } catch {
    return createIdleRitualRuntime();
  }
}

function getFallbackSelectedMineralId(state: SanctuaryState): MineralId | null {
  if (
    state.selectedMineralId !== null &&
    state.inventory.some((entry) => entry.id === state.selectedMineralId)
  ) {
    return state.selectedMineralId;
  }

  const inventoryIds = new Set(state.inventory.map((entry) => entry.id));
  const firstValidSlotMineralId = state.ritualSlotMineralIds.find((id) => inventoryIds.has(id));
  if (firstValidSlotMineralId) {
    return firstValidSlotMineralId;
  }

  return state.inventory[0]?.id ?? null;
}

function applySelectionFallback(state: SanctuaryState): SanctuaryState {
  // While a ritual is running, keep the current target mineral stable.
  if (state.ritualRuntime.isRunning) {
    return state;
  }

  const nextSelectedMineralId = getFallbackSelectedMineralId(state);
  if (nextSelectedMineralId === state.selectedMineralId) {
    return state;
  }

  return {
    ...state,
    selectedMineralId: nextSelectedMineralId,
  };
}

function createSanctuaryStore(initialEssence = 12) {
  let timerIntervalId: ReturnType<typeof setInterval> | null = null;
  const { subscribe, set, update } = writable<SanctuaryState>(hydrateInitialState(initialEssence));

  function hydrateInitialState(startingEssence: number): SanctuaryState {
    const now = Date.now();
    const defaultState: SanctuaryState = {
      ...createGameState(startingEssence),
      ritualRuntime: createIdleRitualRuntime(now),
    };

    if (!browser) {
      return defaultState;
    }

    try {
      const gameState = loadGameState(localStorage.getItem(STORAGE_KEY), startingEssence);
      const ritualRuntime = deserializeRitualRuntime(localStorage.getItem(RITUAL_TIMER_STORAGE_KEY));
      return applySelectionFallback({
        ...gameState,
        ritualRuntime,
      });
    } catch {
      return defaultState;
    }
  }

  function clearTimerInterval(): void {
    if (timerIntervalId !== null) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }
  }

  function persistState(state: SanctuaryState): void {
    if (!browser) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, saveGameState(state));
      localStorage.setItem(RITUAL_TIMER_STORAGE_KEY, JSON.stringify(state.ritualRuntime));
    } catch {
      // Ignore storage write errors to keep gameplay usable.
    }
  }

  function toPersistedState(state: SanctuaryState, nextGameState: GameState): SanctuaryState {
    const nextState = applySelectionFallback({
      ...nextGameState,
      ritualRuntime: state.ritualRuntime,
    });
    persistState(nextState);
    return nextState;
  }

  function ensureTimerInterval(): void {
    if (timerIntervalId !== null || !browser) {
      return;
    }

    timerIntervalId = setInterval(() => {
      update((state) => {
        const ritualRuntime = state.ritualRuntime;
        if (!ritualRuntime.isRunning) {
          clearTimerInterval();
          return state;
        }

        const now = Date.now();
        if (
          ritualRuntime.endTimestamp === null ||
          ritualRuntime.durationMinutes === null ||
          !isRitualDuration(ritualRuntime.durationMinutes)
        ) {
          const resetState = applySelectionFallback({
            ...state,
            ritualRuntime: createIdleRitualRuntime(now),
          });
          clearTimerInterval();
          persistState(resetState);
          return resetState;
        }

        if (now >= ritualRuntime.endTimestamp) {
          const completion = runCompleteSelectedRitual(state, ritualRuntime.durationMinutes);
          const nextGameState = completion.ok ? completion.state : state;
          const nextState = applySelectionFallback({
            ...nextGameState,
            ritualRuntime: createIdleRitualRuntime(now),
          });
          clearTimerInterval();
          persistState(nextState);
          return nextState;
        }

        return {
          ...state,
          ritualRuntime: {
            ...ritualRuntime,
            tickNowTimestamp: now,
          },
        };
      });
    }, 1000);
  }

  function resumeOrCompleteHydratedRitual(): void {
    if (!browser) {
      return;
    }

    update((state) => {
      const ritualRuntime = state.ritualRuntime;
      if (!ritualRuntime.isRunning) {
        return state;
      }

      const now = Date.now();
      if (
        ritualRuntime.endTimestamp === null ||
        ritualRuntime.durationMinutes === null ||
        !isRitualDuration(ritualRuntime.durationMinutes)
      ) {
        const resetState = applySelectionFallback({
          ...state,
          ritualRuntime: createIdleRitualRuntime(now),
        });
        persistState(resetState);
        return resetState;
      }

      if (now >= ritualRuntime.endTimestamp) {
        const completion = runCompleteSelectedRitual(state, ritualRuntime.durationMinutes);
        const nextGameState = completion.ok ? completion.state : state;
        const completedState = applySelectionFallback({
          ...nextGameState,
          ritualRuntime: createIdleRitualRuntime(now),
        });
        persistState(completedState);
        return completedState;
      }

      ensureTimerInterval();
      return {
        ...state,
        ritualRuntime: {
          ...ritualRuntime,
          tickNowTimestamp: now,
        },
      };
    });
  }

  const buy = (materialType: MaterialType) => {
    let actionResult!: ReturnType<typeof buyAndSelectMineral>;
    update((state) => {
      const result = buyAndSelectMineral(state, materialType);
      actionResult = result;
      console.log(`Buy ${materialType} result:`, result);
      if (result.ok) {
        return toPersistedState(state, result.state);
      }

      return state;
    });

    return actionResult;
  };

  resumeOrCompleteHydratedRitual();

  return {
    subscribe,
    ensureRitualSelection() {
      let didUpdateSelection = false;
      update((state) => {
        const nextState = applySelectionFallback(state);
        didUpdateSelection = nextState !== state;
        if (didUpdateSelection) {
          persistState(nextState);
        }
        return nextState;
      });

      return didUpdateSelection;
    },
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
          return toPersistedState(state, result.state);
        }

        return state;
      });

      return actionResult;
    },
    selectMineral(mineralId: MineralId) {
      let actionResult!: SelectMineralActionResult;
      update((state) => {
        if (state.ritualRuntime.isRunning) {
          actionResult = {
            ok: false,
            reason: 'ritual_running',
            state,
          };
          return state;
        }

        const result = runSelectMineral(state, mineralId);
        actionResult = result;
        console.log(`Select mineral (${mineralId}) result:`, result);
        if (result.ok) {
          return toPersistedState(state, result.state);
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
          return toPersistedState(state, result.state);
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
          return toPersistedState(state, result.state);
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
          return toPersistedState(state, result.state);
        }

        return state;
      });

      return actionResult;
    },
    startRitual(minutes: number): StartRitualResult {
      let actionResult!: StartRitualResult;
      update((state) => {
        if (state.ritualRuntime.isRunning) {
          actionResult = {
            ok: false,
            reason: 'already_running',
            state,
          };
          return state;
        }

        const workingState = applySelectionFallback(state);
        if (workingState !== state) {
          persistState(workingState);
        }

        if (!isRitualDuration(minutes)) {
          actionResult = {
            ok: false,
            reason: 'invalid_duration',
            state: workingState,
          };
          return workingState;
        }

        const selectedMineral = getSelectedMineral(workingState);
        if (!selectedMineral) {
          actionResult = {
            ok: false,
            reason: 'no_selected_mineral',
            state: workingState,
          };
          return workingState;
        }

        const progress = getMineralProgressView(selectedMineral);
        if (!progress.ok) {
          actionResult = {
            ok: false,
            reason: 'selected_mineral_invalid',
            state: workingState,
          };
          return workingState;
        }

        if (progress.view.isCompleted) {
          actionResult = {
            ok: false,
            reason: 'selected_mineral_completed',
            state: workingState,
          };
          return workingState;
        }

        const now = Date.now();
        const nextState: SanctuaryState = {
          ...workingState,
          ritualRuntime: {
            isRunning: true,
            durationMinutes: minutes,
            endTimestamp: now + minutes * 60 * 1000,
            tickNowTimestamp: now,
          },
        };
        actionResult = {
          ok: true,
          state: nextState,
        };
        persistState(nextState);
        ensureTimerInterval();
        return nextState;
      });

      return actionResult;
    },
    cancelRitual(): CancelRitualResult {
      let actionResult!: CancelRitualResult;
      update((state) => {
        if (!state.ritualRuntime.isRunning) {
          actionResult = {
            ok: false,
            reason: 'not_running',
            state,
          };
          return state;
        }

        clearTimerInterval();
        const nextState = applySelectionFallback({
          ...state,
          ritualRuntime: createIdleRitualRuntime(Date.now()),
        });
        actionResult = {
          ok: true,
          state: nextState,
        };
        persistState(nextState);
        return nextState;
      });

      return actionResult;
    },
    completeRitualInstantDebug(): DebugCompleteRitualResult {
      let actionResult!: DebugCompleteRitualResult;
      update((state) => {
        const minutes = state.ritualRuntime.isRunning ? state.ritualRuntime.durationMinutes : 30;
        if (!minutes || !isRitualDuration(minutes)) {
          actionResult = {
            ok: false,
            reason: 'invalid_running_ritual',
            state,
          };
          return state;
        }

        const completion = runCompleteSelectedRitual(state, minutes);
        actionResult = completion as DebugCompleteRitualResult;
        if (!completion.ok) {
          return state;
        }

        clearTimerInterval();
        const nextState = applySelectionFallback({
          ...completion.state,
          ritualRuntime: createIdleRitualRuntime(Date.now()),
        });
        persistState(nextState);
        return nextState;
      });

      return actionResult;
    },
    resetSanctuary() {
      clearTimerInterval();
      const resetState = createGameState(initialEssence);
      const nextState: SanctuaryState = {
        ...resetState,
        ritualRuntime: createIdleRitualRuntime(Date.now()),
      };
      persistState(nextState);
      set(nextState);
      console.log('Sanctuary state reset.');
    },
  };
}

export const sanctuaryStore = createSanctuaryStore();

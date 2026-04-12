/**
 * Lightweight application/use-case layer.
 * Composes domain actions into user-intent flows without changing domain rules.
 */
import { getSelectedMineral, selectMineral } from './selection';
import { purchaseMineral } from './purchase';
import { applyCompletedRitual } from './ritual';
import { revealArtifactIfComplete } from './reveal';
import type {
  ArtifactDefinition,
  Essence,
  GameState,
  MaterialDefinition,
  MaterialType,
  MineralId,
  Minutes,
  OwnedMineral,
} from './models';
import type { PurchaseMineralFailureReason } from './purchase';
import type { ApplyCompletedRitualFailureReason } from './ritual';
import type { RevealArtifactFailureReason } from './reveal';
import type { SelectMineralFailureReason } from './selection';

export type UseCaseSelectionFailureReason = 'no_selected_mineral';

export type BuyAndSelectMineralFailureReason =
  | PurchaseMineralFailureReason
  | SelectMineralFailureReason;

export type BuyAndSelectMineralResult =
  | {
      ok: true;
      state: GameState;
      mineral: OwnedMineral;
      material: MaterialDefinition;
    }
  | {
      ok: false;
      reason: BuyAndSelectMineralFailureReason;
      state: GameState;
    };

/**
 * Purchases a mineral and makes it the active selection.
 */
export function buyAndSelectMineral(
  state: GameState,
  materialType: MaterialType,
  materialDefinitions: Readonly<Record<MaterialType, MaterialDefinition>>,
  createMineralId: () => MineralId,
  random: () => number = Math.random,
): BuyAndSelectMineralResult {
  const purchase = purchaseMineral(
    state,
    materialType,
    materialDefinitions,
    createMineralId,
    random,
  );
  if (!purchase.ok) {
    return {
      ok: false,
      reason: purchase.reason,
      state: purchase.state,
    };
  }

  const selection = selectMineral(purchase.state, purchase.mineral.id);
  if (!selection.ok) {
    return {
      ok: false,
      reason: selection.reason,
      state: selection.state,
    };
  }

  return {
    ok: true,
    state: selection.state,
    mineral: purchase.mineral,
    material: purchase.material,
  };
}

export type CompleteRitualOnSelectedMineralFailureReason =
  | UseCaseSelectionFailureReason
  | ApplyCompletedRitualFailureReason;

export type CompleteRitualOnSelectedMineralResult =
  | {
      ok: true;
      state: GameState;
      mineral: OwnedMineral;
      essenceGain: Essence;
    }
  | {
      ok: false;
      reason: CompleteRitualOnSelectedMineralFailureReason;
      state: GameState;
    };

/**
 * Applies worked minutes to the currently selected mineral.
 */
export function completeRitualOnSelectedMineral(
  state: GameState,
  completedMinutes: Minutes,
  materialDefinitions: Readonly<Record<MaterialType, MaterialDefinition>>,
): CompleteRitualOnSelectedMineralResult {
  const selectedMineral = getSelectedMineral(state);
  if (!selectedMineral) {
    return {
      ok: false,
      reason: 'no_selected_mineral',
      state,
    };
  }

  const ritual = applyCompletedRitual(
    state,
    selectedMineral.id,
    completedMinutes,
    materialDefinitions,
  );

  if (!ritual.ok) {
    return {
      ok: false,
      reason: ritual.reason,
      state: ritual.state,
    };
  }

  return {
    ok: true,
    state: ritual.state,
    mineral: ritual.mineral,
    essenceGain: ritual.essenceGain,
  };
}

export type RevealSelectedMineralIfCompleteFailureReason =
  | UseCaseSelectionFailureReason
  | RevealArtifactFailureReason;

export type RevealSelectedMineralIfCompleteResult =
  | {
      ok: true;
      state: GameState;
      artifact: ArtifactDefinition;
      mineral: OwnedMineral;
    }
  | {
      ok: false;
      reason: RevealSelectedMineralIfCompleteFailureReason;
      state: GameState;
    };

/**
 * Reveals the currently selected mineral when completion rules are satisfied.
 */
export function revealSelectedMineralIfComplete(
  state: GameState,
  materialDefinitions: Readonly<Record<MaterialType, MaterialDefinition>>,
  artifactDefinitions: readonly ArtifactDefinition[],
  now: () => number = Date.now,
): RevealSelectedMineralIfCompleteResult {
  const selectedMineral = getSelectedMineral(state);
  if (!selectedMineral) {
    return {
      ok: false,
      reason: 'no_selected_mineral',
      state,
    };
  }

  const reveal = revealArtifactIfComplete(
    state,
    selectedMineral.id,
    materialDefinitions,
    artifactDefinitions,
    now,
  );

  if (!reveal.ok) {
    return {
      ok: false,
      reason: reveal.reason,
      state: reveal.state,
    };
  }

  return {
    ok: true,
    state: reveal.state,
    artifact: reveal.artifact,
    mineral: reveal.mineral,
  };
}

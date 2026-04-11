import {
  applyCompletedRitual,
  getSelectedMineral,
  getShopMaterialStates,
  purchaseMineral,
  revealArtifactIfComplete,
  selectMineral,
} from './core/logic';
import type { GameState, MaterialDefinition, MaterialType, MineralId } from './core/models';
import { getMineralProgressView, getUnlockedMaterials } from './core/progression';
import { createInitialGameState } from './core/state';
import { ARTIFACTS } from './data/artifacts';
import { MATERIAL_DEFINITIONS, MATERIALS } from './data/materials';
import { createId } from './utils/id';

function createState(essence: number): GameState {
  return createInitialGameState(essence);
}

function section(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function logFailure(result: { ok: false; reason: string }): void {
  console.log(`result: ok=false, reason=${result.reason}`);
}

function formatMaterialTypes(materials: readonly MaterialDefinition[]): string {
  return materials.map((material) => material.type).join(', ');
}

function printShopMaterialStates(label: string, state: GameState): void {
  console.log(label);
  const shopStates = getShopMaterialStates(state, MATERIALS);
  for (const material of shopStates) {
    const blocked = material.blockedReason ?? 'none';
    console.log(
      `- ${material.type}: unlocked=${material.isUnlocked}, afford=${material.canAfford}, canPurchase=${material.canPurchase}, blocked=${blocked}`,
    );
  }
}

function scenarioPurchaseInsufficientEssence(): void {
  section('Purchase With Insufficient Essence');
  const state = createState(0);
  const result = purchaseMineral(state, 'clay', MATERIAL_DEFINITIONS, () => createId('mineral'));
  if (result.ok) {
    console.log('unexpected success');
    return;
  }
  logFailure(result);
}

function scenarioInvalidMaterialType(): void {
  section('Purchase With Invalid Material Type');
  const state = createState(100);
  // Runtime safety check: bypassing compile-time union on purpose.
  const invalidMaterialType = 'obsidian' as unknown as MaterialType;
  const result = purchaseMineral(
    state,
    invalidMaterialType,
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
  );
  if (result.ok) {
    console.log('unexpected success');
    return;
  }
  logFailure(result);
}

function purchaseClayOrThrow(essence: number): { state: GameState; mineralId: MineralId } {
  const purchase = purchaseMineral(
    createState(essence),
    'clay',
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    () => 0,
  );

  if (!purchase.ok) {
    throw new Error(`Expected purchase to succeed but failed: ${purchase.reason}`);
  }

  return {
    state: purchase.state,
    mineralId: purchase.mineral.id,
  };
}

function scenarioSelectValidMineral(): void {
  section('Select Valid Mineral');

  const firstPurchase = purchaseMineral(
    createState(100),
    'clay',
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    () => 0,
  );
  if (!firstPurchase.ok) {
    logFailure(firstPurchase);
    return;
  }

  const secondPurchase = purchaseMineral(
    firstPurchase.state,
    'clay',
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    () => 0,
  );
  if (!secondPurchase.ok) {
    logFailure(secondPurchase);
    return;
  }

  const selectResult = selectMineral(secondPurchase.state, secondPurchase.mineral.id);
  if (!selectResult.ok) {
    logFailure(selectResult);
    return;
  }

  console.log(
    `result: ok=true, selectedMineralId=${selectResult.state.selectedMineralId}`,
  );
}

function scenarioSelectInvalidMineral(): void {
  section('Select Invalid Mineral');
  const { state } = purchaseClayOrThrow(10);
  const selectResult = selectMineral(state, 'missing-mineral-id');
  if (selectResult.ok) {
    console.log('unexpected success');
    return;
  }
  logFailure(selectResult);
}

function scenarioSelectedMineralReadHelpers(): void {
  section('Selected Mineral Read Helpers');

  const startState = createState(10);
  const selectedAtStart = getSelectedMineral(startState);
  console.log(`no selected mineral: ${selectedAtStart === null ? 'null' : 'unexpected mineral'}`);

  const purchase = purchaseMineral(
    startState,
    'clay',
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    () => 0,
  );
  if (!purchase.ok) {
    logFailure(purchase);
    return;
  }

  const invalidSelectedState: GameState = {
    ...purchase.state,
    selectedMineralId: 'missing-mineral-id',
  };
  const invalidSelected = getSelectedMineral(invalidSelectedState);
  console.log(
    `invalid selectedMineralId: ${invalidSelected === null ? 'null' : 'unexpected mineral'}`,
  );

  const ritual = applyCompletedRitual(
    purchase.state,
    purchase.mineral.id,
    40,
    MATERIAL_DEFINITIONS,
  );
  if (!ritual.ok) {
    logFailure(ritual);
    return;
  }

  const selectedAfterRitual = getSelectedMineral(ritual.state);
  if (!selectedAfterRitual) {
    console.log('unexpected null selected mineral after ritual');
    return;
  }

  const materialDefinition = MATERIAL_DEFINITIONS[selectedAfterRitual.materialType];
  const progressView = getMineralProgressView(selectedAfterRitual, materialDefinition);
  if (!progressView.ok) {
    logFailure(progressView);
    return;
  }

  console.log(
    `selected progress: type=${progressView.view.materialType}, stage=${progressView.view.currentStage}/${progressView.view.stageCount}, worked=${progressView.view.workedMinutes}, next=${progressView.view.nextThreshold ?? 'none'}, remaining=${progressView.view.remainingMinutesToNextStage ?? 'none'}, completed=${progressView.view.isCompleted}`,
  );
}

function scenarioRitualZeroMinutes(): void {
  section('Apply Ritual With 0 Minutes');
  const { state, mineralId } = purchaseClayOrThrow(10);
  const result = applyCompletedRitual(state, mineralId, 0, MATERIAL_DEFINITIONS);
  if (result.ok) {
    console.log('unexpected success');
    return;
  }
  logFailure(result);
}

function scenarioRitualUnknownMineral(): void {
  section('Apply Ritual To Non-existent Mineral');
  const state = createState(5);
  const result = applyCompletedRitual(state, 'missing-mineral', 25, MATERIAL_DEFINITIONS);
  if (result.ok) {
    console.log('unexpected success');
    return;
  }
  logFailure(result);
}

function scenarioRitualAlreadyCompleted(): void {
  section('Apply Ritual To Already Completed Mineral');
  const { state: purchasedState, mineralId } = purchaseClayOrThrow(10);
  const firstRitual = applyCompletedRitual(purchasedState, mineralId, 90, MATERIAL_DEFINITIONS);
  if (!firstRitual.ok) {
    logFailure(firstRitual);
    return;
  }

  const secondRitual = applyCompletedRitual(firstRitual.state, mineralId, 5, MATERIAL_DEFINITIONS);
  if (secondRitual.ok) {
    console.log('unexpected success');
    return;
  }
  logFailure(secondRitual);
}

function scenarioRevealBeforeCompletion(): void {
  section('Reveal Before Completion');
  const { state, mineralId } = purchaseClayOrThrow(10);
  const reveal = revealArtifactIfComplete(state, mineralId, MATERIAL_DEFINITIONS, ARTIFACTS);
  if (reveal.ok) {
    console.log('unexpected success');
    return;
  }
  logFailure(reveal);
}

function scenarioRevealTwice(): void {
  section('Reveal Artifact Twice');
  const { state: purchasedState, mineralId } = purchaseClayOrThrow(10);
  const ritual = applyCompletedRitual(purchasedState, mineralId, 90, MATERIAL_DEFINITIONS);
  if (!ritual.ok) {
    logFailure(ritual);
    return;
  }

  const firstReveal = revealArtifactIfComplete(
    ritual.state,
    mineralId,
    MATERIAL_DEFINITIONS,
    ARTIFACTS,
  );
  if (!firstReveal.ok) {
    logFailure(firstReveal);
    return;
  }

  console.log(`first reveal: ok=true, artifact=${firstReveal.artifact.id}`);

  const secondReveal = revealArtifactIfComplete(
    firstReveal.state,
    mineralId,
    MATERIAL_DEFINITIONS,
    ARTIFACTS,
  );

  if (secondReveal.ok) {
    console.log('unexpected second reveal success');
    return;
  }

  logFailure(secondReveal);
}

function scenarioCorruptedMaterialDefinition(): void {
  section('Corrupted Material Definition (Invalid Thresholds)');

  const corruptedDefinitions: Readonly<Record<MaterialType, MaterialDefinition>> = {
    ...MATERIAL_DEFINITIONS,
    clay: {
      ...MATERIAL_DEFINITIONS.clay,
      stageThresholds: [30, 20, 90],
    },
  };

  const purchase = purchaseMineral(createState(10), 'clay', corruptedDefinitions, () =>
    createId('mineral'),
  );
  if (purchase.ok) {
    console.log('unexpected success');
    return;
  }
  logFailure(purchase);
}

function scenarioPurchaseLockedThenUnlocked(): void {
  section('Purchase Locked Then Unlocked Material');

  let state = createState(20);
  const lockedAttempt = purchaseMineral(
    state,
    'limestone',
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    () => 0,
  );

  if (lockedAttempt.ok) {
    console.log('unexpected success');
    return;
  }
  console.log(`start purchase limestone: ok=false, reason=${lockedAttempt.reason}`);

  const clayPurchase = purchaseMineral(
    state,
    'clay',
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    () => 0,
  );
  if (!clayPurchase.ok) {
    logFailure(clayPurchase);
    return;
  }
  state = clayPurchase.state;

  for (const minutes of [30, 30, 30]) {
    const ritual = applyCompletedRitual(state, clayPurchase.mineral.id, minutes, MATERIAL_DEFINITIONS);
    if (!ritual.ok) {
      logFailure(ritual);
      return;
    }
    state = ritual.state;
  }

  const unlockedAttempt = purchaseMineral(
    state,
    'limestone',
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    () => 0,
  );
  if (!unlockedAttempt.ok) {
    logFailure(unlockedAttempt);
    return;
  }

  console.log(
    `after progress purchase limestone: ok=true, mineralId=${unlockedAttempt.mineral.id}`,
  );
}

function scenarioMaterialUnlockProgression(): void {
  section('Material Unlock Progression');

  let state = createState(5);
  const unlockedAtStart = getUnlockedMaterials(state, MATERIALS);
  console.log(`start unlocked: ${formatMaterialTypes(unlockedAtStart)}`);
  printShopMaterialStates('shop at start:', state);

  const firstPurchase = purchaseMineral(
    state,
    'clay',
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    () => 0,
  );
  if (!firstPurchase.ok) {
    logFailure(firstPurchase);
    return;
  }
  state = firstPurchase.state;

  for (const minutes of [30, 30, 30]) {
    const ritual = applyCompletedRitual(state, firstPurchase.mineral.id, minutes, MATERIAL_DEFINITIONS);
    if (!ritual.ok) {
      logFailure(ritual);
      return;
    }
    state = ritual.state;
  }

  const secondPurchase = purchaseMineral(
    state,
    'clay',
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    () => 0,
  );
  if (!secondPurchase.ok) {
    logFailure(secondPurchase);
    return;
  }
  state = secondPurchase.state;

  for (const minutes of [30, 30, 30]) {
    const ritual = applyCompletedRitual(
      state,
      secondPurchase.mineral.id,
      minutes,
      MATERIAL_DEFINITIONS,
    );
    if (!ritual.ok) {
      logFailure(ritual);
      return;
    }
    state = ritual.state;
  }

  const unlockedAfterProgress = getUnlockedMaterials(state, MATERIALS);
  console.log(
    `after progress (rituals=${state.player.stats.completedRituals}, worked=${state.player.stats.totalWorkedMinutes}): ${formatMaterialTypes(unlockedAfterProgress)}`,
  );
  printShopMaterialStates('shop after progress:', state);
}

function runSandbox(): void {
  console.log('Pomodora Sanctuary Domain Edge-case Sandbox');
  scenarioPurchaseInsufficientEssence();
  scenarioInvalidMaterialType();
  scenarioSelectValidMineral();
  scenarioSelectInvalidMineral();
  scenarioSelectedMineralReadHelpers();
  scenarioRitualZeroMinutes();
  scenarioRitualUnknownMineral();
  scenarioRitualAlreadyCompleted();
  scenarioRevealBeforeCompletion();
  scenarioRevealTwice();
  scenarioCorruptedMaterialDefinition();
  scenarioPurchaseLockedThenUnlocked();
  scenarioMaterialUnlockProgression();
}

runSandbox();

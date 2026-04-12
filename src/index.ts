import {
  applyCompletedRitual,
  buyAndSelectMineral,
  completeRitualOnSelectedMineral,
  getPlayerSummary,
  getSelectedMineral,
  getShopMaterialStates,
  purchaseMineral,
  revealArtifactIfComplete,
  revealSelectedMineralIfComplete,
  selectMineral,
} from './core/logic';
import type { GameState, MaterialDefinition, MaterialType, MineralId } from './core/models';
import { getMineralProgressView, getUnlockedMaterials } from './core/progression';
import { createInitialGameState } from './core/state';
import { ARTIFACTS } from './data/artifacts';
import { MATERIAL_DEFINITIONS, MATERIALS } from './data/materials';
import { createId } from './utils/id';

interface FailureResult {
  ok: false;
  reason: string;
}

function createState(essence: number): GameState {
  return createInitialGameState(essence);
}

function printSuite(title: string): void {
  console.log(`\n\n##### ${title} #####`);
}

function printSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function printFailureResult(result: FailureResult): void {
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

function printPlayerSummary(label: string, state: GameState): void {
  const summary = getPlayerSummary(state, MATERIALS);
  console.log(
    `${label} essence=${summary.essence}, rituals=${summary.completedRituals}, worked=${summary.totalWorkedMinutes}, unlocked=${summary.unlockedMaterialTypes.join(', ')}, unlockedCount=${summary.unlockedMaterialCount}, collection=${summary.collectionCount}, inventory=${summary.inventoryCount}, selected=${summary.selectedMineralId ?? 'none'}`,
  );
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

function scenarioSummarySnapshot(): void {
  printSection('Player Summary');

  let state = createState(5);
  printPlayerSummary('start:', state);

  const purchase = purchaseMineral(
    state,
    'clay',
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    () => 0,
  );
  if (!purchase.ok) {
    printFailureResult(purchase);
    return;
  }
  state = purchase.state;

  for (const minutes of [30, 30, 30]) {
    const ritual = applyCompletedRitual(state, purchase.mineral.id, minutes, MATERIAL_DEFINITIONS);
    if (!ritual.ok) {
      printFailureResult(ritual);
      return;
    }
    state = ritual.state;
  }

  const reveal = revealArtifactIfComplete(
    state,
    purchase.mineral.id,
    MATERIAL_DEFINITIONS,
    ARTIFACTS,
  );
  if (!reveal.ok) {
    printFailureResult(reveal);
    return;
  }
  state = reveal.state;

  printPlayerSummary('after progress:', state);
}

function scenarioUseCaseFlow(): void {
  printSection('Use Case Flow: Buy + Ritual + Reveal');

  let state = createState(10);

  const buy = buyAndSelectMineral(
    state,
    'clay',
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    () => 0,
  );
  if (!buy.ok) {
    printFailureResult(buy);
    return;
  }
  state = buy.state;

  console.log(
    `buyAndSelectMineral: ok=true, mineralId=${buy.mineral.id}, selected=${state.selectedMineralId}`,
  );

  for (const minutes of [30, 30, 30]) {
    const ritual = completeRitualOnSelectedMineral(state, minutes, MATERIAL_DEFINITIONS);
    if (!ritual.ok) {
      printFailureResult(ritual);
      return;
    }
    state = ritual.state;
    console.log(
      `completeRitualOnSelectedMineral: ok=true, worked=${ritual.mineral.workedMinutes}, essenceGain=${ritual.essenceGain}`,
    );
  }

  const reveal = revealSelectedMineralIfComplete(
    state,
    MATERIAL_DEFINITIONS,
    ARTIFACTS,
  );
  if (!reveal.ok) {
    printFailureResult(reveal);
    return;
  }

  console.log(`revealSelectedMineralIfComplete: ok=true, artifact=${reveal.artifact.id}`);
}

function scenarioSelectValidMineral(): void {
  printSection('Select Valid Mineral');

  const firstPurchase = purchaseMineral(
    createState(100),
    'clay',
    MATERIAL_DEFINITIONS,
    () => createId('mineral'),
    () => 0,
  );
  if (!firstPurchase.ok) {
    printFailureResult(firstPurchase);
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
    printFailureResult(secondPurchase);
    return;
  }

  const selectResult = selectMineral(secondPurchase.state, secondPurchase.mineral.id);
  if (!selectResult.ok) {
    printFailureResult(selectResult);
    return;
  }

  console.log(`result: ok=true, selectedMineralId=${selectResult.state.selectedMineralId}`);
}

function scenarioSelectedMineralReadHelpers(): void {
  printSection('Selected Mineral Read Helpers');

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
    printFailureResult(purchase);
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
    printFailureResult(ritual);
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
    printFailureResult(progressView);
    return;
  }

  console.log(
    `selected progress: type=${progressView.view.materialType}, stage=${progressView.view.currentStage}/${progressView.view.stageCount}, worked=${progressView.view.workedMinutes}, next=${progressView.view.nextThreshold ?? 'none'}, remaining=${progressView.view.remainingMinutesToNextStage ?? 'none'}, completed=${progressView.view.isCompleted}`,
  );
}

function scenarioPurchaseInsufficientEssence(): void {
  printSection('Purchase With Insufficient Essence');
  const state = createState(0);
  const result = purchaseMineral(state, 'clay', MATERIAL_DEFINITIONS, () => createId('mineral'));
  if (result.ok) {
    console.log('unexpected success');
    return;
  }
  printFailureResult(result);
}

function scenarioInvalidMaterialType(): void {
  printSection('Purchase With Invalid Material Type');
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
  printFailureResult(result);
}

function scenarioSelectInvalidMineral(): void {
  printSection('Select Invalid Mineral');
  const { state } = purchaseClayOrThrow(10);
  const selectResult = selectMineral(state, 'missing-mineral-id');
  if (selectResult.ok) {
    console.log('unexpected success');
    return;
  }
  printFailureResult(selectResult);
}

function scenarioRitualZeroMinutes(): void {
  printSection('Apply Ritual With 0 Minutes');
  const { state, mineralId } = purchaseClayOrThrow(10);
  const result = applyCompletedRitual(state, mineralId, 0, MATERIAL_DEFINITIONS);
  if (result.ok) {
    console.log('unexpected success');
    return;
  }
  printFailureResult(result);
}

function scenarioRitualUnknownMineral(): void {
  printSection('Apply Ritual To Non-existent Mineral');
  const state = createState(5);
  const result = applyCompletedRitual(state, 'missing-mineral', 25, MATERIAL_DEFINITIONS);
  if (result.ok) {
    console.log('unexpected success');
    return;
  }
  printFailureResult(result);
}

function scenarioRitualAlreadyCompleted(): void {
  printSection('Apply Ritual To Already Completed Mineral');
  const { state: purchasedState, mineralId } = purchaseClayOrThrow(10);
  const firstRitual = applyCompletedRitual(purchasedState, mineralId, 90, MATERIAL_DEFINITIONS);
  if (!firstRitual.ok) {
    printFailureResult(firstRitual);
    return;
  }

  const secondRitual = applyCompletedRitual(firstRitual.state, mineralId, 5, MATERIAL_DEFINITIONS);
  if (secondRitual.ok) {
    console.log('unexpected success');
    return;
  }
  printFailureResult(secondRitual);
}

function scenarioRevealBeforeCompletion(): void {
  printSection('Reveal Before Completion');
  const { state, mineralId } = purchaseClayOrThrow(10);
  const reveal = revealArtifactIfComplete(state, mineralId, MATERIAL_DEFINITIONS, ARTIFACTS);
  if (reveal.ok) {
    console.log('unexpected success');
    return;
  }
  printFailureResult(reveal);
}

function scenarioRevealTwice(): void {
  printSection('Reveal Artifact Twice');
  const { state: purchasedState, mineralId } = purchaseClayOrThrow(10);
  const ritual = applyCompletedRitual(purchasedState, mineralId, 90, MATERIAL_DEFINITIONS);
  if (!ritual.ok) {
    printFailureResult(ritual);
    return;
  }

  const firstReveal = revealArtifactIfComplete(
    ritual.state,
    mineralId,
    MATERIAL_DEFINITIONS,
    ARTIFACTS,
  );
  if (!firstReveal.ok) {
    printFailureResult(firstReveal);
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

  printFailureResult(secondReveal);
}

function scenarioCorruptedMaterialDefinition(): void {
  printSection('Corrupted Material Definition (Invalid Thresholds)');

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
  printFailureResult(purchase);
}

function scenarioPurchaseLockedThenUnlocked(): void {
  printSection('Purchase Locked Then Unlocked Material');

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
    printFailureResult(clayPurchase);
    return;
  }
  state = clayPurchase.state;

  for (const minutes of [30, 30, 30]) {
    const ritual = applyCompletedRitual(state, clayPurchase.mineral.id, minutes, MATERIAL_DEFINITIONS);
    if (!ritual.ok) {
      printFailureResult(ritual);
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
    printFailureResult(unlockedAttempt);
    return;
  }

  console.log(`after progress purchase limestone: ok=true, mineralId=${unlockedAttempt.mineral.id}`);
}

function scenarioMaterialUnlockProgression(): void {
  printSection('Material Unlock Progression + Shop Snapshot');

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
    printFailureResult(firstPurchase);
    return;
  }
  state = firstPurchase.state;

  for (const minutes of [30, 30, 30]) {
    const ritual = applyCompletedRitual(state, firstPurchase.mineral.id, minutes, MATERIAL_DEFINITIONS);
    if (!ritual.ok) {
      printFailureResult(ritual);
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
    printFailureResult(secondPurchase);
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
      printFailureResult(ritual);
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

function runSummaryScenario(): void {
  printSuite('Summary Scenario');
  scenarioSummarySnapshot();
}

function runHappyPathScenario(): void {
  printSuite('Happy Path Scenario');
  scenarioUseCaseFlow();
  scenarioSelectValidMineral();
  scenarioSelectedMineralReadHelpers();
}

function runEdgeCaseScenarios(): void {
  printSuite('Edge Case Scenarios');
  scenarioPurchaseInsufficientEssence();
  scenarioInvalidMaterialType();
  scenarioSelectInvalidMineral();
  scenarioRitualZeroMinutes();
  scenarioRitualUnknownMineral();
  scenarioRitualAlreadyCompleted();
  scenarioRevealBeforeCompletion();
  scenarioRevealTwice();
  scenarioCorruptedMaterialDefinition();
}

function runUnlockScenario(): void {
  printSuite('Unlock Scenario');
  scenarioPurchaseLockedThenUnlocked();
}

function runShopScenario(): void {
  printSuite('Shop Scenario');
  scenarioMaterialUnlockProgression();
}

function runSandbox(): void {
  console.log('Pomodora Sanctuary Domain Integration Sandbox');
  runSummaryScenario();
  runHappyPathScenario();
  runEdgeCaseScenarios();
  runUnlockScenario();
  runShopScenario();
}

runSandbox();

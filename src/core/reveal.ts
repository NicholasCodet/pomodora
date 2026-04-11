/**
 * Artifact reveal action.
 * Converts a completed mineral into a discovered collection entry.
 */
import { isMineralFullyRefined, validateMaterialDefinition } from './progression';
import type {
  ArtifactDefinition,
  GameState,
  MaterialDefinition,
  MaterialType,
  MineralId,
  OwnedMineral,
} from './models';

export type RevealArtifactFailureReason =
  | 'mineral_not_found'
  | 'material_not_found'
  | 'invalid_material_definition'
  | 'material_type_mismatch'
  | 'mineral_not_complete'
  | 'artifact_not_found'
  | 'artifact_material_mismatch'
  | 'already_revealed';

export type RevealArtifactResult =
  | {
      ok: true;
      state: GameState;
      artifact: ArtifactDefinition;
      mineral: OwnedMineral;
    }
  | {
      ok: false;
      reason: RevealArtifactFailureReason;
      state: GameState;
    };

/**
 * Reveals the hidden artifact when a mineral is complete and not already revealed.
 */
export function revealArtifactIfComplete(
  state: GameState,
  mineralId: MineralId,
  materialDefinitions: Readonly<Record<MaterialType, MaterialDefinition>>,
  artifactDefinitions: readonly ArtifactDefinition[],
  now: () => number = Date.now,
): RevealArtifactResult {
  const mineral = state.inventory.find((entry) => entry.id === mineralId);
  if (!mineral) {
    return {
      ok: false,
      reason: 'mineral_not_found',
      state,
    };
  }

  if (mineral.revealedAt !== null) {
    return {
      ok: false,
      reason: 'already_revealed',
      state,
    };
  }

  const material = materialDefinitions[mineral.materialType];
  if (!material) {
    return {
      ok: false,
      reason: 'material_not_found',
      state,
    };
  }

  if (material.type !== mineral.materialType) {
    return {
      ok: false,
      reason: 'material_type_mismatch',
      state,
    };
  }

  const materialValidation = validateMaterialDefinition(material);
  if (materialValidation) {
    return {
      ok: false,
      reason: 'invalid_material_definition',
      state,
    };
  }

  if (!isMineralFullyRefined(mineral, material)) {
    return {
      ok: false,
      reason: 'mineral_not_complete',
      state,
    };
  }

  const artifact = artifactDefinitions.find((entry) => entry.id === mineral.hiddenArtifactId);
  if (!artifact) {
    return {
      ok: false,
      reason: 'artifact_not_found',
      state,
    };
  }

  if (artifact.materialType !== mineral.materialType) {
    return {
      ok: false,
      reason: 'artifact_material_mismatch',
      state,
    };
  }

  const discoveredAt = now();
  const updatedMineral: OwnedMineral = {
    ...mineral,
    revealedAt: discoveredAt,
  };

  // Keep reveal idempotent: do not duplicate collection entries for one mineral.
  const hasCollectionEntry = state.collection.some((entry) => entry.sourceMineralId === mineralId);
  const collection = hasCollectionEntry
    ? state.collection
    : [
        ...state.collection,
        {
          artifactId: artifact.id,
          sourceMineralId: mineral.id,
          discoveredAt,
        },
      ];

  return {
    ok: true,
    state: {
      ...state,
      inventory: state.inventory.map((entry) => (entry.id === mineralId ? updatedMineral : entry)),
      collection,
    },
    artifact,
    mineral: updatedMineral,
  };
}

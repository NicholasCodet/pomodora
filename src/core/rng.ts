/**
 * Minimal RNG utilities used by core logic.
 *
 * The default runtime generator can be Math.random.
 * We also provide a seeded generator for repeatable tests.
 */

export type RandomSource = () => number;

export function createSeededRandom(seed: number): RandomSource {
  // Simple LCG: deterministic and sufficient for game-like randomness.
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export interface WeightedOption<T> {
  value: T;
  weight: number;
}

export function pickWeighted<T>(
  options: readonly WeightedOption<T>[],
  random: RandomSource = Math.random,
): T {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);

  if (totalWeight <= 0) {
    throw new Error('pickWeighted requires a positive total weight.');
  }

  const roll = random() * totalWeight;
  let cursor = 0;

  for (const option of options) {
    cursor += option.weight;
    if (roll < cursor) {
      return option.value;
    }
  }

  // Fallback for floating-point edge cases.
  return options[options.length - 1].value;
}

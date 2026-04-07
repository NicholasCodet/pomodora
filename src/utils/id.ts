let sequence = 0;

/**
 * Small deterministic-ish ID helper for local objects.
 * Good enough for MVP inventory entities.
 */
export function createId(prefix = 'id'): string {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

/**
 * Generic storage helpers.
 * The adapter keeps this module reusable for browser localStorage or tests.
 */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function loadJson<T>(
  storage: KeyValueStorage,
  key: string,
  fallback: T,
): T {
  const raw = storage.getItem(key);
  if (raw === null) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson<T>(storage: KeyValueStorage, key: string, value: T): void {
  storage.setItem(key, JSON.stringify(value));
}

export function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();

  return {
    getItem(key) {
      return map.get(key) ?? null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

export const DEFAULT_ALARM_STATE_KEY = "axicharts.alarms.v1";

export type PersistedAlarmScope = {
  acked: string[];
  shelved: string[];
};

export type PersistedAlarmStore = {
  version: 1;
  scopes: Record<string, PersistedAlarmScope>;
};

const EMPTY_SCOPE: PersistedAlarmScope = { acked: [], shelved: [] };

function emptyStore(): PersistedAlarmStore {
  return { version: 1, scopes: {} };
}

export function parsePersistedAlarmStore(raw: string | null): PersistedAlarmStore {
  if (!raw) return emptyStore();
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedAlarmStore>;
    if (parsed.version !== 1 || typeof parsed.scopes !== "object" || !parsed.scopes) {
      return emptyStore();
    }
    return { version: 1, scopes: parsed.scopes };
  } catch {
    return emptyStore();
  }
}

export function loadPersistedAlarmScope(
  storage: Pick<Storage, "getItem">,
  scopeId: string,
  storageKey = DEFAULT_ALARM_STATE_KEY,
): PersistedAlarmScope {
  const store = parsePersistedAlarmStore(storage.getItem(storageKey));
  const scope = store.scopes[scopeId];
  if (!scope) return EMPTY_SCOPE;
  return {
    acked: Array.isArray(scope.acked) ? [...scope.acked] : [],
    shelved: Array.isArray(scope.shelved) ? [...scope.shelved] : [],
  };
}

export function savePersistedAlarmScope(
  storage: Pick<Storage, "getItem" | "setItem">,
  scopeId: string,
  scope: PersistedAlarmScope,
  storageKey = DEFAULT_ALARM_STATE_KEY,
): void {
  const store = parsePersistedAlarmStore(storage.getItem(storageKey));
  const hasState = scope.acked.length > 0 || scope.shelved.length > 0;
  if (hasState) {
    store.scopes[scopeId] = {
      acked: [...scope.acked],
      shelved: [...scope.shelved],
    };
  } else {
    delete store.scopes[scopeId];
  }
  storage.setItem(storageKey, JSON.stringify(store));
}

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  loadPersistedAlarmScope,
  savePersistedAlarmScope,
} from "./alarmStateStore";
import type { AlarmItem } from "./types";

export type AlarmState = {
  alarms: AlarmItem[];
  ack: (id: string) => void;
  shelve: (id: string) => void;
  reset: () => void;
};

export type UseAlarmStateOptions = {
  scopeId?: string;
  storage?: Pick<Storage, "getItem" | "setItem">;
  storageKey?: string;
};

export function useAlarmState(
  initialAlarms: AlarmItem[] = [],
  options: UseAlarmStateOptions = {},
): AlarmState {
  const { scopeId, storage, storageKey } = options;
  const persist = Boolean(scopeId && storage);
  const [ackedIds, setAckedIds] = useState<Set<string>>(() => new Set());
  const [shelvedIds, setShelvedIds] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(!persist);

  useEffect(() => {
    if (!persist || !scopeId || !storage) return;
    const loaded = loadPersistedAlarmScope(storage, scopeId, storageKey);
    setAckedIds(new Set(loaded.acked));
    setShelvedIds(new Set(loaded.shelved));
    setHydrated(true);
  }, [persist, scopeId, storage, storageKey]);

  useEffect(() => {
    if (!persist || !hydrated || !scopeId || !storage) return;
    savePersistedAlarmScope(
      storage,
      scopeId,
      {
        acked: [...ackedIds],
        shelved: [...shelvedIds],
      },
      storageKey,
    );
  }, [persist, hydrated, scopeId, storage, storageKey, ackedIds, shelvedIds]);

  const ack = useCallback((id: string) => {
    setAckedIds((current) => new Set(current).add(id));
  }, []);

  const shelve = useCallback((id: string) => {
    setShelvedIds((current) => new Set(current).add(id));
  }, []);

  const reset = useCallback(() => {
    setAckedIds(new Set());
    setShelvedIds(new Set());
  }, []);

  const alarms = useMemo(
    () =>
      initialAlarms
        .filter((alarm) => !shelvedIds.has(alarm.id) && !alarm.shelved)
        .map((alarm) => ({
          ...alarm,
          acknowledged: ackedIds.has(alarm.id) || alarm.acknowledged,
        })),
    [initialAlarms, ackedIds, shelvedIds],
  );

  return { alarms, ack, shelve, reset };
}

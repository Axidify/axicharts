import { useCallback, useMemo, useState } from "react";
import type { AlarmItem } from "./types";

export type AlarmState = {
  alarms: AlarmItem[];
  ack: (id: string) => void;
  shelve: (id: string) => void;
  reset: () => void;
};

export function useAlarmState(initialAlarms: AlarmItem[] = []): AlarmState {
  const [ackedIds, setAckedIds] = useState<Set<string>>(() => new Set());
  const [shelvedIds, setShelvedIds] = useState<Set<string>>(() => new Set());

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

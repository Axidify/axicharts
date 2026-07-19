import { useEffect, useRef, useState } from "react";
import { connectSource } from "./connectSource";
import { boundDataSourcesKey } from "./dataSourceSpecKey";
import type { BoundDataSourceSpec, DataSourceSnapshot } from "./types";
import { EMPTY_SNAPSHOT } from "./aggregateSnapshots";

export function useDataSources(
  sources: BoundDataSourceSpec[] | undefined,
): Record<string, DataSourceSnapshot> {
  const sourcesRef = useRef(sources);
  sourcesRef.current = sources;
  const sourcesKey = boundDataSourcesKey(sources);
  const [snapshots, setSnapshots] = useState<Record<string, DataSourceSnapshot>>({});

  useEffect(() => {
    const current = sourcesRef.current;
    if (!current?.length) {
      setSnapshots({});
      return;
    }

    const disconnectors = current.map((source) =>
      connectSource(source, (snapshot) => {
        setSnapshots((previous) => ({ ...previous, [source.id]: snapshot }));
      }),
    );

    return () => {
      for (const disconnect of disconnectors) disconnect();
    };
  }, [sourcesKey]);

  return snapshots;
}

export function resolveBoundSnapshot(
  snapshots: Record<string, DataSourceSnapshot>,
  sourceId?: string,
): DataSourceSnapshot {
  if (sourceId && snapshots[sourceId]) return snapshots[sourceId];
  const firstId = Object.keys(snapshots)[0];
  return firstId ? snapshots[firstId]! : EMPTY_SNAPSHOT;
}

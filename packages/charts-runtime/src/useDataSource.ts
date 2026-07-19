import { useEffect, useRef, useState } from "react";
import { connectSource } from "./connectSource";
import { dataSourceSpecKey } from "./dataSourceSpecKey";
import type { DataSourceSnapshot, DataSourceSpec } from "./types";
import { EMPTY_SNAPSHOT } from "./aggregateSnapshots";

function initialSnapshot(spec: DataSourceSpec | undefined): DataSourceSnapshot {
  if (spec?.type === "static") {
    return {
      data: spec.data,
      connection: "ready",
      lastUpdatedAt: Date.now(),
    };
  }
  return EMPTY_SNAPSHOT;
}

export function useDataSource(spec: DataSourceSpec | undefined): DataSourceSnapshot {
  const specRef = useRef(spec);
  specRef.current = spec;
  const specKey = dataSourceSpecKey(spec);
  const [snapshot, setSnapshot] = useState<DataSourceSnapshot>(() => initialSnapshot(spec));

  useEffect(() => {
    const current = specRef.current;
    if (!current) {
      setSnapshot(EMPTY_SNAPSHOT);
      return;
    }
    return connectSource(current, setSnapshot);
  }, [specKey]);

  return snapshot;
}

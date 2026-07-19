import { useEffect, useState } from "react";
import { connectSource } from "./connectSource";
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
  const [snapshot, setSnapshot] = useState<DataSourceSnapshot>(() => initialSnapshot(spec));

  useEffect(() => {
    if (!spec) {
      setSnapshot(EMPTY_SNAPSHOT);
      return;
    }
    return connectSource(spec, setSnapshot);
  }, [spec]);

  return snapshot;
}

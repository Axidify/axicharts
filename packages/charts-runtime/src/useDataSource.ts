import { useEffect, useState } from "react";
import { connectSource } from "./connectSource";
import type { DataSourceSnapshot, DataSourceSpec } from "./types";
import { EMPTY_SNAPSHOT } from "./aggregateSnapshots";

export function useDataSource(spec: DataSourceSpec | undefined): DataSourceSnapshot {
  const [snapshot, setSnapshot] = useState<DataSourceSnapshot>(EMPTY_SNAPSHOT);

  useEffect(() => {
    if (!spec) {
      setSnapshot(EMPTY_SNAPSHOT);
      return;
    }
    return connectSource(spec, setSnapshot);
  }, [spec]);

  return snapshot;
}

export type MapA11yRegion = {
  name: string;
  value: number;
};

export type MapA11yDescriptor = {
  kind: "map";
  title?: string;
  description?: string;
  drillPath?: string[];
  drillLabels?: string[];
  regions: MapA11yRegion[];
};

export function buildMapA11yDescriptor({
  regions,
  title,
  description,
  drillPath,
  drillLabels,
}: {
  regions: MapA11yRegion[];
  title?: string;
  description?: string;
  drillPath?: string[];
  drillLabels?: string[];
}): MapA11yDescriptor {
  return {
    kind: "map",
    title: title ?? "Choropleth map",
    description,
    drillPath,
    drillLabels,
    regions,
  };
}

export function mapA11ySummary(descriptor: MapA11yDescriptor): string {
  const scope =
    descriptor.drillLabels?.length
      ? descriptor.drillLabels.join(" / ")
      : descriptor.drillPath?.length
        ? descriptor.drillPath.join(" / ")
        : "top level";
  return `Map showing ${descriptor.regions.length} regions at ${scope}`;
}

export function buildMapA11yTable(descriptor: MapA11yDescriptor) {
  const scope =
    descriptor.drillLabels?.length
      ? descriptor.drillLabels.join(" / ")
      : descriptor.drillPath?.length
        ? descriptor.drillPath.join(" / ")
        : "top level";

  return {
    columns: [
      { key: "region", label: "Region" },
      { key: "value", label: "Value", align: "right" as const },
    ],
    rows: descriptor.regions.map((region) => ({
      region: region.name,
      value: region.value,
    })),
    caption:
      descriptor.description ??
      `${mapA11ySummary(descriptor)} — ${scope}`,
  };
}

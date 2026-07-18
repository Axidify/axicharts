import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Topology } from "topojson-specification";

export type MapDrillLevel = {
  objectKey: string;
  featureId?: string;
  nameKey?: string;
  /** Property on child features matching the parent feature id. */
  parentIdKey?: string;
};

export type MapHierarchy = {
  levels: MapDrillLevel[];
};

export type MapDrillChange = {
  path: string[];
  labels: string[];
  level: number;
};

export type MapFeature = Feature<Geometry> & {
  id?: string | number;
  properties?: Record<string, unknown>;
};

const DEFAULT_FEATURE_ID = "id";
const DEFAULT_NAME_KEY = "name";
const DEFAULT_PARENT_ID_KEY = "parent";

export function readFeatureKey(
  mapFeature: MapFeature,
  featureId: string,
  nameKey: string,
): string {
  if (mapFeature.id != null) return String(mapFeature.id);
  const props = mapFeature.properties ?? {};
  const idValue = props[featureId];
  if (idValue != null) return String(idValue);
  const nameValue = props[nameKey];
  if (nameValue != null) return String(nameValue);
  return "";
}

export function readFeatureLabel(
  mapFeature: MapFeature,
  nameKey: string,
  featureKey: string,
): string {
  const nameValue = mapFeature.properties?.[nameKey];
  if (nameValue != null) return String(nameValue);
  return featureKey;
}

export function resolveActiveLevel(
  hierarchy: MapHierarchy | undefined,
  drillPath: string[],
): { level: MapDrillLevel; levelIndex: number } | null {
  if (!hierarchy?.levels.length) return null;
  const levelIndex = Math.min(drillPath.length, hierarchy.levels.length - 1);
  return { level: hierarchy.levels[levelIndex]!, levelIndex };
}

export function extractTopologyFeatures(
  topology: Topology,
  objectKey: string,
): MapFeature[] {
  const topoObject = topology.objects[objectKey];
  if (!topoObject) return [];
  const collection = feature(
    topology,
    topoObject as Parameters<typeof feature>[1],
  ) as FeatureCollection<Geometry>;
  return collection.features as MapFeature[];
}

export function filterFeaturesForDrill(
  features: MapFeature[],
  levelIndex: number,
  level: MapDrillLevel,
  drillPath: string[],
): MapFeature[] {
  if (levelIndex === 0 || drillPath.length === 0) {
    return features;
  }

  const parentLevel = levelIndex > 0 ? drillPath[levelIndex - 1] : undefined;
  if (!parentLevel) return features;

  const parentIdKey = level.parentIdKey ?? DEFAULT_PARENT_ID_KEY;
  const featureId = level.featureId ?? DEFAULT_FEATURE_ID;
  const nameKey = level.nameKey ?? DEFAULT_NAME_KEY;

  return features.filter((mapFeature) => {
    const props = mapFeature.properties ?? {};
    const parentValue = props[parentIdKey];
    if (parentValue != null) return String(parentValue) === parentLevel;
    return readFeatureKey(mapFeature, featureId, nameKey) === parentLevel;
  });
}

export function hasChildLevel(
  hierarchy: MapHierarchy | undefined,
  levelIndex: number,
): boolean {
  return Boolean(hierarchy && levelIndex < hierarchy.levels.length - 1);
}

export function hasDrillableChildren(
  topology: Topology,
  hierarchy: MapHierarchy,
  levelIndex: number,
  featureKey: string,
): boolean {
  if (!hasChildLevel(hierarchy, levelIndex)) return false;

  const childLevel = hierarchy.levels[levelIndex + 1]!;
  const childFeatures = extractTopologyFeatures(topology, childLevel.objectKey);
  const parentIdKey = childLevel.parentIdKey ?? DEFAULT_PARENT_ID_KEY;

  return childFeatures.some((mapFeature) => {
    const parentValue = mapFeature.properties?.[parentIdKey];
    return parentValue != null && String(parentValue) === featureKey;
  });
}

export function drillIntoPath(
  currentPath: string[],
  currentLabels: string[],
  featureKey: string,
  featureLabel: string,
): { path: string[]; labels: string[] } {
  return {
    path: [...currentPath, featureKey],
    labels: [...currentLabels, featureLabel],
  };
}

export function drillToBreadcrumbIndex(
  currentPath: string[],
  currentLabels: string[],
  index: number,
): { path: string[]; labels: string[] } {
  if (index < 0) {
    return { path: [], labels: [] };
  }
  return {
    path: currentPath.slice(0, index + 1),
    labels: currentLabels.slice(0, index + 1),
  };
}

export function resolveDrillLabels(
  topology: Topology,
  hierarchy: MapHierarchy,
  drillPath: string[],
  drillLabels?: string[],
): string[] {
  if (drillLabels?.length) return drillLabels;

  return drillPath.map((segment, index) => {
    const level = hierarchy.levels[index];
    if (!level) return segment;
    const features = extractTopologyFeatures(topology, level.objectKey);
    const featureId = level.featureId ?? DEFAULT_FEATURE_ID;
    const nameKey = level.nameKey ?? DEFAULT_NAME_KEY;
    const match = features.find(
      (mapFeature) => readFeatureKey(mapFeature, featureId, nameKey) === segment,
    );
    return match
      ? readFeatureLabel(match, nameKey, segment)
      : segment;
  });
}

export function createMapDrillChange(
  path: string[],
  labels: string[],
): MapDrillChange {
  return {
    path,
    labels,
    level: path.length,
  };
}

export function resolveVisibleMapFeatures({
  topology,
  hierarchy,
  drillPath,
  objectKey,
  featureId = DEFAULT_FEATURE_ID,
  nameKey = DEFAULT_NAME_KEY,
}: {
  topology: Topology;
  hierarchy?: MapHierarchy;
  drillPath: string[];
  objectKey: string;
  featureId?: string;
  nameKey?: string;
}): {
  features: MapFeature[];
  activeObjectKey: string;
  levelIndex: number;
  levelConfig: MapDrillLevel;
} {
  const active = resolveActiveLevel(hierarchy, drillPath);
  const levelConfig = active?.level ?? {
    objectKey,
    featureId,
    nameKey,
  };
  const levelIndex = active?.levelIndex ?? 0;
  const activeObjectKey = levelConfig.objectKey;
  const allFeatures = extractTopologyFeatures(topology, activeObjectKey);
  const features = hierarchy
    ? filterFeaturesForDrill(allFeatures, levelIndex, levelConfig, drillPath)
    : allFeatures;

  return {
    features,
    activeObjectKey,
    levelIndex,
    levelConfig,
  };
}

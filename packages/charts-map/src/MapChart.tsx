"use client";

import {
  useCallback,
  useMemo,
  useState,
  type ReactElement,
  type MouseEvent,
} from "react";
import type { Topology } from "topojson-specification";
import { useOptionalChartLayout } from "@axicharts/charts";
import {
  colorForValue,
  resolveBounds,
  resolveSurface,
  type MapSurface,
} from "./colorScale";
import {
  createMapProjection,
  createPathGenerator,
  type MapProjectionName,
} from "./mapProjection";
import {
  buildMapA11yDescriptor,
  buildMapA11yTable,
  mapA11ySummary,
} from "./mapA11y";
import {
  createMapDrillChange,
  drillIntoPath,
  drillToBreadcrumbIndex,
  hasDrillableChildren,
  readFeatureKey,
  readFeatureLabel,
  resolveDrillLabels,
  resolveVisibleMapFeatures,
  type MapDrillChange,
  type MapFeature,
  type MapHierarchy,
} from "./mapDrill";

export type { MapDrillChange, MapHierarchy } from "./mapDrill";

export type MapChartProps = {
  topology: Topology;
  values: Record<string, number>;
  objectKey?: string;
  featureId?: string;
  nameKey?: string;
  projection?: MapProjectionName;
  width?: number;
  height?: number;
  min?: number;
  max?: number;
  showLabels?: boolean;
  showScale?: boolean;
  surface?: MapSurface;
  drilldown?: boolean;
  hierarchy?: MapHierarchy;
  drillPath?: string[];
  drillLabels?: string[];
  onDrillChange?: (state: MapDrillChange) => void;
};

const SR_ONLY_STYLE = {
  position: "absolute" as const,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap" as const,
  border: 0,
};

const BREADCRUMB_HEIGHT = 24;

function MapBreadcrumb({
  labels,
  palette,
  onNavigate,
}: {
  labels: string[];
  palette: { breadcrumb: string; breadcrumbActive: string; breadcrumbHover: string };
  onNavigate: (index: number) => void;
}): ReactElement | null {
  if (labels.length === 0) return null;

  return (
    <g data-testid="map-breadcrumb">
      <text
        x={8}
        y={15}
        fill={palette.breadcrumb}
        fontSize={10}
        onClick={() => onNavigate(-1)}
        style={{ cursor: "pointer" }}
        data-testid="map-breadcrumb-root"
      >
        All
      </text>
      {labels.map((label, index) => (
        <g key={`${label}-${index}`}>
          <text
            x={36 + index * 72}
            y={15}
            fill={palette.breadcrumb}
            fontSize={10}
            pointerEvents="none"
          >
            /
          </text>
          <text
            x={44 + index * 72}
            y={15}
            fill={
              index === labels.length - 1
                ? palette.breadcrumbActive
                : palette.breadcrumb
            }
            fontSize={10}
            fontWeight={index === labels.length - 1 ? 600 : 400}
            onClick={() => onNavigate(index)}
            style={{ cursor: "pointer" }}
            data-testid={`map-breadcrumb-${index}`}
          >
            {label}
          </text>
        </g>
      ))}
    </g>
  );
}

export function MapChart({
  topology,
  values,
  objectKey = "states",
  featureId = "id",
  nameKey = "name",
  projection = "albersUsa",
  width: widthProp,
  height: heightProp,
  min,
  max,
  showLabels = true,
  showScale = true,
  surface: surfaceProp,
  drilldown = false,
  hierarchy,
  drillPath: drillPathProp,
  drillLabels: drillLabelsProp,
  onDrillChange,
}: MapChartProps): ReactElement | null {
  const layout = useOptionalChartLayout();
  const width = Math.floor(widthProp ?? layout?.size.width ?? 320);
  const height = Math.floor(heightProp ?? layout?.size.height ?? 200);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [internalPath, setInternalPath] = useState<string[]>([]);
  const [internalLabels, setInternalLabels] = useState<string[]>([]);
  const surface = resolveSurface(surfaceProp, layout?.theme.name);
  const isControlled = drillPathProp !== undefined;
  const activePath = isControlled ? drillPathProp : internalPath;
  const activeLabels = useMemo(() => {
    if (isControlled) {
      return resolveDrillLabels(
        topology,
        hierarchy ?? { levels: [] },
        activePath,
        drillLabelsProp,
      );
    }
    return internalLabels;
  }, [
    activePath,
    drillLabelsProp,
    hierarchy,
    internalLabels,
    isControlled,
    topology,
  ]);

  const { features, levelIndex, levelConfig } = useMemo(
    () =>
      resolveVisibleMapFeatures({
        topology,
        hierarchy: drilldown ? hierarchy : undefined,
        drillPath: drilldown ? activePath : [],
        objectKey,
        featureId,
        nameKey,
      }),
    [
      topology,
      hierarchy,
      drilldown,
      activePath,
      objectKey,
      featureId,
      nameKey,
    ],
  );

  const resolvedFeatureId = levelConfig.featureId ?? featureId;
  const resolvedNameKey = levelConfig.nameKey ?? nameKey;

  const featureRows = useMemo(() => {
    return features.map((mapFeature) => {
      const key = readFeatureKey(mapFeature, resolvedFeatureId, resolvedNameKey);
      const label = readFeatureLabel(mapFeature, resolvedNameKey, key);
      const value =
        values[key] ??
        values[label] ??
        (mapFeature.properties?.[resolvedNameKey] != null
          ? values[String(mapFeature.properties[resolvedNameKey])]
          : undefined) ??
        0;
      return { mapFeature, key, label, value };
    });
  }, [features, values, resolvedFeatureId, resolvedNameKey]);

  const bounds = useMemo(
    () => resolveBounds(featureRows.map((row) => row.value), min, max),
    [featureRows, min, max],
  );

  const breadcrumbVisible = drilldown && activeLabels.length > 0;
  const breadcrumbHeight = breadcrumbVisible ? BREADCRUMB_HEIGHT : 0;
  const scaleHeight = showScale ? 18 : 0;
  const mapHeight = height - scaleHeight - breadcrumbHeight;

  const { path, centroids } = useMemo(() => {
    const geoProjection = createMapProjection(
      projection,
      width,
      mapHeight,
      features,
    );
    const pathGenerator = createPathGenerator(geoProjection);
    const centroidByKey = new Map<string, [number, number]>();

    for (const row of featureRows) {
      const centroid = pathGenerator.centroid(row.mapFeature);
      if (Number.isFinite(centroid[0]) && Number.isFinite(centroid[1])) {
        centroidByKey.set(row.key, centroid);
      }
    }

    return { path: pathGenerator, centroids: centroidByKey };
  }, [projection, width, mapHeight, features, featureRows]);

  const applyDrillChange = useCallback(
    (nextPath: string[], nextLabels: string[]) => {
      if (!isControlled) {
        setInternalPath(nextPath);
        setInternalLabels(nextLabels);
      }
      onDrillChange?.(createMapDrillChange(nextPath, nextLabels));
    },
    [isControlled, onDrillChange],
  );

  const handleRegionClick = useCallback(
    (row: { mapFeature: MapFeature; key: string; label: string }) => {
      if (!drilldown || !hierarchy) return;
      if (
        !hasDrillableChildren(topology, hierarchy, levelIndex, row.key)
      ) {
        return;
      }
      const next = drillIntoPath(activePath, activeLabels, row.key, row.label);
      applyDrillChange(next.path, next.labels);
    },
    [
      activeLabels,
      activePath,
      applyDrillChange,
      drilldown,
      hierarchy,
      levelIndex,
      topology,
    ],
  );

  const handleBreadcrumbNavigate = useCallback(
    (index: number) => {
      const next = drillToBreadcrumbIndex(activePath, activeLabels, index);
      applyDrillChange(next.path, next.labels);
    },
    [activeLabels, activePath, applyDrillChange],
  );

  const a11yDescriptor = useMemo(
    () =>
      buildMapA11yDescriptor({
        regions: featureRows.map((row) => ({
          name: row.label,
          value: row.value,
        })),
        drillPath: drilldown ? activePath : undefined,
        drillLabels: drilldown ? activeLabels : undefined,
      }),
    [activeLabels, activePath, drilldown, featureRows],
  );

  const a11yTable = useMemo(
    () => buildMapA11yTable(a11yDescriptor),
    [a11yDescriptor],
  );

  if (layout && !layout.ready) return null;
  if (width < 1 || height < 1) return null;

  const palette =
    surface === "dark"
      ? {
          canvas: "#0f172a",
          label: "#e2e8f0",
          value: "#94a3b8",
          stroke: "#475569",
          hoverStroke: "#38bdf8",
          scaleTrack: "#334155",
          scaleText: "#94a3b8",
          tooltipBg: "rgba(15, 23, 42, 0.92)",
          tooltipBorder: "#38bdf8",
          breadcrumb: "#94a3b8",
          breadcrumbActive: "#e2e8f0",
          breadcrumbHover: "#38bdf8",
        }
      : {
          canvas: "#f8fafc",
          label: "#0f172a",
          value: "#334155",
          stroke: "#94a3b8",
          hoverStroke: "#2563eb",
          scaleTrack: "#e2e8f0",
          scaleText: "#64748b",
          tooltipBg: "rgba(255, 255, 255, 0.96)",
          tooltipBorder: "#2563eb",
          breadcrumb: "#64748b",
          breadcrumbActive: "#0f172a",
          breadcrumbHover: "#2563eb",
        };

  const hovered = hoverKey
    ? featureRows.find((row) => row.key === hoverKey)
    : undefined;

  const mapOffsetY = breadcrumbHeight;

  return (
    <div
      style={{ position: "relative", width, height }}
      role="img"
      aria-label={mapA11ySummary(a11yDescriptor)}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden
      >
        <rect
          x={0}
          y={mapOffsetY}
          width={width}
          height={mapHeight}
          fill={palette.canvas}
          rx={8}
        />
        {breadcrumbVisible ? (
          <MapBreadcrumb
            labels={activeLabels}
            palette={palette}
            onNavigate={handleBreadcrumbNavigate}
          />
        ) : null}
        {featureRows.map((row) => {
          const d = path(row.mapFeature) ?? undefined;
          if (!d) return null;
          const fill = colorForValue(row.value, bounds.min, bounds.max, surface);
          const active = hoverKey === row.key;
          const centroid = centroids.get(row.key);
          const drillable =
            drilldown &&
            hierarchy &&
            hasDrillableChildren(topology, hierarchy, levelIndex, row.key);
          return (
            <g
              key={row.key}
              onMouseEnter={() => setHoverKey(row.key)}
              onMouseLeave={() => setHoverKey(null)}
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                handleRegionClick(row);
              }}
              style={{ cursor: drillable ? "pointer" : "default" }}
              data-drillable={drillable ? "true" : "false"}
            >
              <path
                d={d}
                transform={`translate(0, ${mapOffsetY})`}
                fill={fill}
                stroke={active ? palette.hoverStroke : palette.stroke}
                strokeWidth={active ? 1.5 : 0.75}
                opacity={hoverKey && !active ? 0.72 : 1}
              />
              {showLabels && centroid ? (
                <>
                  <text
                    x={centroid[0]}
                    y={mapOffsetY + centroid[1] - 4}
                    textAnchor="middle"
                    fill={palette.label}
                    fontSize={9}
                    fontWeight={600}
                    pointerEvents="none"
                  >
                    {row.label}
                  </text>
                  <text
                    x={centroid[0]}
                    y={mapOffsetY + centroid[1] + 8}
                    textAnchor="middle"
                    fill={palette.value}
                    fontSize={8}
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    pointerEvents="none"
                  >
                    {row.value}
                  </text>
                </>
              ) : null}
            </g>
          );
        })}
        {hovered && centroids.get(hovered.key) ? (
          <g pointerEvents="none">
            {(() => {
              const [x, y] = centroids.get(hovered.key)!;
              const tooltipWidth = Math.max(88, hovered.label.length * 6 + 24);
              const tooltipX = Math.min(
                Math.max(8, x - tooltipWidth / 2),
                width - tooltipWidth - 8,
              );
              const tooltipY = Math.max(mapOffsetY + 8, mapOffsetY + y - 42);
              return (
                <>
                  <rect
                    x={tooltipX}
                    y={tooltipY}
                    width={tooltipWidth}
                    height={30}
                    rx={6}
                    fill={palette.tooltipBg}
                    stroke={palette.tooltipBorder}
                    strokeWidth={1}
                  />
                  <text
                    x={tooltipX + 10}
                    y={tooltipY + 12}
                    fill={palette.label}
                    fontSize={9}
                    fontWeight={600}
                  >
                    {hovered.label}
                  </text>
                  <text
                    x={tooltipX + 10}
                    y={tooltipY + 24}
                    fill={palette.value}
                    fontSize={9}
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  >
                    {hovered.value}
                  </text>
                </>
              );
            })()}
          </g>
        ) : null}
        {showScale ? (
          <g transform={`translate(12, ${mapOffsetY + mapHeight + 4})`}>
            <defs>
              <linearGradient id="axicharts-map-scale" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop
                  offset="0%"
                  stopColor={colorForValue(bounds.min, bounds.min, bounds.max, surface)}
                />
                <stop
                  offset="100%"
                  stopColor={colorForValue(bounds.max, bounds.min, bounds.max, surface)}
                />
              </linearGradient>
            </defs>
            <rect
              x={0}
              y={0}
              width={width - 24}
              height={6}
              rx={3}
              fill="url(#axicharts-map-scale)"
              stroke={palette.scaleTrack}
              strokeWidth={1}
            />
            <text x={0} y={16} fill={palette.scaleText} fontSize={9}>
              {bounds.min}
            </text>
            <text
              x={width - 24}
              y={16}
              textAnchor="end"
              fill={palette.scaleText}
              fontSize={9}
            >
              {bounds.max}
            </text>
          </g>
        ) : null}
      </svg>
      <div style={SR_ONLY_STYLE} aria-hidden={false}>
        <table>
          {a11yTable.caption ? <caption>{a11yTable.caption}</caption> : null}
          <thead>
            <tr>
              {a11yTable.columns.map((column) => (
                <th key={column.key} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {a11yTable.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {a11yTable.columns.map((column) => (
                  <td key={column.key}>{row[column.key as keyof typeof row] ?? ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export {
  SAMPLE_US_TOPOLOGY,
  SAMPLE_US_HIERARCHY,
  SAMPLE_US_VALUES,
  SAMPLE_REGION_VALUES,
  SAMPLE_COUNTY_VALUES,
  SAMPLE_DRILL_VALUES,
} from "./sampleData";

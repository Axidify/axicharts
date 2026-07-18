"use client";

import { useMemo, useState, type ReactElement } from "react";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
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
};

type MapFeature = Feature<Geometry> & {
  id?: string | number;
  properties?: Record<string, unknown>;
};

function readFeatureKey(
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

function readFeatureLabel(
  mapFeature: MapFeature,
  nameKey: string,
  featureKey: string,
): string {
  const nameValue = mapFeature.properties?.[nameKey];
  if (nameValue != null) return String(nameValue);
  return featureKey;
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
}: MapChartProps): ReactElement | null {
  const layout = useOptionalChartLayout();
  const width = Math.floor(widthProp ?? layout?.size.width ?? 320);
  const height = Math.floor(heightProp ?? layout?.size.height ?? 200);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const surface = resolveSurface(surfaceProp, layout?.theme.name);

  const features = useMemo(() => {
    const collection = feature(
      topology,
      topology.objects[objectKey] as Parameters<typeof feature>[1],
    ) as FeatureCollection<Geometry>;
    return collection.features as MapFeature[];
  }, [topology, objectKey]);

  const featureRows = useMemo(() => {
    return features.map((mapFeature) => {
      const key = readFeatureKey(mapFeature, featureId, nameKey);
      const label = readFeatureLabel(mapFeature, nameKey, key);
      const value =
        values[key] ??
        values[label] ??
        (mapFeature.properties?.[nameKey] != null
          ? values[String(mapFeature.properties[nameKey])]
          : undefined) ??
        0;
      return { mapFeature, key, label, value };
    });
  }, [features, values, featureId, nameKey]);

  const bounds = useMemo(
    () => resolveBounds(featureRows.map((row) => row.value), min, max),
    [featureRows, min, max],
  );

  const { path, centroids } = useMemo(() => {
    const geoProjection = createMapProjection(
      projection,
      width,
      height - (showScale ? 18 : 0),
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
  }, [projection, width, height, showScale, features, featureRows]);

  if (layout && !layout.ready) return null;
  if (width < 1 || height < 1) return null;

  const scaleHeight = showScale ? 18 : 0;
  const mapHeight = height - scaleHeight;
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
        };

  const hovered = hoverKey
    ? featureRows.find((row) => row.key === hoverKey)
    : undefined;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Choropleth map"
    >
      <rect x={0} y={0} width={width} height={mapHeight} fill={palette.canvas} rx={8} />
      {featureRows.map((row) => {
        const d = path(row.mapFeature) ?? undefined;
        if (!d) return null;
        const fill = colorForValue(row.value, bounds.min, bounds.max, surface);
        const active = hoverKey === row.key;
        const centroid = centroids.get(row.key);
        return (
          <g
            key={row.key}
            onMouseEnter={() => setHoverKey(row.key)}
            onMouseLeave={() => setHoverKey(null)}
            style={{ cursor: "default" }}
          >
            <path
              d={d}
              fill={fill}
              stroke={active ? palette.hoverStroke : palette.stroke}
              strokeWidth={active ? 1.5 : 0.75}
              opacity={hoverKey && !active ? 0.72 : 1}
            />
            {showLabels && centroid ? (
              <>
                <text
                  x={centroid[0]}
                  y={centroid[1] - 4}
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
                  y={centroid[1] + 8}
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
            const tooltipX = Math.min(Math.max(8, x - tooltipWidth / 2), width - tooltipWidth - 8);
            const tooltipY = Math.max(8, y - 42);
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
        <g transform={`translate(12, ${mapHeight + 4})`}>
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
          <text x={width - 24} y={16} textAnchor="end" fill={palette.scaleText} fontSize={9}>
            {bounds.max}
          </text>
        </g>
      ) : null}
    </svg>
  );
}

export { SAMPLE_US_TOPOLOGY, SAMPLE_US_VALUES } from "./sampleData";

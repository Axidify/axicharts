import type { ReactElement } from "react";

export type GeoRegion = {
  id: string;
  label?: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GeoMapChartProps = {
  regions: GeoRegion[];
  width?: number;
  height?: number;
  min?: number;
  max?: number;
  showLabels?: boolean;
};

function resolveBounds(
  regions: GeoRegion[],
  min?: number,
  max?: number,
): { min: number; max: number } {
  const values = regions.map((region) => region.value);
  const computedMin = min ?? Math.min(...values, 0);
  const computedMax = max ?? Math.max(...values, 1);
  return {
    min: computedMin,
    max: computedMax === computedMin ? computedMin + 1 : computedMax,
  };
}

function colorForValue(value: number, min: number, max: number): string {
  const fraction = (value - min) / (max - min);
  const clamped = Math.min(1, Math.max(0, fraction));
  const start = { r: 219, g: 234, b: 254 };
  const end = { r: 29, g: 78, b: 216 };
  const r = Math.round(start.r + (end.r - start.r) * clamped);
  const g = Math.round(start.g + (end.g - start.g) * clamped);
  const b = Math.round(start.b + (end.b - start.b) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

export const SAMPLE_GEO_REGIONS: GeoRegion[] = [
  { id: "us-west", label: "West", value: 72, x: 8, y: 28, width: 72, height: 54 },
  { id: "us-mountain", label: "Mountain", value: 58, x: 84, y: 24, width: 56, height: 48 },
  { id: "us-midwest", label: "Midwest", value: 81, x: 142, y: 22, width: 58, height: 52 },
  { id: "us-south", label: "South", value: 64, x: 118, y: 78, width: 74, height: 58 },
  { id: "us-northeast", label: "Northeast", value: 91, x: 198, y: 18, width: 52, height: 46 },
  { id: "us-pacific", label: "Pacific", value: 47, x: 4, y: 86, width: 64, height: 40 },
];

export function GeoMapChart({
  regions,
  width = 280,
  height = 160,
  min,
  max,
  showLabels = true,
}: GeoMapChartProps): ReactElement {
  const bounds = resolveBounds(regions, min, max);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Regional value map"
    >
      <rect x={0} y={0} width={width} height={height} fill="#f8fafc" rx={8} />
      {regions.map((region) => {
        const fill = colorForValue(region.value, bounds.min, bounds.max);
        const label = region.label ?? region.id;
        return (
          <g key={region.id}>
            <rect
              x={region.x}
              y={region.y}
              width={region.width}
              height={region.height}
              rx={4}
              fill={fill}
              stroke="#94a3b8"
              strokeWidth={1}
            />
            {showLabels ? (
              <>
                <text
                  x={region.x + region.width / 2}
                  y={region.y + region.height / 2 - 4}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize={10}
                  fontWeight={600}
                >
                  {label}
                </text>
                <text
                  x={region.x + region.width / 2}
                  y={region.y + region.height / 2 + 10}
                  textAnchor="middle"
                  fill="#334155"
                  fontSize={9}
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                >
                  {region.value}
                </text>
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

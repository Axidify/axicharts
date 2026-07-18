import type { CSSProperties, ReactElement } from "react";
import type { ChartTheme, ChartThemeSvgPolish } from "@axicharts/charts-theme";

export function studioFlag(
  theme: ChartTheme,
  flag: keyof ChartThemeSvgPolish,
): boolean {
  return theme.name === "studio" || Boolean(theme.svg?.[flag]);
}

export function studioGridRatios(theme: ChartTheme): number[] {
  return studioFlag(theme, "softGrid") ? [1 / 3, 2 / 3] : [0.25, 0.5, 0.75];
}

export function studioAxisFontSize(theme: ChartTheme): number {
  return studioFlag(theme, "softGrid") ? 11 : 10;
}

export function studioGridDash(theme: ChartTheme): string | undefined {
  return studioFlag(theme, "softGrid") ? "5 4" : undefined;
}

export function studioGridOpacity(theme: ChartTheme, baseOpacity: number): number {
  return studioFlag(theme, "softGrid")
    ? Math.min(baseOpacity * 0.72, 0.55)
    : baseOpacity;
}

function lightenHex(color: string, amount: number): string {
  const match = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) {
    return color;
  }

  let hex = match[1]!;
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const channels = [0, 2, 4].map((index) =>
    Math.min(255, Math.round(parseInt(hex.slice(index, index + 2), 16) + 255 * amount)),
  );

  return `rgb(${channels.join(", ")})`;
}

export function studioBarTopColor(color: string): string {
  if (color.startsWith("#")) {
    return lightenHex(color, 0.28);
  }

  if (color.startsWith("rgb")) {
    return color.replace(
      /rgba?\(([^)]+)\)/,
      (_, body: string) => {
        const parts = body.split(",").map((part: string) => part.trim());
        const rgb = parts.slice(0, 3).map((part: string) => {
          const value = Number(part);
          return Number.isFinite(value)
            ? Math.min(255, Math.round(value + 255 * 0.28))
            : part;
        });
        const alpha = parts[3];
        return alpha !== undefined
          ? `rgba(${rgb.join(", ")}, ${alpha})`
          : `rgb(${rgb.join(", ")})`;
      },
    );
  }

  return color;
}

type StudioGridLinesProps = {
  theme: ChartTheme;
  plot: { x: number; y: number; width: number; height: number };
  gridStroke: string;
};

export function StudioGridLines({
  theme,
  plot,
  gridStroke,
}: StudioGridLinesProps): ReactElement {
  const ratios = studioGridRatios(theme);
  const opacity = studioGridOpacity(theme, theme.grid.opacity);
  const stroke =
    studioFlag(theme, "softGrid") && gridStroke.startsWith("rgba(")
      ? gridStroke.replace(
          /,\s*[\d.]+\)$/,
          `, ${opacity})`,
        )
      : gridStroke;

  return (
    <>
      {ratios.map((ratio) => {
        const y = plot.y + plot.height * ratio;
        return (
          <line
            key={ratio}
            x1={plot.x}
            x2={plot.x + plot.width}
            y1={y}
            y2={y}
            stroke={stroke}
            strokeWidth={theme.grid.strokeWidth}
            strokeDasharray={studioGridDash(theme)}
          />
        );
      })}
    </>
  );
}

type StudioAreaSeriesProps = {
  id: string;
  path: string;
  color: string;
  strokeWidth: number;
  lineGlow: boolean;
  style?: CSSProperties;
};

export function StudioAreaSeries({
  id,
  path,
  color,
  strokeWidth,
  lineGlow,
  style,
}: StudioAreaSeriesProps): ReactElement {
  const gradientId = `${id}-area-gradient`;

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.34} />
          <stop offset="72%" stopColor={color} stopOpacity={0.08} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
        {lineGlow ? (
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
          </filter>
        ) : null}
      </defs>
      <path d={path} fill={`url(#${gradientId})`} stroke="none" />
      {lineGlow ? (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 3}
          strokeOpacity={0.18}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${id}-glow)`}
        />
      ) : null}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
      />
    </g>
  );
}

type StudioLineSeriesProps = {
  id: string;
  path: string;
  color: string;
  strokeWidth: number;
  lineGlow: boolean;
  style?: CSSProperties;
};

export function StudioLineSeries({
  id,
  path,
  color,
  strokeWidth,
  lineGlow,
  style,
}: StudioLineSeriesProps): ReactElement {
  return (
    <g>
      {lineGlow ? (
        <defs>
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
          </filter>
        </defs>
      ) : null}
      {lineGlow ? (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 3}
          strokeOpacity={0.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${id}-glow)`}
          style={style}
        />
      ) : null}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
      />
    </g>
  );
}

type StudioBarRectProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  radius: number;
};

export function StudioBarRect({
  id,
  x,
  y,
  width,
  height,
  color,
  radius,
}: StudioBarRectProps): ReactElement {
  const gradientId = `${id}-bar-gradient`;
  const topColor = studioBarTopColor(color);

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={topColor} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${gradientId})`}
        rx={radius}
      />
    </>
  );
}

export function studioSeriesId(name: string, index: number): string {
  return `studio-${name.replace(/\s+/g, "-").toLowerCase()}-${index}`;
}

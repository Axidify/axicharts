/** sRGB relative luminance (WCAG 2.x). */
export function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(rgb.r) +
    0.7152 * channel(rgb.g) +
    0.0722 * channel(rgb.b)
  );
}

export function contrastRatio(
  foreground: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number },
): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function parseRgbString(color: string): { r: number; g: number; b: number } | null {
  const trimmed = color.trim();
  const hex = trimmed.match(/^#([0-9a-f]{3,8})$/i);
  if (hex?.[1]) {
    const raw = hex[1];
    const full =
      raw.length === 3
        ? raw
            .split("")
            .map((ch) => ch + ch)
            .join("")
        : raw.slice(0, 6);
    return {
      r: Number.parseInt(full.slice(0, 2), 16),
      g: Number.parseInt(full.slice(2, 4), 16),
      b: Number.parseInt(full.slice(4, 6), 16),
    };
  }

  const rgb = trimmed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i,
  );
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
    };
  }

  return null;
}

export function resolveComputedRgb(
  color: string,
  element?: Element | null,
): { r: number; g: number; b: number } | null {
  const direct = parseRgbString(color);
  if (direct) return direct;

  const canvasRgb = resolveCanvasRgb(color);
  if (canvasRgb) return canvasRgb;

  if (typeof document === "undefined" || !element) {
    return null;
  }

  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.color = color;
  element.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  element.removeChild(probe);
  return parseRgbString(computed);
}

/** Match how canvas/uPlot resolves stroke colors (differs from getComputedStyle for bad hsl). */
export function resolveCanvasRgb(
  color: string,
): { r: number; g: number; b: number } | null {
  const direct = parseRgbString(color);
  if (direct) return direct;

  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#000000";
  try {
    ctx.fillStyle = color.trim();
  } catch {
    return null;
  }

  return parseRgbString(ctx.fillStyle);
}

/** Host apps sometimes paste RGB channels into hsl() — canvas may render as yellow. */
export function looksLikeRgbInHsl(color: string): boolean {
  const match = color.trim().match(/^hsla?\(\s*([^)]+)\)/i);
  if (!match?.[1]) return false;

  const body = match[1].split("/")[0]!.trim();
  if (body.includes("%")) return false;

  const parts = body.split(/\s+/).map(Number);
  if (parts.length < 3 || parts.some((value) => Number.isNaN(value))) {
    return false;
  }

  const saturation = parts[1]!;
  const lightness = parts[2]!;
  return saturation > 100 || lightness > 100;
}

/** Grid and axis chrome should be neutral greys — not series hues. */
export function isNeutralChromeRgb(rgb: {
  r: number;
  g: number;
  b: number;
}): boolean {
  const spread =
    Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
  return spread <= 40;
}

export function isAcceptableChromeColor(
  color: string,
  role: "grid" | "axis",
  background: { r: number; g: number; b: number },
  element?: Element | null,
): boolean {
  const trimmed = color.trim();
  if (!trimmed) return false;
  if (looksLikeRgbInHsl(trimmed)) return false;

  const rgb =
    resolveCanvasRgb(trimmed) ??
    resolveComputedRgb(trimmed, element ?? undefined);
  if (!rgb || !isNeutralChromeRgb(rgb)) return false;

  if (
    rgb.r === 0 &&
    rgb.g === 0 &&
    rgb.b === 0 &&
    !/^#0{3,8}$/i.test(trimmed) &&
    !/^black$/i.test(trimmed)
  ) {
    return false;
  }

  const minContrast = role === "axis" ? 4.5 : 1.15;
  if (contrastRatio(rgb, background) < minContrast) return false;

  if (role === "axis" && relativeLuminance(rgb) > 0.72) {
    return false;
  }

  return true;
}

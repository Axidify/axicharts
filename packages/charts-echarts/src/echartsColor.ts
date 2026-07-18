let colorParseCanvas: HTMLCanvasElement | null = null;

/** ECharts rejects modern `hsl(H S% L%)` tokens — normalize to rgb/hex. */
export function echartsColor(color: string): string {
  const trimmed = color.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("#")) return trimmed;

  if (typeof document !== "undefined") {
    colorParseCanvas ??= document.createElement("canvas");
    const ctx = colorParseCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillStyle = trimmed;
      return ctx.fillStyle;
    }
  }

  const modernHsl = trimmed.match(
    /^hsla?\(\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%(?:\s*\/\s*([\d.]+))?\s*\)$/i,
  );
  if (modernHsl) {
    const alpha = modernHsl[4];
    const comma = `hsl(${modernHsl[1]}, ${modernHsl[2]}%, ${modernHsl[3]}%)`;
    return alpha ? comma.replace(")", `, ${alpha})`).replace("hsl", "hsla") : comma;
  }

  return trimmed;
}

export function echartsPalette(colors: readonly string[]): string[] {
  return colors.map((color) => echartsColor(color));
}

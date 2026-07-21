import { formatFunnelShare, formatPieShare } from "./echartsDescriptor";
import type { ChartA11yDescriptor } from "./types";
import type { ChartA11yKeyboardNavMode } from "./a11yOptions";

export type A11yNavCursor = {
  seriesIndex: number;
  categoryIndex: number;
};

export type A11yNavPoint = A11yNavCursor & {
  announcement: string;
};

export type A11yNavModel = {
  seriesCount: number;
  categoryCount: number;
  usesGrid: boolean;
  pointAt: (seriesIndex: number, categoryIndex: number) => A11yNavPoint | null;
  flatPoints: A11yNavPoint[];
};

const EMPTY_CURSOR: A11yNavCursor = { seriesIndex: 0, categoryIndex: 0 };

function formatNavValue(value: number): string {
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value) ? String(value) : value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

function cartesianAnnouncement(
  category: string,
  seriesName: string,
  value: number,
): string {
  return `${category}, ${seriesName}, ${formatNavValue(value)}`;
}

function buildCartesianNavModel(
  descriptor: Extract<ChartA11yDescriptor, { kind: "cartesian" }>,
): A11yNavModel {
  const seriesCount = Math.max(descriptor.series.length, 1);
  const categoryCount = Math.max(descriptor.categories.length, 1);

  const pointAt = (seriesIndex: number, categoryIndex: number): A11yNavPoint | null => {
    const series = descriptor.series[seriesIndex];
    const category = descriptor.categories[categoryIndex];
    if (!series || category == null) return null;
    const value = series.values[categoryIndex];
    if (value == null) return null;
    return {
      seriesIndex,
      categoryIndex,
      announcement: cartesianAnnouncement(category, series.name, value),
    };
  };

  const flatPoints: A11yNavPoint[] = [];
  for (let seriesIndex = 0; seriesIndex < descriptor.series.length; seriesIndex += 1) {
    for (let categoryIndex = 0; categoryIndex < descriptor.categories.length; categoryIndex += 1) {
      const point = pointAt(seriesIndex, categoryIndex);
      if (point) flatPoints.push(point);
    }
  }

  return {
    seriesCount,
    categoryCount,
    usesGrid: descriptor.series.length > 0 && descriptor.categories.length > 0,
    pointAt,
    flatPoints,
  };
}

function buildFlatNavModel(
  points: A11yNavPoint[],
): A11yNavModel {
  return {
    seriesCount: 1,
    categoryCount: Math.max(points.length, 1),
    usesGrid: false,
    pointAt: (seriesIndex, categoryIndex) =>
      seriesIndex === 0 ? points[categoryIndex] ?? null : null,
    flatPoints: points,
  };
}

export function buildA11yNavModel(descriptor: ChartA11yDescriptor): A11yNavModel {
  if (descriptor.kind === "cartesian") {
    return buildCartesianNavModel(descriptor);
  }

  if (descriptor.kind === "single-value") {
    return buildFlatNavModel([
      {
        seriesIndex: 0,
        categoryIndex: 0,
        announcement: `${descriptor.title}, ${descriptor.value}`,
      },
    ]);
  }

  if (descriptor.kind === "pie") {
    return buildFlatNavModel(
      descriptor.slices.map((slice, index) => ({
        seriesIndex: 0,
        categoryIndex: index,
        announcement: `${slice.name}, ${formatNavValue(slice.value)}, ${formatPieShare(slice.value, descriptor.slices)}`,
      })),
    );
  }

  if (descriptor.kind === "funnel") {
    return buildFlatNavModel(
      descriptor.stages.map((stage, index) => ({
        seriesIndex: 0,
        categoryIndex: index,
        announcement: `${stage.name}, ${formatNavValue(stage.value)}, ${formatFunnelShare(stage.value, descriptor.stages)}`,
      })),
    );
  }

  if (descriptor.kind === "candlestick") {
    return buildFlatNavModel(
      descriptor.categories.map((category, index) => {
        const point = descriptor.data[index];
        const close = point?.close ?? 0;
        return {
          seriesIndex: 0,
          categoryIndex: index,
          announcement: `${category}, close ${formatNavValue(close)}`,
        };
      }),
    );
  }

  if (descriptor.kind === "heatmap") {
    const points: A11yNavPoint[] = [];
    let index = 0;
    descriptor.yCategories.forEach((yCategory, yIndex) => {
      descriptor.xCategories.forEach((xCategory, xIndex) => {
        const value = descriptor.values[yIndex]?.[xIndex] ?? 0;
        points.push({
          seriesIndex: 0,
          categoryIndex: index,
          announcement: `${xCategory}, ${yCategory}, ${formatNavValue(value)}`,
        });
        index += 1;
      });
    });
    return buildFlatNavModel(points);
  }

  if (descriptor.kind === "calendar") {
    return buildFlatNavModel(
      descriptor.points.map((point, index) => ({
        seriesIndex: 0,
        categoryIndex: index,
        announcement: `${point.date}, ${formatNavValue(point.value)}`,
      })),
    );
  }

  if (descriptor.kind === "pictorial-bar") {
    return buildFlatNavModel(
      descriptor.items.map((item, index) => ({
        seriesIndex: 0,
        categoryIndex: index,
        announcement: `${item.category}, ${formatNavValue(item.value)}`,
      })),
    );
  }

  if (descriptor.kind === "hierarchy") {
    return buildFlatNavModel(
      descriptor.items.map((item, index) => ({
        seriesIndex: 0,
        categoryIndex: index,
        announcement: `${item.path ?? item.name}, ${formatNavValue(item.value)}`,
      })),
    );
  }

  if (descriptor.kind === "word-cloud") {
    return buildFlatNavModel(
      descriptor.words.map((word, index) => ({
        seriesIndex: 0,
        categoryIndex: index,
        announcement: `${word.text}, ${formatNavValue(word.value)}`,
      })),
    );
  }

  return buildFlatNavModel([]);
}

export function getInitialA11yNavCursor(model: A11yNavModel): A11yNavCursor | null {
  const first = model.flatPoints[0];
  if (!first) return null;
  return { seriesIndex: first.seriesIndex, categoryIndex: first.categoryIndex };
}

export function getA11yNavPoint(
  model: A11yNavModel,
  cursor: A11yNavCursor,
): A11yNavPoint | null {
  if (!model.usesGrid) {
    return model.flatPoints[cursor.categoryIndex] ?? null;
  }
  return model.pointAt(cursor.seriesIndex, cursor.categoryIndex);
}

function clampCursor(model: A11yNavModel, cursor: A11yNavCursor): A11yNavCursor {
  if (!model.usesGrid) {
    const index = Math.min(
      Math.max(cursor.categoryIndex, 0),
      Math.max(model.flatPoints.length - 1, 0),
    );
    const point = model.flatPoints[index];
    return point
      ? { seriesIndex: point.seriesIndex, categoryIndex: point.categoryIndex }
      : EMPTY_CURSOR;
  }

  return {
    seriesIndex: Math.min(Math.max(cursor.seriesIndex, 0), model.seriesCount - 1),
    categoryIndex: Math.min(Math.max(cursor.categoryIndex, 0), model.categoryCount - 1),
  };
}

function moveFlat(
  model: A11yNavModel,
  cursor: A11yNavCursor,
  delta: number,
): A11yNavCursor {
  const currentIndex = model.flatPoints.findIndex(
    (point) =>
      point.seriesIndex === cursor.seriesIndex &&
      point.categoryIndex === cursor.categoryIndex,
  );
  const nextIndex =
    currentIndex < 0
      ? 0
      : Math.min(Math.max(currentIndex + delta, 0), model.flatPoints.length - 1);
  const next = model.flatPoints[nextIndex];
  return next
    ? { seriesIndex: next.seriesIndex, categoryIndex: next.categoryIndex }
    : cursor;
}

export function moveA11yNavCursor(
  model: A11yNavModel,
  cursor: A11yNavCursor,
  key: string,
  mode: ChartA11yKeyboardNavMode,
): A11yNavCursor {
  if (model.flatPoints.length === 0) return cursor;

  const flat = !model.usesGrid || mode === "serialize";

  if (flat) {
    if (key === "ArrowRight" || key === "ArrowDown") {
      return moveFlat(model, cursor, 1);
    }
    if (key === "ArrowLeft" || key === "ArrowUp") {
      return moveFlat(model, cursor, -1);
    }
    if (key === "Home") {
      const first = model.flatPoints[0];
      return first
        ? { seriesIndex: first.seriesIndex, categoryIndex: first.categoryIndex }
        : cursor;
    }
    if (key === "End") {
      const last = model.flatPoints[model.flatPoints.length - 1];
      return last
        ? { seriesIndex: last.seriesIndex, categoryIndex: last.categoryIndex }
        : cursor;
    }
    return cursor;
  }

  const current = clampCursor(model, cursor);

  if (key === "ArrowRight") {
    return clampCursor(model, {
      ...current,
      categoryIndex: current.categoryIndex + 1,
    });
  }
  if (key === "ArrowLeft") {
    return clampCursor(model, {
      ...current,
      categoryIndex: current.categoryIndex - 1,
    });
  }
  if (key === "ArrowDown") {
    return clampCursor(model, {
      ...current,
      seriesIndex: current.seriesIndex + 1,
    });
  }
  if (key === "ArrowUp") {
    return clampCursor(model, {
      ...current,
      seriesIndex: current.seriesIndex - 1,
    });
  }
  if (key === "Home") {
    return clampCursor(model, { ...current, categoryIndex: 0 });
  }
  if (key === "End") {
    return clampCursor(model, {
      ...current,
      categoryIndex: model.categoryCount - 1,
    });
  }

  return current;
}

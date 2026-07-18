export type TreemapDrillChange = {
  path: string[];
};

type TreePathNode = {
  name?: string;
};

export function treePathToDrillPath(
  treePathInfo: TreePathNode[] | undefined,
): string[] {
  return (treePathInfo ?? [])
    .map((node) => node.name)
    .filter((name): name is string => Boolean(name));
}

export type TreemapDrillSeriesOptions = {
  drilldown: boolean;
};

export function buildTreemapDrillOptions({
  drilldown,
}: TreemapDrillSeriesOptions) {
  return {
    nodeClick: drilldown ? ("zoomToNode" as const) : (false as const),
    breadcrumb: drilldown
      ? {
          show: true,
          bottom: 4,
          left: 8,
          height: 22,
          itemStyle: {
            color: "#64748b",
            fontSize: 11,
          },
          emphasis: {
            itemStyle: {
              color: "#0f172a",
            },
          },
        }
      : { show: false },
  };
}

export function pieGapOptions(innerRadius: number): {
  padAngle: number;
  itemStyle: {
    borderWidth: number;
    borderRadius: number | [number, number];
  };
} {
  return {
    padAngle: 0,
    itemStyle: {
      borderWidth: 0,
      borderRadius: innerRadius > 0 ? [4, 4] : 0,
    },
  };
}

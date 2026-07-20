export function pieGapOptions(_innerRadius: number): {
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
      borderRadius: 0,
    },
  };
}

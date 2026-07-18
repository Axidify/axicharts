import type { EChartsOption } from "echarts";

export function withPresentationAnimation(
  option: EChartsOption,
  animate: boolean,
): EChartsOption {
  if (!animate) {
    return {
      ...option,
      animation: false,
      animationDuration: 0,
      animationDurationUpdate: 280,
      animationEasingUpdate: "cubicOut",
    };
  }

  return {
    ...option,
    animation: true,
    animationDuration: 820,
    animationEasing: "cubicOut",
    animationDelay: (index: number) => index * 60,
    animationDurationUpdate: 420,
    animationEasingUpdate: "cubicOut",
  };
}

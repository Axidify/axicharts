import type { ChartAnimate, ChartAnimateConfig } from "./types";

export type PanelAnimationSpec = ChartAnimate;

export function readPanelAnimation(
  spec: {
    animation?: ChartAnimate;
    props?: Record<string, unknown>;
  },
): ChartAnimate | undefined {
  if (spec.animation != null) return spec.animation;
  const fromProps = spec.props?.animation ?? spec.props?.animate;
  if (fromProps == null) return undefined;
  return fromProps as ChartAnimate;
}

export function chartPropsWithoutAnimation(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...props };
  delete next.animation;
  delete next.animate;
  return next;
}

export function animationToSpecField(
  animation: ChartAnimate | undefined,
): ChartAnimateConfig | ChartAnimate | undefined {
  return animation;
}

export type LiveAnimate = "none" | "crossfade";

export function readPanelLiveAnimate(
  spec: {
    liveAnimate?: LiveAnimate;
    props?: Record<string, unknown>;
  },
): LiveAnimate | undefined {
  if (spec.liveAnimate != null) return spec.liveAnimate;
  const fromProps = spec.props?.liveAnimate;
  if (fromProps == null) return undefined;
  return fromProps as LiveAnimate;
}

export function chartPropsWithoutLiveAnimate(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...props };
  delete next.liveAnimate;
  return next;
}

import type { ReactElement } from "react";
import { cartesianA11ySummary } from "./cartesianDescriptor";
import type { CartesianA11yDescriptor } from "./types";

const TITLE_ID = "axicharts-a11y-title";
const DESC_ID = "axicharts-a11y-desc";

export type SvgA11yHeadProps = {
  descriptor: CartesianA11yDescriptor;
};

/** Inline SVG accessibility tree for static cartesian charts. */
export function SvgA11yHead({ descriptor }: SvgA11yHeadProps): ReactElement {
  const title = descriptor.title ?? cartesianA11ySummary(descriptor);
  const description = descriptor.description ?? cartesianA11ySummary(descriptor);

  return (
    <>
      <title id={TITLE_ID}>{title}</title>
      <desc id={DESC_ID}>{description}</desc>
      <g role="list" aria-label="Chart data series">
        {descriptor.series.map((item) => (
          <g key={item.name} role="listitem" aria-label={item.name}>
            {descriptor.categories.map((category, index) => (
              <text
                key={`${item.name}-${category}`}
                aria-hidden
                visibility="hidden"
              >
                {category}: {item.values[index] ?? ""}
              </text>
            ))}
          </g>
        ))}
      </g>
    </>
  );
}

export const SVG_A11Y_TITLE_ID = TITLE_ID;
export const SVG_A11Y_DESC_ID = DESC_ID;

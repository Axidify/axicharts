import { buildChartA11yTable, chartA11yTableToHtml } from "./a11yTable";
import { cartesianA11ySummary } from "./cartesianDescriptor";
import { chartA11ySummary } from "./echartsDescriptor";
import type { CartesianA11yDescriptor, ChartA11yDescriptor } from "./types";

const TITLE_ID = "axicharts-a11y-title";
const DESC_ID = "axicharts-a11y-desc";

function ensureSvgNamespace(svg: SVGSVGElement): void {
  if (!svg.getAttribute("xmlns")) {
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
}

function removeExistingA11y(svg: SVGSVGElement): void {
  for (const id of [TITLE_ID, DESC_ID, "axicharts-a11y-data", "axicharts-a11y-table"]) {
    const existing = svg.querySelector(`#${id}`);
    existing?.remove();
  }
}

function appendTitleDesc(
  svg: SVGSVGElement,
  title: string,
  description: string,
): void {
  const titleNode = document.createElementNS("http://www.w3.org/2000/svg", "title");
  titleNode.id = TITLE_ID;
  titleNode.textContent = title;
  svg.insertBefore(titleNode, svg.firstChild);

  const descNode = document.createElementNS("http://www.w3.org/2000/svg", "desc");
  descNode.id = DESC_ID;
  descNode.textContent = description;
  svg.insertBefore(descNode, titleNode.nextSibling);
}

function appendCartesianSeriesTree(
  svg: SVGSVGElement,
  descriptor: CartesianA11yDescriptor,
): void {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.id = "axicharts-a11y-data";
  group.setAttribute("role", "list");
  group.setAttribute("aria-label", "Chart data series");

  for (const item of descriptor.series) {
    const seriesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    seriesGroup.setAttribute("role", "listitem");
    seriesGroup.setAttribute("aria-label", item.name);

    descriptor.categories.forEach((category, index) => {
      const point = document.createElementNS("http://www.w3.org/2000/svg", "text");
      point.setAttribute("aria-hidden", "true");
      point.setAttribute("visibility", "hidden");
      point.textContent = `${category}: ${item.values[index] ?? ""}`;
      seriesGroup.appendChild(point);
    });

    group.appendChild(seriesGroup);
  }

  svg.appendChild(group);
}

function appendDataTableForeignObject(
  svg: SVGSVGElement,
  descriptor: ChartA11yDescriptor,
): void {
  const table = buildChartA11yTable(descriptor);
  const width = Math.max(1, Math.floor(svg.viewBox.baseVal.width || Number(svg.getAttribute("width")) || 1));
  const height = Math.max(1, Math.floor(svg.viewBox.baseVal.height || Number(svg.getAttribute("height")) || 1));
  const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  foreignObject.id = "axicharts-a11y-table";
  foreignObject.setAttribute("width", String(width));
  foreignObject.setAttribute("height", String(height));
  foreignObject.setAttribute("aria-hidden", "true");
  foreignObject.setAttribute("style", "opacity:0;pointer-events:none");

  const wrapper = document.createElement("div");
  wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  wrapper.innerHTML = chartA11yTableToHtml(table);
  foreignObject.appendChild(wrapper);
  svg.appendChild(foreignObject);
}

export function enhanceSvgElement(
  svg: SVGSVGElement,
  descriptor: ChartA11yDescriptor,
): SVGSVGElement {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  ensureSvgNamespace(clone);
  removeExistingA11y(clone);

  const title =
    descriptor.kind === "cartesian" ?
      descriptor.title ?? cartesianA11ySummary(descriptor)
    : descriptor.title ?? chartA11ySummary(descriptor);
  const description =
    descriptor.kind === "cartesian" ?
      descriptor.description ?? cartesianA11ySummary(descriptor)
    : descriptor.kind === "single-value" ?
      descriptor.description ?? `${descriptor.title}: ${descriptor.value}`
    : descriptor.description ?? chartA11ySummary(descriptor);

  clone.setAttribute("role", "graphics-document");
  clone.setAttribute("aria-labelledby", `${TITLE_ID} ${DESC_ID}`);
  appendTitleDesc(clone, title, description);

  if (descriptor.kind === "cartesian") {
    appendCartesianSeriesTree(clone, descriptor);
  }
  appendDataTableForeignObject(clone, descriptor);

  return clone;
}

export function enhanceSvgMarkup(
  markup: string,
  descriptor: ChartA11yDescriptor,
): string {
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  const svg = doc.documentElement;
  if (!(svg instanceof SVGSVGElement)) {
    return markup;
  }
  const enhanced = enhanceSvgElement(svg, descriptor);
  return new XMLSerializer().serializeToString(enhanced);
}

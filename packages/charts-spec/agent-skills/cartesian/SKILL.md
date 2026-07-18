# AxiCharts cartesian blocks (agent skill)

Use when composing or validating **cartesian dashboard panels** with `@axicharts/charts-spec`.

## When to use

- User wants a **custom** cartesian chart (not a fixed chart type menu).
- Intent mentions compare metrics, SLO, quota, target line, healthy band, or mixed bar+line.
- Tool must emit **one** panel type: `type: "cartesian"` + `marks[]`.

## Mark catalog (v1 — closed)

| Mark | Use when | Required |
|------|----------|----------|
| `bar` | Magnitude, counts, revenue | `field` |
| `line` | Trend, target, secondary metric | `field` |
| `area` | Volume, cumulative, MRR fill | `field` |
| `rule` | SLO, quota, threshold line | `value` (number) |
| `band` | Healthy range, target zone | `min`, `max` |

Use `mark` or `type` key on each mark object (canonical: `mark` in JSON fixtures).

## Never emit

- `type: "combo"`, `type: "line"`, `type: "blocks"` — normalize exists for migration only.
- `ComboChart`, `encoding.y[]` with `kind` — use `marks[]` instead.
- Unknown mark names (`point`, `scatter`, `text`) — not in v1 catalog.
- `referenceLines`, `thresholdBands`, `annotations[]` on new panels — use `rule` / `band` marks.

## Workflow

1. Read `dataProfile.fields` or sample row keys.
2. Emit `encoding.x.field` for shared category/time axis.
3. Append one or more data marks (`bar`/`line`/`area`).
4. Append overlays (`rule`, `band`) when intent mentions SLO/quota/range.
5. Call `validateCartesianSpec(spec, { rows })` — retry on `UNKNOWN_FIELD` using `suggestion`.
6. Optional: `ejectPanel(spec)` for human handoff to composable JSX.

## Few-shot presets

Exportable fixtures in `packages/charts-spec/examples/playground/`:

| Preset | Intent signal |
|--------|----------------|
| `revenue-target.panel.json` | revenue + target + quota + band |
| `ops-slo.panel.json` | latency + SLO rule + healthy band |
| `studio-cell.panel.json` | single studio bar tile |
| `dual-metric.panel.json` | bar + line, different magnitudes |

Interactive editor: Storybook **Spec/Blocks Playground** or docs `/spec/blocks`.

## Example output

```json
{
  "specVersion": 1,
  "type": "cartesian",
  "encoding": { "x": { "field": "week" } },
  "marks": [
    { "mark": "bar", "field": "revenue", "label": "Revenue" },
    { "mark": "line", "field": "target", "label": "Target" },
    { "mark": "rule", "value": 50, "label": "Quota" }
  ],
  "mode": "static",
  "theme": "studio"
}
```

## Error codes (retry loop)

| Code | Fix |
|------|-----|
| `UNKNOWN_FIELD` | Use `suggestion` or pick from `dataProfile.fields` |
| `MISSING_DATA_MARK` | Add at least one `bar`/`line`/`area` mark |
| `INVALID_BAND_RANGE` | Ensure `band.min < band.max` |
| `UNKNOWN_MARK` | Only v1 catalog marks allowed |

## Out of scope (separate panel types)

pie, candlestick, gauge, heatmap, scatter (`point` mark deferred v1.1), `renderPath` custom SVG (composable L3 only).

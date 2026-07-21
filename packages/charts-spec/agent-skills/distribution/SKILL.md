# Distribution agent skill (RFC-004)

Used by `@axicharts/charts-mcp` and Cursor agents when composing part-to-whole charts.

## Canonical spec

```json
{
  "type": "distribution",
  "encoding": {
    "angle": { "field": "share", "type": "quantitative" },
    "color": { "field": "browser", "type": "nominal" }
  },
  "marks": [
    { "mark": "arc", "field": "share" },
    { "mark": "donut", "innerRadius": 42 },
    { "mark": "label", "show": true }
  ]
}
```

## Validation errors

| Code | Fix |
|------|-----|
| `MISSING_ANGLE_FIELD` | Set `encoding.angle.field` |
| `MISSING_DATA_MARK` | Add `{ "mark": "arc", "field": "..." }` or `{ "mark": "funnel", "field": "..." }` |
| `MULTIPLE_DATA_MARKS` | Use only one of `arc` or `funnel` per panel |
| `UNKNOWN_FIELD` | Apply `fix` patch or rename field |
| `UNKNOWN_MARK` | Call `list_marks({ family: "distribution" })` |

## Playground presets

See `packages/charts-spec/src/distributionPlayground/presets.ts`:

- `browser-share-donut`
- `status-pie`
- `segment-tones`

## Simulation gate

`runDistributionSimulations()` must keep `silent_bad === 0` (RFC-004 C185).

# Contributing to AxiCharts

Thank you for helping improve `@axicharts/*`, the Dashboarder app, and related packages.

**Code and packages:** this repository ([axicharts](https://github.com/Axidify/axicharts))  
**Product design, RFCs, and roadmap docs:** [Dashboarder](https://github.com/Axidify/Dashboarder)

## Before you start

- Read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
- For non-trivial API or architecture changes, skim [GOVERNANCE](https://github.com/Axidify/Dashboarder/blob/main/docs/charts/GOVERNANCE.md) and open or reference an RFC in Dashboarder when required.
- Search [existing issues](https://github.com/Axidify/axicharts/issues) before opening a duplicate.

## Development setup

**Requirements:** Node.js 22+, [pnpm](https://pnpm.io/) 9.x (see `packageManager` in `package.json`).

```bash
git clone https://github.com/Axidify/axicharts.git
cd axicharts
pnpm install
pnpm build
```

Useful commands:

| Command | Purpose |
|---------|---------|
| `pnpm storybook` | Component docs and visual review → http://localhost:6006 |
| `pnpm dashboarder` | Dashboarder demo app → http://localhost:3000 |
| `pnpm test` | Unit and integration tests across packages |
| `pnpm typecheck` | TypeScript project references |
| `pnpm size` | Bundle size budgets (`size-limit`) |
| `pnpm ci` | Full local CI gate (build, test, perf, size, runtime examples, registry, visual) |

## Pull requests

1. Fork and branch from `main` (`feat/…`, `fix/…`, or `docs/…`).
2. Keep changes focused — one concern per PR when possible.
3. Add or update tests for behavior you change.
4. Run at least `pnpm build` and `pnpm test` (or the relevant package filter) before opening the PR.
5. For chart or bundle changes, ensure `pnpm size` passes.
6. Update [CHANGELOG.md](./CHANGELOG.md) under **Unreleased** for user-visible changes (or note that the release maintainer will fold release notes at tag time).

### Layer boundaries

- **Layer 1 (`@axicharts/charts`)** PRs must not import Dashboarder or AI planner code.
- Prefer new chart types via `registerChartType` in a plugin package over growing core.
- Spec compiler changes (`charts-spec`) should keep parity with validation, compile, and eject paths.

### RFCs and stable API

See [GOVERNANCE → RFC process](https://github.com/Axidify/Dashboarder/blob/main/docs/charts/GOVERNANCE.md#rfc-process). Breaking stable APIs need an RFC, deprecation window, and migration notes.

### Documentation

- API and usage: Storybook stories and package READMEs in this repo.
- Product direction and RFCs: [Dashboarder `docs/`](https://github.com/Axidify/Dashboarder/tree/main/docs).

## Reporting bugs

Open a [GitHub issue](https://github.com/Axidify/axicharts/issues) with:

- Package and version (`@axicharts/charts@…`)
- Minimal reproduction (code snippet, Storybook story, or sandbox)
- Expected vs actual behavior
- Browser / Node version if relevant

## Security

Do not open public issues for sensitive security reports. Use [GitHub private vulnerability reporting](https://github.com/Axidify/axicharts/security/advisories/new) for this repository.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE) used by this project.

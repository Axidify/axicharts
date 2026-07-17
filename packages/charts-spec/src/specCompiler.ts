import type { DataProfile, PanelSpec, SpecData } from "./types";

export type SpecCompilerContext = {
  data: SpecData;
  profile?: DataProfile;
};

export type SpecCompiler = {
  id: string;
  compile(
    panel: PanelSpec,
    context: SpecCompilerContext,
  ): PanelSpec | null | undefined;
};

const compilers: SpecCompiler[] = [];

export function registerSpecCompiler(compiler: SpecCompiler): void {
  const id = compiler.id.trim();
  if (!id) {
    throw new Error("[AxiCharts] registerSpecCompiler: id is required");
  }
  if (compilers.some((entry) => entry.id === id)) {
    throw new Error(`[AxiCharts] Spec compiler "${id}" is already registered`);
  }
  compilers.push(compiler);
}

export function listSpecCompilers(): string[] {
  return compilers.map((compiler) => compiler.id);
}

export function clearSpecCompilers(): void {
  compilers.length = 0;
}

export function applySpecCompilers(
  panel: PanelSpec,
  data: SpecData,
  profile?: DataProfile,
): PanelSpec {
  let current = panel;
  const context: SpecCompilerContext = { data, profile };

  for (const compiler of compilers) {
    const next = compiler.compile(current, context);
    if (next) {
      current = next;
    }
  }

  return current;
}

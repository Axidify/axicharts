import { compileRecipe } from "./tabularPlanning/recipes/compileRecipe";
import type {
  CompileRecipeOptions,
  CompiledRecipeResult,
  PanelRecipe,
} from "./tabularPlanning/recipes/types";

/**
 * C174 — compile a panel recipe + source rows into agent-safe PanelSpec and chart-ready rows.
 * Alias for `compileRecipe` with MCP-friendly naming.
 */
export function composePanel(
  recipe: PanelRecipe,
  rows: Record<string, unknown>[],
  options: CompileRecipeOptions = {},
): CompiledRecipeResult {
  return compileRecipe(recipe, rows, options);
}

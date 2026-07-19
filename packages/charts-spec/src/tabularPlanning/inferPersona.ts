import type { Persona } from "./types";

const PERSONA_PATTERNS: Array<{ persona: Persona; pattern: RegExp }> = [
  { persona: "executive", pattern: /\b(ceo|cfo|cto|executive|board|deck|c-suite|leadership)\b/i },
  { persona: "manager", pattern: /\b(manager|supervisor|lead|head\s*of|team\s*lead)\b/i },
  { persona: "analyst", pattern: /\b(analyst|audit|drill|detail|investigate|deep\s*dive)\b/i },
  { persona: "operator", pattern: /\b(operator|ops|floor|shift|plant|desk)\b/i },
];

/**
 * C156 — infer dashboard audience from natural-language intent.
 */
export function inferPersonaFromIntent(intent?: string): Persona | undefined {
  if (!intent?.trim()) return undefined;
  for (const { persona, pattern } of PERSONA_PATTERNS) {
    if (pattern.test(intent)) return persona;
  }
  return undefined;
}

export function resolvePersona(
  context?: { persona?: Persona; intent?: string },
  fallback: Persona = "manager",
): Persona {
  return context?.persona ?? inferPersonaFromIntent(context?.intent) ?? fallback;
}

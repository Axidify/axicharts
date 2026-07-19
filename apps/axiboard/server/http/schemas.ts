import { z } from "zod";

export const personaSchema = z.enum(["executive", "manager", "analyst", "operator"]);

export const tabularInputSchema = z
  .object({
    csv: z.string().optional(),
    rows: z.array(z.record(z.unknown())).optional(),
    persona: personaSchema.optional(),
    followUpIntents: z.array(z.string()).optional(),
    intent: z.string().optional(),
    message: z.string().optional(),
  })
  .refine((body) => Boolean(body.csv?.trim()) || (body.rows?.length ?? 0) > 0, {
    message: "csv or rows required",
    path: ["csv"],
  });

export const byokBodySchema = z.object({
  apiKey: z.string().min(1, "apiKey required"),
  model: z.string().optional(),
  baseUrl: z.string().optional(),
  sessionId: z.string().optional(),
});

export const workspaceSaveBodySchema = z.object({
  store: z.unknown(),
});

export type TabularInputBody = z.infer<typeof tabularInputSchema>;
export type ByokBody = z.infer<typeof byokBodySchema>;

import type { IncomingMessage } from "node:http";
import type { ZodType } from "zod";

export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text.trim()) return {};
  return JSON.parse(text) as unknown;
}

export function formatZodError(error: { issues: Array<{ path: Array<string | number>; message: string }> }): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "$";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

export async function parseJsonBody<T>(req: IncomingMessage, schema: ZodType<T>): Promise<
  | { ok: true; data: T }
  | { ok: false; error: string }
> {
  let raw: unknown;
  try {
    raw = await readJsonBody(req);
  } catch {
    return { ok: false, error: "Invalid JSON body" };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }

  return { ok: true, data: parsed.data };
}

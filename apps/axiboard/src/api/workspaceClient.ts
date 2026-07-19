import type { WorkspaceStore } from "@axicharts/charts-runtime";

type WorkspaceResponse = {
  ok: boolean;
  store?: WorkspaceStore | null;
  error?: string;
};

export async function fetchWorkspaceStore(): Promise<WorkspaceStore | null> {
  const response = await fetch("/api/workspaces");
  const payload = (await response.json()) as WorkspaceResponse;
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? "Failed to load workspace");
  }
  return payload.store ?? null;
}

export async function saveWorkspaceStoreToServer(store: WorkspaceStore): Promise<void> {
  const response = await fetch("/api/workspaces", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ store }),
  });
  const payload = (await response.json()) as { ok: boolean; error?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? "Failed to save workspace");
  }
}

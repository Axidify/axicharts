import { useCallback, useEffect, useRef, useState } from "react";
import type { Persona } from "@axicharts/charts-spec";
import { postOrchestratorChat, type OrchestratorChatResult } from "../api/orchestratorClient";
import {
  fetchRndSession,
  saveRndSession,
  type RndSlug,
} from "../api/rndSessionClient";

export type UseOrchestratorPlanOptions = {
  csv: string;
  initialPersona?: Persona;
  initialFollowUpIntents?: string[];
  intent?: string;
  initialResult?: OrchestratorChatResult | null;
  skipInitialFetch?: boolean;
  /** When set, applies persisted persona/plan once before auto-refresh. */
  bootstrap?: {
    persona: Persona;
    followUpIntents: string[];
    lastResult?: OrchestratorChatResult | null;
  } | null;
};

export function useOrchestratorPlan({
  csv,
  initialPersona = "manager",
  initialFollowUpIntents = [],
  intent,
  initialResult = null,
  skipInitialFetch = false,
  bootstrap = null,
}: UseOrchestratorPlanOptions) {
  const [persona, setPersona] = useState<Persona>(initialPersona);
  const [followUpIntents, setFollowUpIntents] = useState<string[]>(initialFollowUpIntents);
  const [result, setResult] = useState<OrchestratorChatResult | null>(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const followUpRef = useRef(followUpIntents);
  followUpRef.current = followUpIntents;
  const skipOnceRef = useRef(skipInitialFetch && initialResult != null);
  const bootstrapAppliedRef = useRef(false);

  useEffect(() => {
    if (!bootstrap || bootstrapAppliedRef.current) return;
    bootstrapAppliedRef.current = true;
    setPersona(bootstrap.persona);
    setFollowUpIntents(bootstrap.followUpIntents);
    if (bootstrap.lastResult) {
      setResult(bootstrap.lastResult);
      skipOnceRef.current = true;
    }
  }, [bootstrap]);

  const refresh = useCallback(
    async (overrides?: { followUpIntents?: string[]; persona?: Persona; message?: string }) => {
      if (!csv.trim()) {
        setResult(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await postOrchestratorChat({
          csv,
          persona: overrides?.persona ?? persona,
          followUpIntents: overrides?.followUpIntents ?? followUpRef.current,
          intent,
          message: overrides?.message ?? "",
        });
        setResult(response);
        setFollowUpIntents(response.followUpIntents);
        if (response.persona) setPersona(response.persona);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Orchestrator request failed");
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    [csv, intent, persona],
  );

  useEffect(() => {
    if (!bootstrap) return;
    setFollowUpIntents(bootstrap.followUpIntents);
    if (skipOnceRef.current) {
      skipOnceRef.current = false;
      return;
    }
    void refresh({ followUpIntents: bootstrap.followUpIntents, persona: bootstrap.persona });
  }, [csv, persona, bootstrap]);

  const sendMessage = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) return;
      await refresh({ message: trimmed });
    },
    [refresh],
  );

  return {
    result,
    loading,
    error,
    persona,
    setPersona,
    followUpIntents,
    sendMessage,
    refresh,
  };
}

export type UseRndSessionOptions = {
  slug: RndSlug;
  sampleCsv: string;
  initialFollowUpIntents?: string[];
  intent?: string;
};

export function useRndSession({
  slug,
  sampleCsv,
  initialFollowUpIntents = [],
  intent,
}: UseRndSessionOptions) {
  const [rawText, setRawText] = useState(sampleCsv);
  const [bootstrap, setBootstrap] = useState<{
    persona: Persona;
    followUpIntents: string[];
    lastResult?: OrchestratorChatResult | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchRndSession(slug)
      .then((session) => {
        if (cancelled) return;
        if (session?.csv) setRawText(session.csv);
        setBootstrap({
          persona: session?.persona ?? "manager",
          followUpIntents: session?.followUpIntents ?? initialFollowUpIntents,
          lastResult: session?.lastResult ?? null,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setBootstrap({
          persona: "manager",
          followUpIntents: initialFollowUpIntents,
          lastResult: null,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, initialFollowUpIntents]);

  const orchestrator = useOrchestratorPlan({
    csv: bootstrap ? rawText : "",
    bootstrap,
    intent,
  });

  useEffect(() => {
    if (!bootstrap) return;
    const timer = window.setTimeout(() => {
      void saveRndSession(slug, {
        csv: rawText,
        persona: orchestrator.persona,
        followUpIntents: orchestrator.followUpIntents,
        lastResult: orchestrator.result ?? undefined,
        updatedAt: new Date().toISOString(),
      }).catch(() => {
        // Persistence is best-effort when API is unavailable.
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [
    bootstrap,
    slug,
    rawText,
    orchestrator.persona,
    orchestrator.followUpIntents,
    orchestrator.result,
  ]);

  return {
    rawText,
    setRawText,
    hydrated: bootstrap != null,
    ...orchestrator,
  };
}

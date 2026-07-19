import { useCallback, useEffect, useRef, useState } from "react";
import type { Persona } from "@axicharts/charts-spec";
import { postOrchestratorChat, type OrchestratorChatResult } from "../api/orchestratorClient";

export type UseOrchestratorPlanOptions = {
  csv: string;
  initialPersona?: Persona;
  initialFollowUpIntents?: string[];
  intent?: string;
  initialResult?: OrchestratorChatResult | null;
  /** Debounced replan when csv or persona changes (upload flow). */
  autoPlan?: boolean;
};

export function useOrchestratorPlan({
  csv,
  initialPersona = "manager",
  initialFollowUpIntents = [],
  intent,
  initialResult = null,
  autoPlan = false,
}: UseOrchestratorPlanOptions) {
  const [persona, setPersona] = useState<Persona>(initialPersona);
  const [followUpIntents, setFollowUpIntents] = useState<string[]>(initialFollowUpIntents);
  const [result, setResult] = useState<OrchestratorChatResult | null>(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const followUpRef = useRef(followUpIntents);
  followUpRef.current = followUpIntents;

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
    if (!autoPlan) return;
    if (!csv.trim()) {
      setResult(null);
      return;
    }
    const timer = window.setTimeout(() => {
      void refresh();
    }, 400);
    return () => window.clearTimeout(timer);
  }, [autoPlan, csv, persona, refresh]);

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

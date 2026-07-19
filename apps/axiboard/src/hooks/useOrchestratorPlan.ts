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
  const [sessionCsv, setSessionCsv] = useState(csv);
  const [result, setResult] = useState<OrchestratorChatResult | null>(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const followUpRef = useRef(followUpIntents);
  followUpRef.current = followUpIntents;
  const sessionCsvRef = useRef(sessionCsv);
  sessionCsvRef.current = sessionCsv;

  useEffect(() => {
    setSessionCsv(csv);
    sessionCsvRef.current = csv;
  }, [csv]);

  const refresh = useCallback(
    async (overrides?: {
      followUpIntents?: string[];
      persona?: Persona;
      message?: string;
      csv?: string;
    }) => {
      const activeCsv = overrides?.csv ?? sessionCsvRef.current;
      if (!activeCsv.trim()) {
        setResult(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await postOrchestratorChat({
          csv: activeCsv,
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
    [sessionCsv, intent, persona],
  );

  useEffect(() => {
    if (!autoPlan) return;
    if (!sessionCsv.trim()) {
      setResult(null);
      return;
    }
    const timer = window.setTimeout(() => {
      void refresh();
    }, 400);
    return () => window.clearTimeout(timer);
  }, [autoPlan, sessionCsv, persona, refresh]);

  const resetSession = useCallback(() => {
    setSessionCsv("");
    sessionCsvRef.current = "";
    setFollowUpIntents([]);
    followUpRef.current = [];
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (message: string, csvOverride?: string) => {
      const newCsv = csvOverride?.trim();
      const activeCsv = newCsv ? csvOverride! : sessionCsvRef.current;
      const resetFollowUps = Boolean(newCsv);
      if (newCsv) {
        setSessionCsv(newCsv);
        sessionCsvRef.current = newCsv;
        setFollowUpIntents([]);
        followUpRef.current = [];
      }
      const trimmed = message.trim();
      if (!trimmed && !activeCsv.trim()) return;
      await refresh({
        message: trimmed || "Build a dashboard for this data",
        csv: activeCsv,
        followUpIntents: resetFollowUps ? [] : undefined,
      });
    },
    [refresh, sessionCsv],
  );

  return {
    result,
    loading,
    error,
    persona,
    setPersona,
    followUpIntents,
    sessionCsv,
    setSessionCsv,
    sendMessage,
    refresh,
    resetSession,
  };
}

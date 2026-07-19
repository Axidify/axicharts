import type { VerticalId } from "../../rulePacks/types";
import type { AnalyticalQuestion } from "../types";
import { ATTENDANCE_QUESTIONS } from "./attendance";
import { LEDGER_QUESTIONS } from "./ledger";
import { SALES_QUESTIONS } from "./sales";

const BY_VERTICAL: Record<VerticalId, AnalyticalQuestion[]> = {
  sales: SALES_QUESTIONS,
  ledger: LEDGER_QUESTIONS,
  attendance: ATTENDANCE_QUESTIONS,
  finance: [],
  trading: [],
  ops: [],
};

export const ALL_TABULAR_QUESTIONS: AnalyticalQuestion[] = [
  ...SALES_QUESTIONS,
  ...LEDGER_QUESTIONS,
  ...ATTENDANCE_QUESTIONS,
];

export function questionsForVertical(vertical: VerticalId): AnalyticalQuestion[] {
  return BY_VERTICAL[vertical] ?? [];
}

export {
  SALES_QUESTIONS,
  LEDGER_QUESTIONS,
  ATTENDANCE_QUESTIONS,
};

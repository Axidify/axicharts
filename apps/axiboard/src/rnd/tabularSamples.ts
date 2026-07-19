import { SAMPLE_ATTENDANCE_TEXT } from "./sampleAttendance";
import { SAMPLE_LEDGER_TEXT } from "./sampleLedger";
import { SAMPLE_PIPELINE_TEXT } from "./samplePipeline";

export type TabularSampleId = "ledger" | "sales" | "attendance";

export type TabularSample = {
  id: TabularSampleId;
  label: string;
  csv: string;
  hint: string;
};

export const TABULAR_SAMPLES: TabularSample[] = [
  {
    id: "ledger",
    label: "Ledger sample",
    csv: SAMPLE_LEDGER_TEXT,
    hint: "Date, Debit, Credit, Balance, Category, Cost Center",
  },
  {
    id: "sales",
    label: "Sales pipeline sample",
    csv: SAMPLE_PIPELINE_TEXT,
    hint: "Opportunity ID, Stage, Value, Probability, Salesperson",
  },
  {
    id: "attendance",
    label: "Attendance sample",
    csv: SAMPLE_ATTENDANCE_TEXT,
    hint: "Employee ID, Department, Date, Hours, Status",
  },
];

export function tabularSampleById(id: TabularSampleId): TabularSample {
  return TABULAR_SAMPLES.find((sample) => sample.id === id) ?? TABULAR_SAMPLES[0]!;
}

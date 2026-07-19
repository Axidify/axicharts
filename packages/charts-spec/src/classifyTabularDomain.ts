import type { DataProfile, FieldProfile } from "./types";
import type { VerticalId } from "./rulePacks/types";
import { inferFieldRoles } from "./inferFieldRoles";

export type TabularVerticalId = VerticalId | "generic";

export type DomainSemantics = {
  vertical: TabularVerticalId;
  /** 0–1 — relative strength of top vertical vs runner-up. */
  confidence: number;
  /** True when top two verticals are close or overall score is weak. */
  needsReview: boolean;
  scores: Record<VerticalId, number>;
  entities: string[];
  /** Matched field signals for agent decision logs. */
  signals: string[];
};

type DomainSignal = {
  pattern: RegExp;
  vertical: VerticalId;
  weight: number;
  entity?: string;
  label: string;
};

const DOMAIN_SIGNALS: DomainSignal[] = [
  {
    pattern: /\b(opportunity|deal|lead)\s*id\b/i,
    vertical: "sales",
    weight: 5,
    entity: "opportunity",
    label: "opportunity/deal id",
  },
  {
    pattern: /\b(stage|phase|pipeline\s*step)\b/i,
    vertical: "sales",
    weight: 4,
    entity: "stage",
    label: "stage/phase",
  },
  {
    pattern: /\b(probability|likelihood|win\s*rate)\b/i,
    vertical: "sales",
    weight: 4,
    label: "probability",
  },
  {
    pattern: /\b(salesperson|sales\s*rep|deal\s*owner|account\s*exec)\b/i,
    vertical: "sales",
    weight: 4,
    entity: "salesperson",
    label: "salesperson",
  },
  {
    pattern: /\b(expected\s*close|close\s*date)\b/i,
    vertical: "sales",
    weight: 3,
    label: "expected close",
  },
  {
    pattern: /\b(lead\s*source|channel)\b/i,
    vertical: "sales",
    weight: 2,
    entity: "source",
    label: "lead source",
  },
  {
    pattern: /\bdebit\b/i,
    vertical: "ledger",
    weight: 5,
    label: "debit",
  },
  {
    pattern: /\bcredit\b/i,
    vertical: "ledger",
    weight: 5,
    label: "credit",
  },
  {
    pattern: /\bbalance\b/i,
    vertical: "ledger",
    weight: 4,
    label: "balance",
  },
  {
    pattern: /\bpayment\s*method\b/i,
    vertical: "ledger",
    weight: 4,
    entity: "payment_method",
    label: "payment method",
  },
  {
    pattern: /\bcost\s*center\b/i,
    vertical: "ledger",
    weight: 4,
    entity: "cost_center",
    label: "cost center",
  },
  {
    pattern: /\b(transaction\s*id|invoice\s*no|gl\s*account|journal)\b/i,
    vertical: "ledger",
    weight: 3,
    entity: "transaction",
    label: "transaction/journal",
  },
  {
    pattern: /\b(employee\s*id|staff\s*id|emp\s*id)\b/i,
    vertical: "attendance",
    weight: 5,
    entity: "employee",
    label: "employee id",
  },
  {
    pattern: /\b(clock\s*in|clock\s*out|time\s*in|time\s*out)\b/i,
    vertical: "attendance",
    weight: 5,
    label: "clock in/out",
  },
  {
    pattern: /\bhours\b/i,
    vertical: "attendance",
    weight: 4,
    label: "hours",
  },
  {
    pattern: /\b(department|team)\b/i,
    vertical: "attendance",
    weight: 2,
    entity: "department",
    label: "department",
  },
  {
    pattern: /\b(margin|gross\s*margin|net\s*income)\b/i,
    vertical: "finance",
    weight: 4,
    label: "margin",
  },
  {
    pattern: /\b(p&l|pnl|variance|vs\s*plan)\b/i,
    vertical: "finance",
    weight: 4,
    label: "p&l/variance",
  },
  {
    pattern: /\b(latency|p95|p99|throughput)\b/i,
    vertical: "ops",
    weight: 4,
    label: "latency/throughput",
  },
  {
    pattern: /\b(utilization|oee|uptime)\b/i,
    vertical: "ops",
    weight: 3,
    label: "utilization",
  },
  {
    pattern: /\b(alarm|telemetry|shift|line\s*\d)\b/i,
    vertical: "ops",
    weight: 3,
    label: "ops telemetry",
  },
  {
    pattern: /\b(symbol|ticker|blotter|position)\b/i,
    vertical: "trading",
    weight: 4,
    entity: "instrument",
    label: "trading instrument",
  },
];

const ROLE_BOOST: Partial<Record<VerticalId, Partial<Record<FieldProfile["role"], number>>>> = {
  sales: { identifier: 1, measure: 0.5 },
  ledger: { measure: 1 },
  attendance: { identifier: 1, measure: 0.5 },
};

const EMPTY_SCORES = (): Record<VerticalId, number> => ({
  finance: 0,
  ledger: 0,
  trading: 0,
  ops: 0,
  attendance: 0,
  sales: 0,
});

const MIN_SCORE_FOR_VERTICAL = 4;
export const MIN_DOMAIN_CONFIDENCE_TO_TAG = 0.45;

function scoreFieldProfiles(fieldProfiles: FieldProfile[]): {
  scores: Record<VerticalId, number>;
  entities: Set<string>;
  signals: string[];
} {
  const scores = EMPTY_SCORES();
  const entities = new Set<string>();
  const signals: string[] = [];

  for (const profile of fieldProfiles) {
    for (const signal of DOMAIN_SIGNALS) {
      if (!signal.pattern.test(profile.name)) continue;

      const roleBoost = ROLE_BOOST[signal.vertical]?.[profile.role] ?? 0;
      scores[signal.vertical] += signal.weight + roleBoost;

      if (signal.entity) entities.add(signal.entity);
      signals.push(`${profile.name}→${signal.vertical}:${signal.label}`);
    }
  }

  const names = fieldProfiles.map((profile) => profile.name.toLowerCase());
  if (names.some((n) => /\bdebit\b/.test(n)) && names.some((n) => /\bcredit\b/.test(n))) {
    scores.ledger += 3;
    signals.push("combo:debit+credit→ledger");
  }

  return { scores, entities, signals };
}

function rankScores(scores: Record<VerticalId, number>): VerticalId[] {
  return (Object.entries(scores) as [VerticalId, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([vertical]) => vertical);
}

function computeConfidence(top: number, runnerUp: number): number {
  if (top <= 0) return 0;
  if (runnerUp <= 0) return Math.min(1, top / 10);
  return top / (top + runnerUp);
}

export type ClassifyTabularDomainInput =
  | { fieldProfiles: FieldProfile[] }
  | DataProfile
  | { rows: Record<string, unknown>[] };

function resolveFieldProfiles(input: ClassifyTabularDomainInput): FieldProfile[] {
  if ("rows" in input && input.rows.length > 0) {
    return inferFieldRoles(input.rows);
  }
  if ("fieldProfiles" in input && input.fieldProfiles && input.fieldProfiles.length > 0) {
    return input.fieldProfiles;
  }
  if ("metrics" in input && input.fieldProfiles && input.fieldProfiles.length > 0) {
    return input.fieldProfiles;
  }
  if ("metrics" in input && input.fields?.length) {
    return input.fields.map((name) => ({ name, role: "dimension" as const }));
  }
  return [];
}

/**
 * C155 — infer business vertical from tabular field names + roles (data-driven).
 */
export function classifyTabularDomain(input: ClassifyTabularDomainInput): DomainSemantics {
  const fieldProfiles = resolveFieldProfiles(input);
  const { scores, entities, signals } = scoreFieldProfiles(fieldProfiles);
  const ranked = rankScores(scores);
  const top = ranked[0]!;
  const topScore = scores[top];
  const runnerUp = ranked[1]!;
  const runnerUpScore = scores[runnerUp];
  const confidence = computeConfidence(topScore, runnerUpScore);

  const belowMinScore = topScore < MIN_SCORE_FOR_VERTICAL;
  const closeRunnerUp =
    runnerUpScore > 0 && topScore > 0 && (topScore - runnerUpScore) / topScore < 0.2;
  const lowConfidence = confidence < MIN_DOMAIN_CONFIDENCE_TO_TAG;

  const vertical: TabularVerticalId = belowMinScore ? "generic" : top;
  const needsReview =
    belowMinScore || lowConfidence || (vertical !== "generic" && closeRunnerUp);

  return {
    vertical,
    confidence,
    needsReview,
    scores,
    entities: [...entities],
    signals,
  };
}

/** Apply classified vertical to metric tags when none are set (C155). */
export function enrichProfileWithDomain(profile: DataProfile): {
  profile: DataProfile;
  domain: DomainSemantics;
} {
  const domain = classifyTabularDomain(profile);
  const hasVerticalTag = profile.metrics.some((metric) => metric.tags?.vertical);

  if (hasVerticalTag || domain.vertical === "generic" || domain.confidence < MIN_DOMAIN_CONFIDENCE_TO_TAG) {
    return { profile, domain };
  }

  const metrics = profile.metrics.map((metric) => ({
    ...metric,
    tags: { ...metric.tags, vertical: domain.vertical },
  }));

  return {
    profile: { ...profile, metrics },
    domain,
  };
}

import type { Persona } from "@axicharts/charts-spec";

const selectStyle = {
  fontSize: 12,
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
} as const;

const PERSONAS: { id: Persona; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "manager", label: "Manager" },
  { id: "analyst", label: "Analyst" },
  { id: "operator", label: "Operator" },
];

export type PersonaSelectProps = {
  value: Persona;
  onChange: (persona: Persona) => void;
};

export function PersonaSelect({ value, onChange }: PersonaSelectProps) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8" }}>
      Audience
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Persona)}
        style={selectStyle}
      >
        {PERSONAS.map((persona) => (
          <option key={persona.id} value={persona.id}>
            {persona.label}
          </option>
        ))}
      </select>
    </label>
  );
}

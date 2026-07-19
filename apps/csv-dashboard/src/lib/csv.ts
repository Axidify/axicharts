export type CsvRow = Record<string, string | number>;

export function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      const raw = cells[index] ?? "";
      const num = Number(raw);
      row[header] = raw !== "" && Number.isFinite(num) ? num : raw;
    });
    return row;
  });
}

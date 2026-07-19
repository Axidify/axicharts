export type TabularRow = Record<string, string | number>;

/** Strip thousands separators and currency noise from a cell value. */
export function parseAmount(raw: string): number {
  const cleaned = raw
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/\(RM\)/gi, "")
    .replace(/^RM/i, "")
    .replace(/RM$/i, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function splitCells(line: string, delimiter: "," | "|" | "\t"): string[] {
  const parts =
    delimiter === "|"
      ? line.split("|").map((cell) => cell.trim())
      : line.split(delimiter).map((cell) => cell.trim());

  if (delimiter === "|") {
    if (parts[0] === "") parts.shift();
    if (parts.at(-1) === "") parts.pop();
  }

  return parts;
}

function detectDelimiter(line: string): "," | "|" | "\t" {
  const pipes = (line.match(/\|/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  if (pipes > commas && pipes > 0) return "|";
  if (commas > 0) return ",";
  return "\t";
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{2,}:?$/.test(cell));
}

function coerceCell(raw: string, header: string): string | number {
  if (raw === "") return raw;
  const amountLike = /debit|credit|balance|amount|total|rm/i.test(header);
  if (amountLike) {
    const num = parseAmount(raw);
    if (Number.isFinite(num) && /[\d]/.test(raw)) return num;
  }
  const num = Number(raw);
  if (raw !== "" && Number.isFinite(num) && !/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return num;
  }
  return raw;
}

/** R&D tabular parser — comma, pipe, or TSV; handles markdown tables and RM amounts. */
export function parseTabular(text: string): TabularRow[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headerLine = lines.find((line) => {
    const cells = splitCells(line, delimiter);
    return cells.length > 1 && !isSeparatorRow(cells);
  });

  if (!headerLine) return [];

  const headers = splitCells(headerLine, delimiter);
  const dataLines = lines.filter((line) => {
    if (line === headerLine) return false;
    const cells = splitCells(line, delimiter);
    if (cells.length === 0) return false;
    if (isSeparatorRow(cells)) return false;
    return true;
  });

  return dataLines.map((line) => {
    const cells = splitCells(line, delimiter);
    const row: TabularRow = {};
    headers.forEach((header, index) => {
      const raw = cells[index] ?? "";
      row[header] = coerceCell(raw, header);
    });
    return row;
  });
}

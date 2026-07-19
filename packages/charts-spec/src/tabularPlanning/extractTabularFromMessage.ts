function isPipeTableRow(line: string): boolean {
  return line.trim().includes("|");
}

/** Collect consecutive pipe-delimited rows; stop at blank lines or non-table prose. */
function extractPipeTableBlock(lines: string[], start: number): string[] {
  const tabularLines: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i]!;
    if (!line.trim()) {
      if (tabularLines.length >= 2) break;
      continue;
    }
    if (!isPipeTableRow(line)) break;
    tabularLines.push(line);
  }
  return tabularLines;
}

/**
 * C179 — split user chat message into prose + optional tabular block.
 */
export function extractTabularFromMessage(message: string): {
  text: string;
  tabular?: string;
} {
  const trimmed = message.trim();
  if (!trimmed) return { text: "" };

  const lines = trimmed.split(/\r?\n/);
  if (lines.length < 2) return { text: trimmed };

  const start = lines.findIndex(isPipeTableRow);
  if (start >= 0) {
    const tabularLines = extractPipeTableBlock(lines, start);
    if (tabularLines.length >= 2) {
      const prose = lines.slice(0, start).join("\n").trim();
      const trailing = lines
        .slice(start + tabularLines.length)
        .join("\n")
        .trim();
      return {
        text: prose || trailing || "Build a dashboard for this data",
        tabular: tabularLines.join("\n"),
      };
    }
  }

  const delimiter = lines[0]!.includes("\t")
    ? "\t"
    : lines[0]!.includes(",")
      ? ","
      : null;

  if (delimiter && lines.length >= 2) {
    const headerCells = lines[0]!.split(delimiter).length;
    const tabularLines = lines.filter((line) => line.split(delimiter).length >= headerCells - 1);
    if (tabularLines.length >= 2) {
      return {
        text: "Build a dashboard for this data",
        tabular: tabularLines.join("\n"),
      };
    }
  }

  return { text: trimmed };
}

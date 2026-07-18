import { createElement, type CSSProperties, type ReactNode } from "react";
import type { StatSurface } from "../stat/Stat";

function safeHref(url: string): string | null {
  const trimmed = url.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  return null;
}

function parseInline(source: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < source.length) {
    if (source[i] === "[") {
      const closeBracket = source.indexOf("]", i);
      const openParen = closeBracket >= 0 ? source.indexOf("(", closeBracket) : -1;
      const closeParen = openParen >= 0 ? source.indexOf(")", openParen) : -1;
      if (closeBracket > i && openParen === closeBracket + 1 && closeParen > openParen) {
        const label = source.slice(i + 1, closeBracket);
        const href = safeHref(source.slice(openParen + 1, closeParen));
        nodes.push(
          href
            ? createElement(
                "a",
                {
                  key: `${keyPrefix}-${key++}`,
                  href,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                label,
              )
            : source.slice(i, closeParen + 1),
        );
        i = closeParen + 1;
        continue;
      }
    }

    if (source.startsWith("**", i)) {
      const end = source.indexOf("**", i + 2);
      if (end > i + 2) {
        nodes.push(
          createElement(
            "strong",
            { key: `${keyPrefix}-${key++}` },
            source.slice(i + 2, end),
          ),
        );
        i = end + 2;
        continue;
      }
    }

    if (source[i] === "`") {
      const end = source.indexOf("`", i + 1);
      if (end > i + 1) {
        nodes.push(
          createElement(
            "code",
            { key: `${keyPrefix}-${key++}` },
            source.slice(i + 1, end),
          ),
        );
        i = end + 1;
        continue;
      }
    }

    if (source[i] === "*" && source[i + 1] !== "*") {
      const end = source.indexOf("*", i + 1);
      if (end > i + 1) {
        nodes.push(
          createElement(
            "em",
            { key: `${keyPrefix}-${key++}` },
            source.slice(i + 1, end),
          ),
        );
        i = end + 1;
        continue;
      }
    }

    let next = i + 1;
    while (next < source.length) {
      const char = source[next];
      if (char === "[" || char === "*" || char === "`") break;
      next++;
    }
    nodes.push(source.slice(i, next));
    i = next;
  }

  return nodes;
}

const SURFACE_STYLES: Record<
  StatSurface,
  {
    text: string;
    muted: string;
    link: string;
    codeBg: string;
    codeBorder: string;
    heading: string;
  }
> = {
  dark: {
    text: "#e2e8f0",
    muted: "#94a3b8",
    link: "#93c5fd",
    codeBg: "#1e293b",
    codeBorder: "#334155",
    heading: "#f8fafc",
  },
  light: {
    text: "#0f172a",
    muted: "#64748b",
    link: "#2563eb",
    codeBg: "#f8fafc",
    codeBorder: "#e2e8f0",
    heading: "#0f172a",
  },
};

function inlineStyles(surface: StatSurface): CSSProperties {
  const palette = SURFACE_STYLES[surface];
  return {
    color: palette.text,
    ["--md-link" as string]: palette.link,
    ["--md-code-bg" as string]: palette.codeBg,
    ["--md-code-border" as string]: palette.codeBorder,
  };
}

export function parseMarkdownBlocks(
  source: string,
  surface: StatSurface,
): ReactNode[] {
  const palette = SURFACE_STYLES[surface];
  const blocks: ReactNode[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  let key = 0;

  const linkStyle: CSSProperties = {
    color: palette.link,
    textDecoration: "underline",
    textUnderlineOffset: 2,
  };

  const codeStyle: CSSProperties = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "0.92em",
    background: palette.codeBg,
    border: `1px solid ${palette.codeBorder}`,
    borderRadius: 4,
    padding: "1px 5px",
  };

  const wrapInline = (text: string, prefix: string): ReactNode[] =>
    parseInline(text, prefix).map((node, index) => {
      if (typeof node === "string") return node;
      if (
        node &&
        typeof node === "object" &&
        "type" in node &&
        node.type === "a"
      ) {
        return createElement(
          "a",
          {
            ...(node.props as Record<string, unknown>),
            style: linkStyle,
          },
          (node.props as { children?: ReactNode }).children,
        );
      }
      if (
        node &&
        typeof node === "object" &&
        "type" in node &&
        node.type === "code"
      ) {
        return createElement(
          "code",
          { style: codeStyle },
          (node.props as { children?: ReactNode }).children,
        );
      }
      return createElement("span", { key: `${prefix}-wrap-${index}` }, node);
    });

  while (i < lines.length) {
    const line = lines[i]!;

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith("```")) {
        codeLines.push(lines[i]!);
        i++;
      }
      i++;
      blocks.push(
        createElement(
          "pre",
          {
            key: `block-${key++}`,
            style: {
              margin: "8px 0",
              padding: "10px 12px",
              borderRadius: 6,
              background: palette.codeBg,
              border: `1px solid ${palette.codeBorder}`,
              overflowX: "auto",
              fontSize: 12,
            },
          },
          createElement(
            "code",
            {
              style: {
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                color: palette.text,
                whiteSpace: "pre-wrap",
              },
            },
            codeLines.join("\n"),
          ),
        ),
      );
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1]!.length;
      const Tag = `h${level}` as "h1" | "h2" | "h3";
      const fontSize = level === 1 ? 18 : level === 2 ? 15 : 13;
      blocks.push(
        createElement(
          Tag,
          {
            key: `block-${key++}`,
            style: {
              margin: level === 1 ? "0 0 8px" : "12px 0 6px",
              fontSize,
              fontWeight: 700,
              color: palette.heading,
              lineHeight: 1.3,
            },
          },
          ...wrapInline(headingMatch[2]!, `h-${key}`),
        ),
      );
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i]!)) {
        const itemText = lines[i]!.replace(/^[-*]\s+/, "");
        items.push(
          createElement(
            "li",
            { key: `li-${key++}`, style: { marginBottom: 4 } },
            ...wrapInline(itemText, `li-${key}`),
          ),
        );
        i++;
      }
      blocks.push(
        createElement(
          "ul",
          {
            key: `block-${key++}`,
            style: {
              margin: "8px 0",
              paddingLeft: 20,
              color: palette.text,
            },
          },
          ...items,
        ),
      );
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() &&
      !lines[i]!.startsWith("#") &&
      !/^[-*]\s+/.test(lines[i]!) &&
      !lines[i]!.startsWith("```")
    ) {
      paragraphLines.push(lines[i]!);
      i++;
    }

    blocks.push(
      createElement(
        "p",
        {
          key: `block-${key++}`,
          style: {
            margin: "0 0 8px",
            lineHeight: 1.55,
            color: palette.text,
          },
        },
        ...wrapInline(paragraphLines.join(" "), `p-${key}`),
      ),
    );
  }

  return blocks;
}

export { inlineStyles as markdownSurfaceStyles };

import { Fragment, type CSSProperties, type ReactNode } from "react";

// Every figure on the site goes through <V>: it names the export file and the JSON Pointer the
// value came from, and keeps the raw value. tests/e2e/trace.spec.ts resolves each one against the
// built data and fails on any mismatch, and fails on any digit in <main> that is not inside a <V>
// (or an explicit <Static> for fixed facts such as a standard's version).
//
// `derive` covers counts the page computes from an array: "len", "len:key=value" or
// "len:key!=value" (values compared as text, so null is "null").
export function V({
  src,
  at,
  value,
  derive,
  children,
  title,
  className,
  wrap,
}: {
  src: string;
  at: string;
  value: string | number | boolean | null;
  derive?: string;
  children?: ReactNode;
  title?: string;
  className?: string;
  // Identifiers (repo, package, table names): may wrap only after . _ / - : (see breakable).
  wrap?: boolean;
}) {
  return (
    <data
      value={String(value)}
      data-src={`${src}#${at}`}
      data-derive={derive}
      title={title}
      className={className}
      style={wrap ? ({ "--seg": longestSegment(String(value)) } as CSSProperties) : undefined}
    >
      {children ?? (wrap ? breakable(String(value)) : String(value))}
    </data>
  );
}

// Text with digits that is not an export value (a standard, a law, a fixed date in the method).
export function Static({ why, children }: { why: string; children: ReactNode }) {
  return <span data-static={why}>{children}</span>;
}

// JSON Pointer escaping for keys that contain "/" or "~".
export const ptr = (...parts: (string | number)[]) =>
  "/" + parts.map((p) => String(p).replace(/~/g, "~0").replace(/\//g, "~1")).join("/");

// Words never break inside (globals.css). An identifier such as staging.stg_registry__packages may
// wrap only after its separators: a <wbr> follows each run of . _ / - : characters.
const BREAK = /(?<=[._/:-])(?![._/:-])/;

// Advance widths (em) of Syne 800 uppercase with the title's letter-spacing, measured in the
// browser on 2026-11-09; anything unlisted counts as the widest letter.
const EM: Record<string, number> = {
  A: 1.175, B: 1.155, C: 1.331, D: 1.317, E: 1.155, F: 1.143, G: 1.355, H: 1.295, I: 0.435,
  J: 1.019, K: 1.221, L: 0.958, M: 1.595, N: 1.315, O: 1.345, P: 1.192, Q: 1.345, R: 1.247,
  S: 1.071, T: 1.115, U: 1.304, V: 1.175, W: 1.897, X: 1.155, Y: 1.085, Z: 1.215,
  "0": 1.081, "1": 0.544, "2": 1.018, "3": 1.07, "4": 1.109, "5": 1.03, "6": 1.148, "7": 1.149,
  "8": 1.096, "9": 1.173, "-": 0.605, ".": 0.369, "/": 0.495, ":": 0.369, "@": 1.513, _: 0.995,
};

// Width in em of the longest run that may not wrap; an identifier heading scales its font down
// so that run fits the line instead of breaking inside a word (globals.css, h1.title).
export function longestSegment(text: string): number {
  const em = (p: string) => [...p.toUpperCase()].reduce((sum, c) => sum + (EM[c] ?? 1.9), 0);
  return Math.round(Math.max(...text.split(BREAK).map(em)) * 100) / 100;
}

export function breakable(text: string): ReactNode {
  const parts = text.split(BREAK);
  return parts.length < 2 ? text : parts.map((p, i) => <Fragment key={i}>{i ? <wbr /> : null}{p}</Fragment>);
}

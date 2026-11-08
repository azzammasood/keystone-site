import { Fragment, type ReactNode } from "react";

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
export function breakable(text: string): ReactNode {
  const parts = text.split(/(?<=[._/:-])(?![._/:-])/);
  return parts.length < 2 ? text : parts.map((p, i) => <Fragment key={i}>{i ? <wbr /> : null}{p}</Fragment>);
}

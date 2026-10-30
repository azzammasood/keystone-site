import type { ReactNode } from "react";

// Every figure on the site goes through <V>: it names the export file and the JSON Pointer the
// value came from, and keeps the raw value. tests/e2e/trace.spec.ts resolves each one against the
// built data and fails on any mismatch, and fails on any digit in <main> that is not inside a <V>
// (or an explicit <Static> for fixed facts such as a standard's version).
//
// `derive` covers counts the page computes from an array: "len" or "len:key=value".
export function V({
  src,
  at,
  value,
  derive,
  children,
  title,
  className,
}: {
  src: string;
  at: string;
  value: string | number | boolean | null;
  derive?: string;
  children?: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <data
      value={String(value)}
      data-src={`${src}#${at}`}
      data-derive={derive}
      title={title}
      className={className}
    >
      {children ?? String(value)}
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

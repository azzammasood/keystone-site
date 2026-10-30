import { readFileSync } from "node:fs";
import { join } from "node:path";

const DATA = process.env.KEYSTONE_DATA_DIR ?? join("data", "site");
const cache = new Map<string, unknown>();

function file(name: string): unknown {
  if (!cache.has(name)) cache.set(name, JSON.parse(readFileSync(join(DATA, name), "utf8")));
  return cache.get(name);
}

// RFC 6901 JSON Pointer.
export function pointer(doc: unknown, ptr: string): unknown {
  if (ptr === "") return doc;
  let cur: unknown = doc;
  for (const raw of ptr.slice(1).split("/")) {
    const key = raw.replace(/~1/g, "/").replace(/~0/g, "~");
    if (cur === null || typeof cur !== "object" || !(key in (cur as object))) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

// The counts a page may derive from an array (see components/V.tsx): "len", "len:key=value".
export function derive(v: unknown, how: string | null): unknown {
  if (!how) return v;
  if (how === "index") return undefined; // a row number; checked separately
  if (!Array.isArray(v)) throw new Error(`derive ${how} on a non-array`);
  if (how === "len") return v.length;
  const m = /^len:([^=]+)=(.*)$/.exec(how);
  if (!m) throw new Error(`unknown derive ${how}`);
  const [, key, want] = m;
  return v.filter((x) => String((x as Record<string, unknown>)[key!]) === want).length;
}

export const asText = (v: unknown) => (v !== null && typeof v === "object" ? JSON.stringify(v) : String(v));

export function resolve(src: string): { value: unknown; found: boolean; array?: unknown[] } {
  const hash = src.indexOf("#");
  const v = pointer(file(src.slice(0, hash)), src.slice(hash + 1));
  return { value: v, found: v !== undefined };
}

export type Traced = { src: string; value: string | null; derive: string | null };

// Every traced value against its export; returns what does not match. Shared by both traces.
export function mismatches(traced: Traced[]): string[] {
  const wrong: string[] = [];
  for (const t of traced) {
    const r = resolve(t.src);
    if (!r.found) {
      wrong.push(`${t.src}: not in the export`);
      continue;
    }
    if (t.derive === "index") {
      if (!/^[1-9]\d*$/.test(t.value ?? "")) wrong.push(`${t.src}: bad row number ${t.value}`);
      continue;
    }
    const want = asText(derive(r.value, t.derive));
    if (want !== t.value) wrong.push(`${t.src}${t.derive ? ` (${t.derive})` : ""}: page ${t.value}, export ${want}`);
  }
  return wrong;
}

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Every exported page, found from out/ so a new page is tested without editing this list.
export function pages(dir = "out", prefix = ""): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory() || name.startsWith("_") || name === "404") continue;
    if (readdirSync(p).includes("index.html") && !isNotFound(join(p, "index.html"))) found.push(`${prefix}${name}/`);
    found.push(...pages(p, `${prefix}${name}/`));
  }
  return prefix ? found : ["", ...found];
}

// The browser checks run on every page type: all pages, except that a directory with more than
// `per` pages (one template, such as project/) is cut to `per` evenly spaced ones, first and last
// included. Every page is still traced from its HTML (html-trace.spec.ts).
export function sample(per = 25, all = pages()): string[] {
  const groups = new Map<string, string[]>();
  for (const p of all) {
    const parent = p.replace(/[^/]+\/$/, "");
    groups.set(parent, [...(groups.get(parent) ?? []), p]);
  }
  const keep = new Set<string>();
  for (const [parent, ps] of groups) {
    const step = parent && ps.length > per ? (ps.length - 1) / (per - 1) : 1;
    for (let i = 0; i < ps.length; i += step) keep.add(ps[Math.round(i)]!);
    keep.add(ps[ps.length - 1]!);
  }
  return all.filter((p) => keep.has(p));
}

// The placeholder project page (built when there are no project rows) renders as not found.
const isNotFound = (file: string) => readFileSync(file, "utf8").includes('name="robots" content="noindex"');

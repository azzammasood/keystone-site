import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type DefaultTreeAdapterTypes as T, parse } from "parse5";
import { pages } from "./pages";
import { type Traced, mismatches } from "./resolve";

// The trace on every built page, read from its static HTML (no browser): the same checks as
// trace.spec.ts, so a site with thousands of project pages is still checked in full.
type Node = T.ChildNode | T.Document;

const attr = (n: Node, name: string) => ("attrs" in n ? n.attrs.find((a) => a.name === name)?.value : undefined);
const kids = (n: Node): T.ChildNode[] => ("childNodes" in n ? n.childNodes : []);

function find(n: Node, tag: string): Node | undefined {
  if (n.nodeName === tag) return n;
  for (const c of kids(n)) {
    const hit = find(c, tag);
    if (hit) return hit;
  }
  return undefined;
}

// Traced values, and text with digits outside any traced value or <Static>.
function scan(n: Node, traced: Traced[], loose: string[], tag = "main") {
  for (const c of kids(n)) {
    if (c.nodeName === "#text") {
      const text = (c as T.TextNode).value;
      if (/\d/.test(text)) loose.push(`<${tag}> "${text.trim().slice(0, 80)}"`);
      continue;
    }
    if (c.nodeName === "script" || c.nodeName === "style" || attr(c, "data-static") !== undefined) continue;
    const src = attr(c, "data-src");
    if (src !== undefined) {
      traced.push({ src, value: attr(c, "value") ?? null, derive: attr(c, "data-derive") ?? null });
      continue;
    }
    scan(c, traced, loose, c.nodeName);
  }
}

test("every figure on every built page is traced to an export (HTML)", () => {
  test.setTimeout(15 * 60_000);
  const all = pages();
  const failed: string[] = [];
  for (const path of all) {
    const main = find(parse(readFileSync(join("out", path, "index.html"), "utf8")), "main");
    if (!main) {
      failed.push(`/${path}: no <main>`);
      continue;
    }
    const traced: Traced[] = [];
    const loose: string[] = [];
    scan(main, traced, loose);
    const wrong = [...mismatches(traced), ...loose.map((l) => `untraced digits: ${l}`)];
    if (wrong.length) failed.push(`/${path}:\n  ${wrong.slice(0, 5).join("\n  ")}`);
  }
  expect(failed.slice(0, 20), `${failed.length} of ${all.length} pages:\n${failed.slice(0, 20).join("\n")}`).toEqual([]);
  expect(all.length).toBeGreaterThan(1);
});

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

// The placeholder project page (built when there are no project rows) renders as not found.
const isNotFound = (file: string) => readFileSync(file, "utf8").includes('name="robots" content="noindex"');

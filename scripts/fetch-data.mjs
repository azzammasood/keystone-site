// Fetch the pipeline's site exports (release `site-data` of keystone-pipeline) into data/site/.
// Every file is checked against index.json (size, sha256) and its JSON Schema. A file that fails
// is left out and recorded in data/site/_fetch.json with the reason; the site then shows that
// dataset as unavailable instead of rendering it. Nothing is ever filled in.
//
//   node scripts/fetch-data.mjs                      # from the release (polite: sequential, UA)
//   node scripts/fetch-data.mjs --from DIR [--strict] # from a local export folder (fixtures, dev)
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { checkEntry, makeValidator } from "./exports.mjs";

const REPO = "azzammasood/keystone-pipeline";
const RELEASE = `https://github.com/${REPO}/releases/download/site-data/`;
const UA = "keystone-site (+https://github.com/azzammasood/keystone-site)";
const OUT = "data/site";

const args = process.argv.slice(2);
const from = args.includes("--from") ? args[args.indexOf("--from") + 1] : null;
const strict = args.includes("--strict");
const validate = makeValidator("schemas");

async function get(name) {
  if (from) {
    try {
      return readFileSync(join(from, name));
    } catch {
      return null;
    }
  }
  const res = await fetch(RELEASE + name, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const report = { source: from ?? RELEASE, fetched_at: new Date().toISOString(), files: {} };
// Exit by exitCode, not process.exit(): exiting while fetch's sockets close trips a libuv assert on Windows.
const done = (code) => {
  writeFileSync(join(OUT, "_fetch.json"), JSON.stringify(report, null, 2));
  process.exitCode = code;
};

const indexBuf = await get("index.json");
if (!indexBuf) {
  report.error = from ? `no index.json in ${from}` : "release site-data has not been published yet";
  console.warn(`fetch-data: ${report.error}; every page will show pending data`);
  done(strict ? 1 : 0);
} else await main(indexBuf);

async function main(indexBuf) {
  const index = JSON.parse(indexBuf.toString("utf8"));
  const indexErr = validate("index_row.schema.json", index);
  if (indexErr) {
    report.error = `index.json rejected: ${indexErr}`;
    console.error(`fetch-data: ${report.error}`);
    return done(1);
  }
  writeFileSync(join(OUT, "index.json"), indexBuf);
  report.index_generated_at = index.generated_at;

  let rejected = 0;
  for (const entry of index.rows) {
    const buf = await get(from ? entry.path : entry.asset);
    const reason = buf ? checkEntry(entry, buf, validate) : "listed in index.json but missing";
    report.files[entry.path] = reason ? { ok: false, reason } : { ok: true, sha256: entry.sha256 };
    if (reason) {
      rejected++;
      console.warn(`fetch-data: ${entry.path} rejected: ${reason}`);
      continue;
    }
    mkdirSync(dirname(join(OUT, entry.path)), { recursive: true });
    writeFileSync(join(OUT, entry.path), buf);
  }
  console.log(`fetch-data: ${index.rows.length - rejected} of ${index.rows.length} exports accepted`);
  done(strict && rejected ? 1 : 0);
}

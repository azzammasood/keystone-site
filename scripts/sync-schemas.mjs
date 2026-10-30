// Keep schemas/ equal to keystone-pipeline's contracts/*.schema.json on main.
//   --check   exit 1 if any differ (CI surfaces a contract change instead of silently drifting)
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const RAW = "https://raw.githubusercontent.com/azzammasood/keystone-pipeline/main/contracts/";
const UA = "keystone-site (+https://github.com/azzammasood/keystone-site)";
const check = process.argv.includes("--check");
let differ = 0;
for (const f of readdirSync("schemas").filter((n) => n.endsWith(".schema.json"))) {
  const res = await fetch(RAW + f, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${f}: HTTP ${res.status}`);
  const upstream = await res.text();
  if (upstream === readFileSync(`schemas/${f}`, "utf8")) continue;
  differ++;
  console.log(`${f}: differs from keystone-pipeline main`);
  if (!check) writeFileSync(`schemas/${f}`, upstream);
}
console.log(differ ? `${differ} schema(s) ${check ? "differ" : "updated"}` : "schemas match keystone-pipeline main");
process.exit(check && differ ? 1 : 0);

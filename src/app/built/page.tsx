import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/Page";
import { Unavailable } from "@/components/Status";
import { V } from "@/components/V";
import * as data from "@/lib/data";
import { day } from "@/lib/format";

export const metadata: Metadata = { title: "How it's built" };
const F = "pipeline_metrics.json";

// Only tools with evidence of running appear here: the pipeline's own engines[] list.
export default function Built() {
  const m = data.metrics();
  return (
    <Page
      eyebrow="how it's built"
      title="The machine"
      lede="An open-source pipeline on free tiers only. Each tool below is listed because the pipeline recorded it doing real work."
    >
      <div className="prose">
        <p>
          GitHub Actions runs the pipeline on a schedule. It fetches the archive politely, parses each
          hour into Parquet with its source and hash, checks it against data contracts, rolls it up
          with the same SQL on every engine, and builds the warehouse with dbt. The results are
          published as small JSON exports, and this site is rebuilt from them.
        </p>
      </div>
      {m.ok ? (
        <div className="cards">
          {m.data.engines.map((e, i) => (
            <div className="card" key={e.name}>
              <h3><V src={F} at={`/engines/${i}/name`} value={e.name} /></h3>
              <p style={{ margin: 0 }}><V src={F} at={`/engines/${i}/role`} value={e.role} /></p>
              <p className="sub" style={{ marginTop: 8 }}>
                <V src={F} at={`/engines/${i}/version`} value={e.version}>{e.version ?? "version not recorded"}</V> · last used{" "}
                <V src={F} at={`/engines/${i}/last_used`} value={e.last_used}>{day(e.last_used)}</V>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <Unavailable r={m} />
      )}
      <div className="prose">
        <h3>This site</h3>
        <p>
          A static Next.js site with TypeScript and Tailwind, built by GitHub Actions and served by
          GitHub Pages. It renders only the pipeline&apos;s exports, after checking each one against its
          JSON Schema. Every figure carries the file and field it came from, and a test fails the
          build if any figure on any page does not match its export. Accessibility checks run in light
          and dark mode on every page.
        </p>
        <p>
          See <Link href="/pipeline/">Pipeline Live</Link> for the last run and{" "}
          <Link href="/scale/">Scale</Link> for measured engine runs.
        </p>
      </div>
    </Page>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/Page";
import { Unavailable } from "@/components/Status";
import { V } from "@/components/V";
import * as data from "@/lib/data";

export const metadata: Metadata = { title: "About the data and method" };
const F = "radar.json";

export default function About() {
  const r = data.radar();
  return (
    <Page
      eyebrow="about"
      title="The data and the method"
      lede="What Keystone reads, what it publishes, and what its scores do and do not mean."
    >
      <div className="prose">
        <h3>What it reads</h3>
        {r.ok ? (
          <ul>
            {r.data.sources.map((s, i) => (
              <li key={s.name}>
                <a href={s.url} rel="noopener">
                  <V src={F} at={`/sources/${i}/name`} value={s.name} />
                </a>
                {s.terms ? (
                  <>
                    {" "}· <V src={F} at={`/sources/${i}/terms`} value={s.terms} />
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <Unavailable r={r} />
        )}
        <p>
          GH Archive records the public GitHub event stream, one file per hour. ecosyste.ms maps
          packages to the repositories that build them and counts their dependents. OSV lists known
          vulnerabilities and the package versions they affect. Raw files are verified, parsed and
          deleted; they are never republished.
        </p>

        <h3>What it publishes</h3>
        <p>
          Repository and package level only. Keystone never publishes, ranks or labels people. Account
          identifiers are replaced by salted keys inside the pipeline and never leave it; activity by
          people appears only as aggregate shares, and bot accounts are filtered out.
          {r.ok ? (
            <>
              {" "}This export&apos;s privacy level:{" "}
              <V src={F} at="/privacy/level" value={r.data.privacy.level} />.
            </>
          ) : null}
        </p>

        <h3>What a score means</h3>
        <p>
          <b>Criticality</b> is how much of the ecosystem depends on a project. <b>Fragility</b> is
          signals that its maintenance could be thin, such as few active maintainers or slowing
          reviews. <b>Risk</b> combines the two. Each is a signal to look closer, never a prediction
          that a project will fail or be abandoned. Coverage says how many of the signals had data; a
          score with low coverage says little.
        </p>

        <h3>Honest gaps</h3>
        <p>
          GitHub&apos;s event payloads changed shape over the years. A metric uses only fields that
          exist across the whole period it covers; where the format breaks, the metric gets a new
          version instead of mixing the two. Backtests use only data from before each incident. When
          an export covers too little history, the site says <i>partial data</i> or{" "}
          <i>pending data</i> and shows nothing in its place.
        </p>
        <p>
          Every figure on this site links back to the export it came from; see{" "}
          <Link href="/lineage/">Lineage</Link> and the <Link href="/catalog/">Catalog</Link> for how
          each one was made.
        </p>
      </div>
    </Page>
  );
}

import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { Source, Status, Unavailable } from "@/components/Status";
import { V } from "@/components/V";
import * as data from "@/lib/data";

export const metadata: Metadata = { title: "Weekly briefs" };
const F = "brief.json";

export default function Briefs() {
  const r = data.briefs();
  return (
    <Page
      eyebrow="weekly briefs"
      title="The week in signals"
      lede="A short summary written by a language model from the week's exports. Every number in it is checked against those exports before it is published; a brief that fails the check is not shown."
    >
      {r.ok ? (
        <>
          <Status file={F} env={r.data} />
          {[...r.data.rows.entries()].reverse().map(([i, b]) => (
            <article key={b.week} className="card" style={{ marginTop: 22 }}>
              <h3><V src={F} at={`/rows/${i}/week`} value={b.week} /></h3>
              {b.text && (b.outcome === "written" || b.outcome === "cached") ? (
                <p className="prose"><V src={F} at={`/rows/${i}/text`} value={b.text} /></p>
              ) : (
                <p>
                  No brief this week: <V src={F} at={`/rows/${i}/outcome`} value={b.outcome} /> (
                  <V src={F} at={`/rows/${i}/detail`} value={b.detail} />).
                </p>
              )}
              <p className="sub">
                Model <V src={F} at={`/rows/${i}/model`} value={b.model}>{b.model ?? "none"}</V> ·{" "}
                <V src={F} at={`/rows/${i}/detail`} value={b.detail} />
              </p>
            </article>
          ))}
          <Source file={F} env={r.data} />
        </>
      ) : (
        <Unavailable r={r} />
      )}
    </Page>
  );
}

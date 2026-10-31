import Link from "next/link";
import { Fragment } from "react";
import { RadarSkeleton, RadarTable } from "@/components/RadarTable";
import { Status, Unavailable } from "@/components/Status";
import { V } from "@/components/V";
import { Sea, type Bed } from "@/components/home/Sea";
import { Gauges } from "@/components/Gauges";
import * as data from "@/lib/data";
import { utc } from "@/lib/format";

const LAYERS = ["sources", "silver", "stream", "rollup", "warehouse", "published"];
const words = (s: string) =>
  s.split(" ").map((w, i) => (
    <Fragment key={i}>
      {i ? " " : null}
      <span className="w">{w}</span>
    </Fragment>
  ));

export default function Home() {
  const radar = data.radar();
  const brief = data.briefs();
  const m = data.metrics();
  const lin = data.lineage();
  const bed: Bed = lin.ok
    ? LAYERS.map((l) => [l, lin.data.datasets.filter((d) => d.layer === l).map((d) => [d.title, d.fields.length])] as Bed[number]).filter(
        ([, ds]) => ds.length > 0,
      )
    : [];
  const latest = brief.ok ? brief.data.rows.at(-1) : undefined;

  return (
    <>
      <Sea bed={bed} hours={m.ok ? m.data.totals.date_range.source_hours : 0} />

      <section className="dive" id="surface">
        <h1 className="big">
          {words("Find the")}
          <br />
          <span className="solid">{words("keystones")}</span>
          <br />
          {words("under strain")}
        </h1>
        <p className="tag later">
          A keystone holds an arch together. In open source, it is the project thousands of packages
          quietly depend on. Keystone reads GitHub&apos;s public event archive (GH Archive), links repositories to their
          packages and known vulnerabilities, and shows where those projects show signs of strain.
          Signals, never predictions.
        </p>
        {radar.ok && radar.data.status && radar.data.status.state !== "ok" ? (
          <p className="later" style={{ marginTop: 20 }}>
            <span className="chip">
              <V src="radar.json" at="/status/state" value={radar.data.status.state} />
            </span>
          </p>
        ) : null}
        <div className="cue later" aria-hidden="true">
          dive<i />
        </div>
      </section>

      <section className="dive" id="radar">
        <p className="eyebrow reveal">radar</p>
        <h2 className="reveal">What the scan found</h2>
        {radar.ok ? (
          <>
            <div className="hero-num reveal">
              <b>
                <V src="radar.json" at="/rows" derive="len:risk!=null" value={radar.data.rows.filter((r) => r.risk !== null).length} />
              </b>
              <span>
                {radar.data.row_count === 0 ? (
                  "repositories scored so far. Scoring starts once enough history has loaded."
                ) : (
                  <>
                    scored of <V src="radar.json" at="/row_count" value={radar.data.row_count} /> mapped
                    repositories, ranked by signs of strain. The rest have too little data to rank.
                  </>
                )}
              </span>
            </div>
            <div className="reveal">
              <Status file="radar.json" env={radar.data} />
              {radar.data.row_count === 0 ? <RadarSkeleton /> : <RadarTable env={radar.data} limit={5} />}
              <p className="sub" style={{ marginTop: 14 }}>
                <Link href="/radar/">Open the full radar</Link>
              </p>
            </div>
          </>
        ) : (
          <Unavailable r={radar} />
        )}
        {latest && latest.text && brief.ok ? (
          <details className="reveal">
            <summary>
              weekly brief · <V src="brief.json" at={`/rows/${brief.data.rows.length - 1}/week`} value={latest.week} />
            </summary>
            <p>
              <V src="brief.json" at={`/rows/${brief.data.rows.length - 1}/text`} value={latest.text} />
            </p>
            <p className="sub">
              Written by <V src="brief.json" at={`/rows/${brief.data.rows.length - 1}/model`} value={latest.model} />;{" "}
              <V src="brief.json" at={`/rows/${brief.data.rows.length - 1}/detail`} value={latest.detail} />.{" "}
              <Link href="/briefs/">All briefs</Link>
            </p>
          </details>
        ) : null}
      </section>

      <section className="dive" id="pipeline">
        <p className="eyebrow reveal">pipeline live</p>
        <h2 className="reveal">What the daily ingest has read</h2>
        {m.ok ? (
          <>
            <div className="reveal">
              <Gauges m={m.data} />
            </div>
            <p className="sub reveal" style={{ marginTop: 18 }}>
              updated{" "}
              <V src="pipeline_metrics.json" at="/generated_at" value={m.data.generated_at}>
                {utc(m.data.generated_at)}
              </V>{" "}
              · <Link href="/pipeline/">Pipeline Live</Link>
            </p>
          </>
        ) : (
          <Unavailable r={m} />
        )}
      </section>
    </>
  );
}

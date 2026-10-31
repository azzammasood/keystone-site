import type { Metadata } from "next";
import { Gauges, Lifetime } from "@/components/Gauges";
import { Page } from "@/components/Page";
import { RunChart } from "@/components/RunChart";
import { SourceAt, Unavailable } from "@/components/Status";
import { V } from "@/components/V";
import * as data from "@/lib/data";
import { day, full, secs, utc } from "@/lib/format";

export const metadata: Metadata = { title: "Pipeline Live" };
const F = "pipeline_metrics.json";

// Dash period from the stage's measured rate: faster with more records per second, still at 0.
// Log scale so one busy stage does not make the others look still.
const period = (rps: number | null) => (rps && rps > 0 ? Math.max(0.15, 3 / Math.log10(10 + rps)) : null);

export default function Pipeline() {
  const r = data.metrics();
  if (!r.ok) {
    return (
      <Page eyebrow="pipeline live" title="Pipeline Live">
        <Unavailable r={r} />
      </Page>
    );
  }
  const m = r.data;
  const q = m.quality, pb = m.produced_by;
  return (
    <Page
      eyebrow="pipeline live"
      title="Pipeline Live"
      lede="What the pipeline read, how fresh it is, what it checked and what it cost: the history backfill's lifetime totals, then the daily ingest."
    >
      {m.lifetime ? (
        <>
          <h3>History backfill, all windows</h3>
          <Lifetime m={m} />
          <h3>Daily ingest</h3>
        </>
      ) : null}
      <Gauges m={m} />

      <h3>Last run</h3>
      <p className="sub">
        run <V src={F} at="/last_run/run_id" value={m.last_run.run_id} /> · profile{" "}
        <V src={F} at="/produced_by/profile" value={pb.profile} />
        {pb.fallback ? (
          <>
            {" "}
            (fallback: <V src={F} at="/produced_by/reason" value={pb.reason ?? ""} />)
          </>
        ) : null}
      </p>
      <div className="tbl">
        <table>
          <caption>Each line moves at the stage&apos;s measured records per second; a still line moved no records.</caption>
          <thead>
            <tr>
              <th scope="col">stage</th>
              <th scope="col">service</th>
              <th scope="col" className="n">records out</th>
              <th scope="col" className="n">records/s</th>
              <th scope="col" className="n">time</th>
              <th scope="col">status</th>
            </tr>
          </thead>
          <tbody>
            {m.last_run.stages.map((s, i) => {
              const p = period(s.records_per_second);
              const at = `/last_run/stages/${i}`;
              return (
                <tr key={`${s.name}-${i}`}>
                  <td>
                    <V src={F} at={`${at}/name`} value={s.name} />
                    <div className={`flow ${p ? "moving" : ""}`} style={p ? { ["--period" as string]: `${p}s` } : undefined} aria-hidden="true" />
                  </td>
                  <td>
                    <V src={F} at={`${at}/service`} value={s.service} /> <V src={F} at={`${at}/version`} value={s.version} />
                  </td>
                  <td className="n"><V src={F} at={`${at}/records_out`} value={s.records_out}>{full(s.records_out)}</V></td>
                  <td className="n"><V src={F} at={`${at}/records_per_second`} value={s.records_per_second}>{full(s.records_per_second)}</V></td>
                  <td className="n"><V src={F} at={`${at}/duration_seconds`} value={s.duration_seconds}>{secs(s.duration_seconds)}</V></td>
                  <td><V src={F} at={`${at}/status`} value={s.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3>Run history</h3>
      <RunChart runs={m.history.runs} />

      <h3>Events per day</h3>
      <div className="tbl">
        <table>
          <thead>
            <tr><th scope="col">day (UTC)</th><th scope="col" className="n">events processed</th></tr>
          </thead>
          <tbody>
            {m.history.daily_volume.map((d, i) => (
              <tr key={d.date}>
                <td><V src={F} at={`/history/daily_volume/${i}/date`} value={d.date} /></td>
                <td className="n"><V src={F} at={`/history/daily_volume/${i}/events_processed`} value={d.events_processed}>{full(d.events_processed)}</V></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Freshness and quality</h3>
      <ul className="prose">
        <li>
          Newest data hour{" "}
          <V src={F} at="/freshness/newest_data_hour" value={m.freshness.newest_data_hour}>{utc(m.freshness.newest_data_hour)}</V>; status{" "}
          <V src={F} at="/freshness/status" value={m.freshness.status} />.
        </li>
        <li>
          <V src={F} at="/quality/checks_passed" value={q.checks_passed}>{full(q.checks_passed)}</V> checks passed,{" "}
          <V src={F} at="/quality/dbt_tests_failed" value={q.dbt_tests_failed} /> dbt tests failed,{" "}
          <V src={F} at="/quality/quarantined_rows" value={q.quarantined_rows}>{full(q.quarantined_rows)}</V> rows quarantined,{" "}
          <V src={F} at="/quality/contract_violations" value={q.contract_violations} /> contract violations.
        </li>
        <li>
          Rollup rows <V src={F} at="/totals/rollup_rows" value={m.totals.rollup_rows}>{full(m.totals.rollup_rows)}</V>; backfill from{" "}
          <V src={F} at="/totals/backfill_window/start" value={m.totals.backfill_window.start}>{day(m.totals.backfill_window.start)}</V> to{" "}
          <V src={F} at="/totals/backfill_window/end" value={m.totals.backfill_window.end} /> (
          <V src={F} at="/totals/backfill_window/decision" value={m.totals.backfill_window.decision} />).
        </li>
      </ul>

      <h3>Cost and free quotas</h3>
      <p>
        <V src={F} at="/cost/usd" value={m.cost.usd}>${m.cost.usd.toFixed(2)}</V>:{" "}
        <V src={F} at="/cost/basis" value={m.cost.basis} />.
      </p>
      <div className="tbl">
        <table>
          <thead>
            <tr><th scope="col">quota</th><th scope="col" className="n">used</th></tr>
          </thead>
          <tbody>
            {m.cost.free_quota.map((f, i) => (
              <tr key={f.name}>
                <td><V src={F} at={`/cost/free_quota/${i}/name`} value={f.name} /></td>
                <td className="n">
                  <V src={F} at={`/cost/free_quota/${i}/used_pct`} value={f.used_pct}>
                    {f.used_pct == null ? "not measured" : `${f.used_pct}%`}
                  </V>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pb.probes?.length ? (
        <>
          <h3>Full-profile health</h3>
          <div className="pills">
            {pb.probes.map((p, i) => (
              <span key={p.name} className={p.ok ? "on" : "off"}>
                <V src={F} at={`/produced_by/probes/${i}/name`} value={p.name} />{" "}
                <V src={F} at={`/produced_by/probes/${i}/ok`} value={p.ok}>{p.ok ? "up" : "down"}</V>
              </span>
            ))}
          </div>
        </>
      ) : null}

      <h3>Services</h3>
      <div className="tbl">
        <table>
          <caption>Every service the pipeline has evidence of running; active ones ran in the last run.</caption>
          <thead>
            <tr>
              <th scope="col">service</th>
              <th scope="col">version</th>
              <th scope="col">role</th>
              <th scope="col">last run</th>
              <th scope="col">last used</th>
            </tr>
          </thead>
          <tbody>
            {m.engines.map((e, i) => (
              <tr key={e.name}>
                <td><V src={F} at={`/engines/${i}/name`} value={e.name} /></td>
                <td><V src={F} at={`/engines/${i}/version`} value={e.version}>{e.version ?? "not recorded"}</V></td>
                <td><V src={F} at={`/engines/${i}/role`} value={e.role} /></td>
                <td><V src={F} at={`/engines/${i}/active`} value={e.active}>{e.active ? "active" : "idle"}</V></td>
                <td><V src={F} at={`/engines/${i}/last_used`} value={e.last_used}>{day(e.last_used)}</V></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SourceAt file={F} at="/generated_at" iso={m.generated_at} />
    </Page>
  );
}

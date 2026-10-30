import type { PipelineMetrics } from "@/lib/types";
import { full, megabytes, short, year } from "@/lib/format";
import { V } from "./V";

const F = "pipeline_metrics.json";

export function Gauges({ m }: { m: PipelineMetrics }) {
  const t = m.totals, f = m.freshness, late = f.status === "breach";
  const active = m.engines.filter((e) => e.active);
  return (
    <>
      <div className="gauges">
        <div className="g">
          <div className="l">events read</div>
          <div className="v">
            <V src={F} at="/totals/events_processed" value={t.events_processed} title={full(t.events_processed)}>
              {short(t.events_processed)}
            </V>
          </div>
          <div className="s">
            <V src={F} at="/totals/events_stored" value={t.events_stored} title={full(t.events_stored)}>
              {short(t.events_stored)}
            </V>{" "}
            stored
          </div>
        </div>
        <div className="g">
          <div className="l">data parsed</div>
          <div className="v">
            <V src={F} at="/totals/bytes_parsed" value={t.bytes_parsed} title={`${full(t.bytes_parsed)} bytes`}>
              {megabytes(t.bytes_parsed)}
            </V>
            <small>MB</small>
          </div>
          <div className="s">
            <V src={F} at="/totals/files_parsed" value={t.files_parsed} /> files
          </div>
        </div>
        <div className={`g ${late ? "bad" : ""}`}>
          <div className="l">freshness</div>
          <div className="v">
            <V src={F} at="/freshness/lag_hours" value={f.lag_hours} title={`${f.lag_hours} hours`}>
              {Math.round(f.lag_hours)}
            </V>
            <small>h</small>
          </div>
          <div className="s">
            {late ? "late · " : ""}target <V src={F} at="/freshness/slo_hours" value={f.slo_hours} /> h
          </div>
          <div className="bar" aria-hidden="true">
            <i style={{ width: `${Math.min(100, (f.lag_hours / Math.max(f.lag_hours, f.slo_hours)) * 100)}%` }} />
            <em style={{ left: `${Math.min(100, (f.slo_hours / Math.max(f.lag_hours, f.slo_hours)) * 100)}%` }} />
          </div>
        </div>
        <div className="g">
          <div className="l">cost</div>
          <div className="v">
            <V src={F} at="/cost/usd" value={m.cost.usd}>
              ${m.cost.usd.toFixed(2)}
            </V>
          </div>
          <div className="s">free tiers only</div>
        </div>
      </div>
      <div className="line">
        <span>
          <b>
            <V src={F} at="/totals/date_range/first_event" value={t.date_range.first_event}>
              {year(t.date_range.first_event)}
            </V>{" "}
            →{" "}
            <V src={F} at="/totals/date_range/newest_event" value={t.date_range.newest_event}>
              {year(t.date_range.newest_event)}
            </V>
          </b>{" "}
          history
        </span>
        <span>
          <b>
            <V src={F} at="/totals/date_range/source_hours" value={t.date_range.source_hours}>
              {full(t.date_range.source_hours)}
            </V>
          </b>{" "}
          hours loaded
        </span>
        <span>
          <b>
            <V src={F} at="/quality/checks_passed" value={m.quality.checks_passed}>
              {full(m.quality.checks_passed)}
            </V>
          </b>{" "}
          checks passed
        </span>
      </div>
      <div className="pills" style={{ marginTop: 20 }}>
        <span style={{ color: "var(--mute)" }}>
          <V src={F} at="/engines" derive="len:active=true" value={active.length} /> of{" "}
          <V src={F} at="/engines" derive="len" value={m.engines.length} /> services ran last:
        </span>
        {m.engines.map((e, i) =>
          e.active ? (
            <span className="on" key={e.name}>
              <V src={F} at={`/engines/${i}/name`} value={e.name} />
            </span>
          ) : null,
        )}
      </div>
    </>
  );
}

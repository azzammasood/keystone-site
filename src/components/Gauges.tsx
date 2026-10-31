import type { PipelineMetrics } from "@/lib/types";
import { day, full, gigabytes, megabytes, short } from "@/lib/format";
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
              {day(t.date_range.first_event)}
            </V>{" "}
            →{" "}
            <V src={F} at="/totals/date_range/newest_event" value={t.date_range.newest_event}>
              {day(t.date_range.newest_event)}
            </V>
          </b>{" "}
          daily ingest
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

// Lifetime totals of the history backfill (ADR-084): the windows read once, separate from the
// daily ingest above. Range ends ("last") are exclusive, so they read "until".
export function Lifetime({ m }: { m: PipelineMetrics }) {
  const l = m.lifetime;
  if (!l) return null;
  return (
    <>
      <div className="gauges">
        <div className="g">
          <div className="l">events read</div>
          <div className="v">
            <V src={F} at="/lifetime/events" value={l.events} title={full(l.events)}>
              {short(l.events)}
            </V>
          </div>
          <div className="s">GH Archive, backfill</div>
        </div>
        <div className="g">
          <div className="l">downloaded</div>
          <div className="v">
            <V src={F} at="/lifetime/bytes_downloaded" value={l.bytes_downloaded} title={`${full(l.bytes_downloaded)} bytes`}>
              {gigabytes(l.bytes_downloaded)}
            </V>
            <small>GB</small>
          </div>
          <div className="s">
            <V src={F} at="/lifetime/complete_chunks" value={l.complete_chunks} /> of{" "}
            <V src={F} at="/lifetime/chunks" value={l.chunks} /> chunks complete
          </div>
        </div>
        <div className="g">
          <div className="l">days covered</div>
          <div className="v">
            <V src={F} at="/lifetime/days" value={l.days} title={full(l.days)}>
              {full(l.days)}
            </V>
          </div>
          <div className="s">
            in <V src={F} at="/lifetime/windows" derive="len" value={l.windows.length} /> windows
          </div>
        </div>
        <div className="g">
          <div className="l">hours missing</div>
          <div className="v">
            <V src={F} at="/lifetime/hours_missing_at_source" value={l.hours_missing_at_source} />
          </div>
          <div className="s">absent from GH Archive itself</div>
        </div>
      </div>
      <div className="line">
        {l.windows.map((w, i) => (
          <span key={w.name}>
            <b>
              <V src={F} at={`/lifetime/windows/${i}/name`} value={w.name} />
            </b>{" "}
            <V src={F} at={`/lifetime/windows/${i}/first`} value={w.first}>
              {day(w.first)}
            </V>{" "}
            until{" "}
            <V src={F} at={`/lifetime/windows/${i}/last`} value={w.last}>
              {day(w.last)}
            </V>{" "}
            ·{" "}
            <V src={F} at={`/lifetime/windows/${i}/events`} value={w.events} title={full(w.events)}>
              {short(w.events)}
            </V>{" "}
            events
          </span>
        ))}
      </div>
    </>
  );
}

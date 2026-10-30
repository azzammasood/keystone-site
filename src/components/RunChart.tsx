import type { Run } from "@/lib/types";
import { full, secs, utc } from "@/lib/format";
import { V } from "./V";

const F = "pipeline_metrics.json";

// One bar per run, height = wall time (log scale so short runs stay visible), status in the
// label and the pattern (not colour alone). The table below is the text alternative.
export function RunChart({ runs }: { runs: Run[] }) {
  const W = 760, H = 140, gap = 3;
  const max = Math.max(1, ...runs.map((r) => r.wall_seconds));
  const bw = runs.length ? Math.max(2, (W - gap * runs.length) / runs.length) : 0;
  const h = (s: number) => (Math.log10(1 + s) / Math.log10(1 + max)) * (H - 12);
  const failed = runs.filter((r) => r.status !== "ok").length;
  return (
    <figure style={{ margin: "14px 0 0", maxWidth: W }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" data-static="tooltips repeat the traced table below" role="img" aria-label={`Wall time of ${runs.length} runs; ${failed} failed. Data in the table below.`}>
        <defs>
          <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="2" height="5" fill="var(--warn)" />
          </pattern>
        </defs>
        <line x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} stroke="var(--line)" />
        {runs.map((r, i) => (
          <rect
            key={r.run_id}
            x={i * (bw + gap)}
            y={H - h(r.wall_seconds)}
            width={bw}
            height={Math.max(1, h(r.wall_seconds))}
            fill={r.status === "ok" ? "var(--accent)" : "url(#hatch)"}
            opacity={r.status === "ok" ? 0.75 : 1}
          >
            <title>{`${utc(r.started_at)} · ${secs(r.wall_seconds)} · ${r.status}`}</title>
          </rect>
        ))}
      </svg>
      <figcaption className="sub" style={{ marginTop: 6 }}>
        Wall time per run, oldest first, log scale. Solid: ok. Hatched: failed.
      </figcaption>
      <details>
        <summary>runs as a table</summary>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th scope="col">started</th>
                <th scope="col" className="n">wall time</th>
                <th scope="col" className="n">stages</th>
                <th scope="col" className="n">events</th>
                <th scope="col">status</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r, i) => {
                const at = `/history/runs/${i}`;
                return (
                  <tr key={r.run_id}>
                    <td><V src={F} at={`${at}/started_at`} value={r.started_at}>{utc(r.started_at)}</V></td>
                    <td className="n"><V src={F} at={`${at}/wall_seconds`} value={r.wall_seconds}>{secs(r.wall_seconds)}</V></td>
                    <td className="n"><V src={F} at={`${at}/stages`} value={r.stages} /></td>
                    <td className="n"><V src={F} at={`${at}/events_processed`} value={r.events_processed}>{full(r.events_processed)}</V></td>
                    <td><V src={F} at={`${at}/status`} value={r.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

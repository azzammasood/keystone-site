import Link from "next/link";
import { Fragment } from "react";
import type { Envelope, RadarRow } from "@/lib/types";
import { fixed, share } from "@/lib/format";
import { V, ptr } from "./V";

const F = "radar.json";

export function repoLabel(r: { repo_name: string | null; repo_id: number }, file: string, at: string) {
  return r.repo_name ? (
    <V src={file} at={`${at}/repo_name`} value={r.repo_name} />
  ) : (
    <>
      repository <V src={file} at={`${at}/repo_id`} value={r.repo_id} />
    </>
  );
}

// Rows in export order: `limit` rows from row `start` (0-based). Scored rows show the export's
// rank; unscored rows follow under their own heading with the export's unscored_reason.
export function RadarTable({ env, start = 0, limit }: { env: Envelope<RadarRow>; start?: number; limit?: number }) {
  const rows = env.rows.slice(start, limit ? start + limit : undefined);
  const firstUnscored = env.rows.findIndex((r) => !r.scored);
  return (
    <div className="tbl">
      <table>
        <caption>
          Ranked by risk, the product of fragility and criticality signals. Coverage is the share of
          signals that had data. Repositories with too little data are listed after the ranked ones,
          without a rank.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="n">#</th>
            <th scope="col">repository</th>
            <th scope="col">packages</th>
            <th scope="col" className="n">risk</th>
            <th scope="col" className="n">fragility</th>
            <th scope="col" className="n">criticality</th>
            <th scope="col" className="n">coverage</th>
            <th scope="col">top signals</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, k) => {
            const i = start + k;
            const at = ptr("rows", i);
            const scored = r.scored;
            return (
              <Fragment key={r.repo_id}>
              {i === firstUnscored ? (
                <tr>
                  <th scope="rowgroup" colSpan={8} className="group">
                    Not scored (
                    <V src={F} at="/rows" derive="len:scored=false" value={env.rows.filter((x) => !x.scored).length} />
                    ): too little data to rank
                  </th>
                </tr>
              ) : null}
              <tr>
                <td className="n">{r.rank !== null ? <V src={F} at={`${at}/rank`} value={r.rank} /> : "–"}</td>
                <td>
                  <Link href={`/project/${r.repo_id}/`}>{repoLabel(r, F, at)}</Link>
                </td>
                <td>
                  {r.packages.map((p, j) => (
                    <V key={p} src={F} at={`${at}/packages/${j}`} value={p}>
                      {j ? ", " : ""}
                      {p}
                    </V>
                  ))}
                </td>
                <td className="n"><V src={F} at={`${at}/risk`} value={r.risk}>{fixed(r.risk)}</V></td>
                <td className="n"><V src={F} at={`${at}/fragility`} value={r.fragility}>{fixed(r.fragility)}</V></td>
                <td className="n"><V src={F} at={`${at}/criticality`} value={r.criticality}>{fixed(r.criticality)}</V></td>
                <td className="n"><V src={F} at={`${at}/coverage`} value={r.coverage}>{share(r.coverage, 0)}</V></td>
                <td>
                  {!scored && r.unscored_reason ? (
                    <V src={F} at={`${at}/unscored_reason`} value={r.unscored_reason} className="sub" />
                  ) : r.top_signals
                    .filter((s) => s.available)
                    .map((s, j) => (
                      <V key={s.name} src={F} at={`${at}/top_signals/${r.top_signals.indexOf(s)}/name`} value={s.name} title={s.reason}>
                        {j ? " · " : ""}
                        {s.name}
                      </V>
                    ))}
                </td>
              </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// The empty radar: layout only, no invented rows.
export function RadarSkeleton() {
  return (
    <div className="ghost" role="img" aria-label="Radar table layout, empty until repositories are scored">
      <div className="hd">
        <span>#</span>
        <span>repository</span>
        <span>risk</span>
        <span>coverage</span>
      </div>
      {[70, 58, 46].map((w) => (
        <div key={w} aria-hidden="true">
          <span />
          <span className="sk" style={{ width: `${w}%` }} />
          <span className="sk" />
          <span className="sk" />
        </div>
      ))}
    </div>
  );
}

import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { Source, Status, Unavailable } from "@/components/Status";
import { V } from "@/components/V";
import * as data from "@/lib/data";
import { day, fixed, share } from "@/lib/format";

export const metadata: Metadata = { title: "Backtests" };
const F = "backtests.json";

export default function Backtests() {
  const r = data.backtests();
  return (
    <Page
      eyebrow="backtests"
      title="Would the signals have shown it?"
      lede="Past supply-chain incidents, scored with only the data that existed before each one. A check of the method, not a claim that any incident was foreseeable."
    >
      {r.ok ? (
        <>
          <Status file={F} env={r.data} />
          {r.data.rows.map((b, i) => (
            <article key={b.id} className="card" style={{ marginTop: 22 }}>
              <h3>
                <V src={F} at={`/rows/${i}/id`} value={b.id} />{" "}
                <span className="sub">
                  · <V src={F} at={`/rows/${i}/month`} value={b.month} />
                </span>
              </h3>
              <p>
                <V src={F} at={`/rows/${i}/summary`} value={b.summary} />
              </p>
              <p>
                outcome:{" "}
                <span className={`chip ${b.outcome === "ok" ? "ok" : ""}`}>
                  <V src={F} at={`/rows/${i}/outcome`} value={b.outcome} />
                </span>
              </p>
              {b.points.map((p, j) => {
                const at = `/rows/${i}/points/${j}`;
                return (
                  <div key={p.cut} style={{ marginTop: 14 }}>
                    <p className="sub">
                      cut <V src={F} at={`${at}/cut`} value={p.cut}>{day(p.cut)}</V> ·{" "}
                      <V src={F} at={`${at}/status`} value={p.status} /> · hour coverage{" "}
                      <V src={F} at={`${at}/hour_coverage`} value={p.hour_coverage}>{share(p.hour_coverage)}</V> · reference set{" "}
                      <V src={F} at={`${at}/reference_size`} value={p.reference_size} />
                      {p.leakage_check ? (
                        <>
                          {" "}· leakage check <V src={F} at={`${at}/leakage_check`} value={p.leakage_check} />
                        </>
                      ) : null}
                    </p>
                    {p.repos.length ? (
                      <div className="tbl">
                        <table>
                          <thead>
                            <tr>
                              <th scope="col">repository</th>
                              <th scope="col">status</th>
                              <th scope="col" className="n">fragility</th>
                              <th scope="col" className="n">percentile</th>
                              <th scope="col">flagged</th>
                            </tr>
                          </thead>
                          <tbody>
                            {p.repos.map((x, k) => (
                              <tr key={x.name}>
                                <td><V src={F} at={`${at}/repos/${k}/name`} value={x.name} /></td>
                                <td><V src={F} at={`${at}/repos/${k}/status`} value={x.status} /></td>
                                <td className="n"><V src={F} at={`${at}/repos/${k}/fragility`} value={x.fragility ?? null}>{fixed(x.fragility)}</V></td>
                                <td className="n"><V src={F} at={`${at}/repos/${k}/percentile`} value={x.percentile ?? null}>{fixed(x.percentile, 1)}</V></td>
                                <td>{x.flagged == null ? "not recorded" : <V src={F} at={`${at}/repos/${k}/flagged`} value={x.flagged}>{x.flagged ? "yes" : "no"}</V>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <p className="sub" style={{ marginTop: 14 }}>
                Sources:{" "}
                {b.sources.map((s, k) => (
                  <span key={s}>
                    {k ? " · " : ""}
                    <a href={s} rel="noopener">
                      <V src={F} at={`/rows/${i}/sources/${k}`} value={s}>{new URL(s).hostname}</V>
                    </a>
                  </span>
                ))}
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

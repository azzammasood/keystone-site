import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { Source, Status, Unavailable } from "@/components/Status";
import { V } from "@/components/V";
import * as data from "@/lib/data";
import { full } from "@/lib/format";

export const metadata: Metadata = { title: "Scale" };
const F = "benchmarks.json";

function runs(vals: number[] | null, at: string) {
  if (!vals) return "not recorded";
  return vals.map((v, i) => (
    <V key={i} src={F} at={`${at}/${i}`} value={v}>
      {i ? " / " : ""}
      {v}
    </V>
  ));
}

export default function Scale() {
  const r = data.benchmarks();
  return (
    <Page
      eyebrow="scale"
      title="The same rollup on three engines"
      lede="Measured runs of the one rollup, written once in portable SQL, on DuckDB, Spark and Flink at growing input sizes. Each run is listed; nothing is averaged away."
    >
      {r.ok ? (
        <>
          <Status file={F} env={r.data} />
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th scope="col">input</th>
                  <th scope="col">engine</th>
                  <th scope="col" className="n">input rows</th>
                  <th scope="col" className="n">input MB</th>
                  <th scope="col" className="n">wall s (each run)</th>
                  <th scope="col" className="n">engine s</th>
                  <th scope="col" className="n">peak MB</th>
                  <th scope="col" className="n">rows out</th>
                </tr>
              </thead>
              <tbody>
                {r.data.rows.map((b, i) => {
                  const at = `/rows/${i}`;
                  return (
                    <tr key={`${b.rung}-${b.engine}`}>
                      <td><V src={F} at={`${at}/rung`} value={b.rung} /></td>
                      <td><V src={F} at={`${at}/engine`} value={b.engine} /></td>
                      <td className="n"><V src={F} at={`${at}/input_rows`} value={b.input_rows}>{full(b.input_rows)}</V></td>
                      <td className="n"><V src={F} at={`${at}/input_mb`} value={b.input_mb} /></td>
                      <td className="n">{runs(b.wall_s, `${at}/wall_s`)}</td>
                      <td className="n">{runs(b.engine_s, `${at}/engine_s`)}</td>
                      <td className="n">{runs(b.peak_mb, `${at}/peak_mb`)}</td>
                      <td className="n"><V src={F} at={`${at}/rows_out`} value={b.rows_out}>{full(b.rows_out)}</V></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Source file={F} env={r.data} />
        </>
      ) : (
        <Unavailable r={r} />
      )}
    </Page>
  );
}

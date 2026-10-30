import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/Page";
import { SourceAt, Unavailable } from "@/components/Status";
import { V } from "@/components/V";
import * as data from "@/lib/data";
import { full } from "@/lib/format";

export const metadata: Metadata = { title: "Lineage" };
const F = "metadata/lineage.json";
const LAYERS = ["sources", "silver", "stream", "rollup", "warehouse", "published"];
const anchor = (id: string) => "d-" + id.replace(/[^a-zA-Z0-9]+/g, "-");

export default function LineagePage() {
  const r = data.lineage();
  if (!r.ok) {
    return (
      <Page eyebrow="lineage" title="Lineage">
        <Unavailable r={r} />
      </Page>
    );
  }
  const l = r.data;
  const byId = new Map(l.datasets.map((d) => [d.id, d]));
  return (
    <Page
      eyebrow="lineage"
      title="Where every number comes from"
      lede="Each dataset the pipeline reads or writes, by layer, collected with OpenLineage from the jobs that ran."
    >
      <div className="line" style={{ marginTop: 26 }}>
        <span><b><V src={F} at="/summary/datasets" value={l.summary.datasets} /></b> datasets</span>
        <span><b><V src={F} at="/summary/jobs" value={l.summary.jobs} /></b> jobs</span>
        <span><b><V src={F} at="/summary/edges" value={l.summary.edges} /></b> table edges</span>
        <span><b><V src={F} at="/summary/field_edges" value={l.summary.field_edges} /></b> column edges</span>
      </div>

      <div className="layers">
        {LAYERS.map((layer) => {
          const ds = l.datasets.filter((d) => d.layer === layer);
          return (
            <section key={layer} aria-labelledby={`layer-${layer}`}>
              <h3 id={`layer-${layer}`}>
                {layer}{" "}
                <span className="sub">
                  <V src={F} at="/datasets" derive={`len:layer=${layer}`} value={ds.length} />
                </span>
              </h3>
              <ol>
                {ds.map((d) => {
                  const i = l.datasets.indexOf(d);
                  return (
                    <li key={d.id} id={anchor(d.id)}>
                      {d.cataloged ? (
                        <Link href={`/catalog/#${anchor(d.id)}`}>
                          <V src={F} at={`/datasets/${i}/title`} value={d.title} />
                        </Link>
                      ) : (
                        <V src={F} at={`/datasets/${i}/title`} value={d.title} />
                      )}
                      <div className="sub">
                        <V src={F} at={`/datasets/${i}/fields`} derive="len" value={d.fields.length} /> columns
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      <h3>From an archive hour to a published metric</h3>
      <p className="sub">The path the lineage gate checks on every run: tables and the jobs between them.</p>
      <ol className="path">
        {l.gate_path.tables.map((id, i) => (
          <li key={`${id}-${i}`} className={id.startsWith("job:") ? "job" : ""}>
            <V src={F} at={`/gate_path/tables/${i}`} value={id}>
              {byId.get(id)?.title ?? id}
            </V>
          </li>
        ))}
      </ol>

      <h3>Collected by</h3>
      <div className="tbl">
        <table>
          <thead>
            <tr><th scope="col">tool</th><th scope="col" className="n">table edges</th><th scope="col" className="n">column edges</th></tr>
          </thead>
          <tbody>
            {Object.entries(l.tools).map(([name, t]) => {
              const at = "/tools/" + name.replace(/~/g, "~0").replace(/\//g, "~1");
              return (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="n"><V src={F} at={`${at}/table_edges`} value={t.table_edges ?? null}>{full(t.table_edges)}</V></td>
                  <td className="n">{t.column_edges == null ? "none" : <V src={F} at={`${at}/column_edges`} value={t.column_edges}>{full(t.column_edges)}</V>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <SourceAt file={F} at="/generated_at" iso={l.generated_at} />
    </Page>
  );
}

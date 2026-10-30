import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { SourceAt, Unavailable } from "@/components/Status";
import { V, ptr } from "@/components/V";
import * as data from "@/lib/data";

export const metadata: Metadata = { title: "Catalog" };
const F = "metadata/catalog.json";
const G = "metadata/glossary.json";
const LAYERS = ["sources", "silver", "stream", "rollup", "warehouse", "published"];
const anchor = (id: string) => "d-" + id.replace(/[^a-zA-Z0-9]+/g, "-");

export default function CatalogPage() {
  const r = data.catalog();
  const g = data.glossary();
  if (!r.ok) {
    return (
      <Page eyebrow="catalog" title="Catalog">
        <Unavailable r={r} />
      </Page>
    );
  }
  const c = r.data, k = c.completeness;
  const layers = [...LAYERS, ...new Set(c.datasets.map((d) => d.layer).filter((l) => !LAYERS.includes(l)))];
  return (
    <Page
      eyebrow="catalog"
      title="Every table, documented"
      lede="Each dataset with its owner, classification, contract and columns. Only public, repository- or package-level tables are ever published."
    >
      <div className="line" style={{ marginTop: 26 }}>
        <span><b><V src={F} at="/completeness/datasets_complete" value={k.datasets_complete} /></b> of <V src={F} at="/completeness/datasets" value={k.datasets} /> datasets complete</span>
        <span><b><V src={F} at="/completeness/columns_documented" value={k.columns_documented} /></b> of <V src={F} at="/completeness/columns" value={k.columns} /> columns documented</span>
        <span><b><V src={F} at="/completeness/documented_pct" value={k.documented_pct}>{k.documented_pct}%</V></b> documented</span>
      </div>

      <h3>Classifications</h3>
      <dl className="prose">
        {Object.entries(c.classifications).map(([name, text]) => (
          <div key={name}>
            <dt><b>{name}</b></dt>
            <dd style={{ margin: "2px 0 10px" }}><V src={F} at={ptr("classifications", name)} value={text} /></dd>
          </div>
        ))}
      </dl>

      {layers.map((layer) => {
        const ds = c.datasets.filter((d) => d.layer === layer);
        if (!ds.length) return null;
        return (
          <section key={layer} aria-labelledby={`cat-${layer}`}>
            <h3 id={`cat-${layer}`}>{layer}</h3>
            {ds.map((d) => {
              const i = c.datasets.indexOf(d);
              const at = `/datasets/${i}`;
              return (
                <details key={d.id} id={anchor(d.id)} style={{ marginTop: 10 }}>
                  <summary>
                    <V src={F} at={`${at}/title`} value={d.title} />
                  </summary>
                  <p><V src={F} at={`${at}/description`} value={d.description} /></p>
                  <p className="sub">
                    <V src={F} at={`${at}/classification`} value={d.classification} /> ·{" "}
                    <V src={F} at={`${at}/published`} value={d.published}>{d.published ? "published" : "not published"}</V>
                    {d.contract ? <> · contract <code><V src={F} at={`${at}/contract`} value={d.contract} /></code></> : null}
                    {d.freshness_sla_hours != null ? (
                      <> · fresh within <V src={F} at={`${at}/freshness_sla_hours`} value={d.freshness_sla_hours} /> h</>
                    ) : null}
                  </p>
                  {d.columns.length ? (
                    <div className="tbl">
                      <table>
                        <thead>
                          <tr><th scope="col">column</th><th scope="col">type</th><th scope="col">description</th></tr>
                        </thead>
                        <tbody>
                          {d.columns.map((col, j) => (
                            <tr key={col.name}>
                              <td><code><V src={F} at={`${at}/columns/${j}/name`} value={col.name} /></code></td>
                              <td><V src={F} at={`${at}/columns/${j}/type`} value={col.type} /></td>
                              <td><V src={F} at={`${at}/columns/${j}/description`} value={col.description} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </details>
              );
            })}
          </section>
        );
      })}

      {g.ok ? (
        <>
          <h3>Glossary</h3>
          <dl className="prose">
            {g.data.terms.map((t, i) => (
              <div key={t.term}>
                <dt>
                  <b><V src={G} at={`/terms/${i}/term`} value={t.term} /></b>{" "}
                  <span className="sub">(<V src={G} at={`/terms/${i}/status`} value={t.status} />)</span>
                </dt>
                <dd style={{ margin: "2px 0 12px" }}><V src={G} at={`/terms/${i}/definition`} value={t.definition} /></dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <Unavailable r={g} />
      )}
      <SourceAt file={F} at="/generated_at" iso={c.generated_at} />
    </Page>
  );
}

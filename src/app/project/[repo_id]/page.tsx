import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Page } from "@/components/Page";
import { repoLabel } from "@/components/RadarTable";
import { Source, Status } from "@/components/Status";
import { V, ptr } from "@/components/V";
import * as data from "@/lib/data";
import { fixed, share } from "@/lib/format";

const F = "project_pages.json";
export const dynamicParams = false;

// One static page per repository in project_pages.json. With no rows there are no pages, and
// the placeholder below is the only one built (it renders as not found).
export function generateStaticParams() {
  const p = data.projects();
  const ids = p.ok ? p.data.rows.map((r) => ({ repo_id: String(r.repo_id) })) : [];
  return ids.length ? ids : [{ repo_id: "none" }];
}

type Props = { params: Promise<{ repo_id: string }> };

let byId: Map<string, number> | undefined;
function find(id: string) {
  const p = data.projects();
  if (!p.ok) return null;
  byId ??= new Map(p.data.rows.map((r, i) => [String(r.repo_id), i]));
  const i = byId.get(id);
  return i === undefined ? null : { env: p.data, row: p.data.rows[i]!, i };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hit = find((await params).repo_id);
  return { title: hit?.row.repo_name ?? "Repository" };
}

export default async function Project({ params }: Props) {
  const hit = find((await params).repo_id);
  if (!hit) notFound();
  const { env, row, i } = hit;
  const at = ptr("rows", i);
  return (
    <Page eyebrow="repository" title={row.repo_name ? <V src={F} at={`${at}/repo_name`} value={row.repo_name} /> : "Repository"}>
      <Status file={F} env={env} />
      <p className="sub" style={{ marginTop: 14 }}>
        {repoLabel(row, F, at)} · packages:{" "}
        {row.packages.map((p, j) => (
          <V key={p} src={F} at={`${at}/packages/${j}`} value={p}>
            {j ? ", " : ""}
            {p}
          </V>
        ))}
      </p>
      <div className="gauges">
        {(["risk", "fragility", "criticality"] as const).map((k) => (
          <div className="g" key={k}>
            <div className="l">{k}</div>
            <div className="v">
              <V src={F} at={`${at}/${k}`} value={row[k]}>
                {fixed(row[k])}
              </V>
            </div>
          </div>
        ))}
        <div className="g">
          <div className="l">coverage</div>
          <div className="v">
            <V src={F} at={`${at}/coverage`} value={row.coverage}>
              {share(row.coverage, 0)}
            </V>
          </div>
          <div className="s">share of signals with data</div>
        </div>
      </div>
      {row.note ? (
        <p>
          <V src={F} at={`${at}/note`} value={row.note} />
        </p>
      ) : null}
      <h3>Signals</h3>
      {/* A table on desktop; below 640px each row stacks as a card (globals.css, table.stack).
          The explicit roles keep the table semantics when the CSS changes the display. */}
      <div className="tbl">
        <table className="stack" role="table">
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader" scope="col">signal</th>
              <th role="columnheader" scope="col">data</th>
              <th role="columnheader" scope="col" className="n">sub-score</th>
              <th role="columnheader" scope="col" className="n">weight</th>
              <th role="columnheader" scope="col">why</th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {row.components.map((c, j) => (
              <tr role="row" key={c.name}>
                <td role="cell" className="c-name"><V src={F} at={`${at}/components/${j}/name`} value={c.name} /></td>
                <td role="cell" className="c-data"><V src={F} at={`${at}/components/${j}/available`} value={c.available}>{c.available ? "available" : "not available"}</V></td>
                <td role="cell" className="n c-sub" data-label="sub"><V src={F} at={`${at}/components/${j}/sub`} value={c.sub}>{fixed(c.sub)}</V></td>
                <td role="cell" className="n c-weight" data-label="weight"><V src={F} at={`${at}/components/${j}/weight`} value={c.weight}>{fixed(c.weight)}</V></td>
                <td role="cell" className="c-why"><V src={F} at={`${at}/components/${j}/reason`} value={c.reason} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>Criticality inputs</h3>
      <dl>
        {Object.entries(row.criticality_inputs).map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 12 }}>
            <dt style={{ color: "var(--mute)" }}>{k}</dt>
            <dd style={{ margin: 0 }}>
              <V src={F} at={ptr("rows", i, "criticality_inputs", k)} value={typeof v === "object" ? JSON.stringify(v) : (v as string | number | boolean | null)} />
            </dd>
          </div>
        ))}
      </dl>
      <Source file={F} env={env} />
    </Page>
  );
}

// The pipeline from sources to this site, drawn with the theme's colours so it works in light and
// dark. Solid accent boxes run in production; dashed boxes are the showcase and cloud rungs.
import * as si from "simple-icons";
import { tint, type Icon } from "./tools";

type Kind = "src" | "prod" | "show";
const IC = 20; // logo size in the chip on each box's top edge
const W = 184, H = 54;

// Logos sit in a chip straddling the box's top edge, clear of the title and subtitle.
function Chip({ x, y, icons }: { x: number; y: number; icons: Icon[] }) {
  const w = icons.length * (IC + 4) + 8, cx = x + W - w - 8, cy = y - IC / 2 - 4;
  return (
    <g className="arch-chip">
      <rect x={cx} y={cy} width={w} height={IC + 8} rx={(IC + 8) / 2} />
      {icons.map((ic, i) => (
        <svg key={ic.title} x={cx + 6 + i * (IC + 4)} y={cy + 4} width={IC} height={IC} viewBox="0 0 24 24" aria-hidden="true">
          <title>{ic.title}</title>
          <path d={ic.path} className="arch-ic" style={{ ["--ic-dark" as string]: tint(ic, "dark"), ["--ic-light" as string]: tint(ic, "light") }} />
        </svg>
      ))}
    </g>
  );
}

function Box({ x, y, title, sub, kind, icons }: { x: number; y: number; title: string; sub?: string; kind: Kind; icons?: Icon[] }) {
  return (
    <g className={`arch-box ${kind}`}>
      <rect x={x} y={y} width={W} height={H} rx={6} />
      {icons?.length ? <Chip x={x} y={y} icons={icons} /> : null}
      <text x={x + 12} y={y + (sub ? 22 : 32)} className="t">
        {title}
      </text>
      {sub ? (
        <text x={x + 12} y={y + 40} className="s">
          {sub}
        </text>
      ) : null}
    </g>
  );
}

// An arrow from the right edge of one box to the left edge of another (or any two points).
function Arrow({ from, to, dashed }: { from: [number, number]; to: [number, number]; dashed?: boolean }) {
  const [x1, y1] = from, [x2, y2] = to, mx = (x1 + x2) / 2;
  return <path className={`arch-arrow${dashed ? " dashed" : ""}`} d={`M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2 - 4} ${y2}`} markerEnd="url(#arch-head)" />;
}

const r = (x: number, y: number): [number, number] => [x + W, y + H / 2];
const l = (x: number, y: number): [number, number] => [x, y + H / 2];

export function Architecture() {
  const C = [10, 210, 410, 610, 810];
  return (
    <figure className="arch" data-static="architecture diagram">
      <div className="arch-scroll">
        <svg viewBox="0 0 1004 400" role="img" aria-labelledby="arch-title arch-desc">
          <title id="arch-title">Keystone architecture</title>
          <desc id="arch-desc">
            GH Archive, OSV and ecosyste.ms feed the ingest on GitHub Actions, which writes typed Parquet.
            In production DuckDB rolls it up, dbt builds the warehouse, contracts and schemas check it,
            and the scores and exports are published to the site-data release that this site renders.
            The showcase replays the same data through Redpanda and Flink into Iceberg, read back by Spark
            and DuckDB; BigQuery and Databricks run the warehouse once at no cost. Lineage and telemetry
            run alongside.
          </desc>
          <defs>
            <marker id="arch-head" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" className="arch-headpath" />
            </marker>
          </defs>

          <text x={C[0]} y={18} className="lane">sources</text>
          <Box x={C[0]!} y={30} title="GH Archive" sub="hourly public events" kind="src" icons={[si.siGithub]} />
          <Box x={C[0]!} y={100} title="OSV" sub="known vulnerabilities" kind="src" />
          <Box x={C[0]!} y={170} title="ecosyste.ms" sub="packages to repositories" kind="src" />

          <text x={C[1]} y={18} className="lane">ingest</text>
          <Box x={C[1]!} y={100} title="GitHub Actions" sub="keystone CLI" kind="prod" icons={[si.siGithubactions, si.siPython]} />
          <Box x={C[1]!} y={170} title="Parquet (silver)" sub="era-aware parser" kind="prod" icons={[si.siApacheparquet]} />

          <text x={C[2]} y={18} className="lane">rollup</text>
          <Box x={C[2]!} y={30} title="DuckDB" sub="free rollup, daily" kind="prod" icons={[si.siDuckdb]} />
          <Box x={C[2]!} y={170} title="Redpanda, Flink" sub="stream replay" kind="show" icons={[si.siApacheflink]} />
          <Box x={C[2]!} y={240} title="Iceberg" sub="Lakekeeper, RustFS" kind="show" />

          <text x={C[3]} y={18} className="lane">warehouse</text>
          <Box x={C[3]!} y={30} title="dbt on DuckDB" sub="contracts, schemas" kind="prod" icons={[si.siDuckdb]} />
          <Box x={C[3]!} y={100} title="BigQuery, Databricks" sub="cloud rungs at no cost" kind="show" icons={[si.siGooglebigquery, si.siDatabricks]} />
          <Box x={C[3]!} y={240} title="Spark, DuckDB" sub="read the Iceberg tables" kind="show" icons={[si.siApachespark, si.siDuckdb]} />

          <text x={C[4]} y={18} className="lane">publish</text>
          <Box x={C[4]!} y={30} title="Score and exports" sub="signals, not predictions" kind="prod" />
          <Box x={C[4]!} y={100} title="site-data release" sub="schema-checked JSON" kind="prod" />
          <Box x={C[4]!} y={170} title="This site" sub="Next.js on GitHub Pages" kind="prod" icons={[si.siNextdotjs, si.siGithub]} />

          <Arrow from={r(C[0]!, 30)} to={l(C[1]!, 100)} />
          <Arrow from={r(C[0]!, 100)} to={l(C[1]!, 100)} />
          <Arrow from={r(C[0]!, 170)} to={l(C[1]!, 100)} />
          <path className="arch-arrow" d={`M${C[1]! + W / 2} ${154} L${C[1]! + W / 2} ${166}`} markerEnd="url(#arch-head)" />
          <Arrow from={r(C[1]!, 170)} to={l(C[2]!, 30)} />
          <Arrow from={r(C[1]!, 170)} to={l(C[2]!, 170)} dashed />
          <path className="arch-arrow dashed" d={`M${C[2]! + W / 2} ${224} L${C[2]! + W / 2} ${236}`} markerEnd="url(#arch-head)" />
          <Arrow from={r(C[2]!, 30)} to={l(C[3]!, 30)} />
          <Arrow from={r(C[2]!, 30)} to={l(C[3]!, 100)} dashed />
          <Arrow from={r(C[2]!, 240)} to={l(C[3]!, 240)} dashed />
          <Arrow from={r(C[3]!, 30)} to={l(C[4]!, 30)} />
          <path className="arch-arrow" d={`M${C[4]! + W / 2} ${84} L${C[4]! + W / 2} ${96}`} markerEnd="url(#arch-head)" />
          <path className="arch-arrow" d={`M${C[4]! + W / 2} ${154} L${C[4]! + W / 2} ${166}`} markerEnd="url(#arch-head)" />

          <g className="arch-band">
            <rect x={C[0]} y={322} width={984} height={62} rx={6} />
            <text x={C[0]! + 14} y={348} className="t">alongside every stage</text>
            <text x={C[0]! + 14} y={368} className="s">
              lineage: OpenLineage to Marquez and DataHub · telemetry: OpenTelemetry, Prometheus, Grafana · orchestration: GitHub Actions, Airflow
            </text>
          </g>
        </svg>
      </div>
      <figcaption className="sub">
        Solid boxes run in production every day; dashed boxes are the showcase and the cloud rungs.
      </figcaption>
    </figure>
  );
}

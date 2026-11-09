// The tech stack page lists a tool only if it ran, with evidence (the tool-credibility rule):
// `engine` names its entry in pipeline_metrics.json engines[] (version and last run are traced from
// it), and `evidence` restates what the pipeline README measured (keystone-pipeline, "Measured" and
// "Tools"). Showcase tools ran locally or once; production tools run on every scheduled job.
import * as si from "simple-icons";

export type Status = "production" | "showcase";
export type Icon = { title: string; hex: string; path: string };

// Simple Icons brand colours are kept only where they read as graphics (>= 3:1) on the card
// background of each theme; otherwise the logo takes the text colour.
const lum = (hex: string) => {
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const CARD = { dark: "04121d", light: "f5f7f6" };
export const tint = (icon: Icon, mode: keyof typeof CARD) => (contrast(icon.hex, CARD[mode]) >= 3 ? `#${icon.hex}` : "var(--fg)");

export type Tool = {
  name: string;
  status: Status;
  role: string;
  evidence: string;
  version?: string; // from the README when the tool has no engines[] entry
  engine?: string;
  icon?: Icon;
};

export const LAYERS: { name: string; tools: Tool[] }[] = [
  {
    name: "Ingest",
    tools: [
      { name: "keystone CLI (Python)", icon: si.siPython, engine: "keystone", status: "production", role: "One Typer CLI behind every job: fetch, parse, rollup, warehouse, score, export.", evidence: "Every scheduled job calls it; GitHub Actions holds no logic of its own." },
      { name: "uv", icon: si.siUv, status: "production", role: "Python 3.12 environment and lockfile.", evidence: "Dependencies locked by uv.lock and installed with uv sync in CI." },
      { name: "GH Archive fetch", engine: "gharchive-fetch", status: "production", role: "Polite hourly downloads with MD5 and SHA-256 checks.", evidence: "Backfill: 78 chunks, 1,873.2 GB downloaded, 37.88 job hours." },
      { name: "Apache Parquet", icon: si.siApacheparquet, engine: "keystone-parser", status: "production", role: "Typed silver tables from the era-aware parser.", evidence: "152 sample hours across every schema era: 2,363,426 events, 0 quarantined." },
    ],
  },
  {
    name: "Streaming",
    tools: [
      { name: "Redpanda", version: "v26.2.5", status: "showcase", role: "Kafka-compatible topic for the silver events, with a schema registry.", evidence: "Silver replay produced as Avro at 52k-57k records/s (189.8 MB for the day)." },
      { name: "Apache Flink", version: "2.2.1", icon: si.siApacheflink, status: "showcase", role: "The streaming rollup engine of the full profile.", evidence: "Stream and batch match the DuckDB rollup row for row on the one-day replay." },
    ],
  },
  {
    name: "Lakehouse",
    tools: [
      { name: "Apache Iceberg", status: "showcase", role: "Open table format for the rollup and the published marts.", evidence: "Flink writes the rollup; DuckDB publishes the marts, read back with identical results." },
      { name: "Lakekeeper", status: "showcase", role: "Iceberg REST catalog.", evidence: "Catalog the Flink job writes through; probed by keystone profile check." },
      { name: "RustFS", status: "showcase", role: "S3-compatible object store under the catalog.", evidence: "Object store under the Iceberg tables; probed by keystone profile check." },
      { name: "Apache Spark", version: "4.1.3", icon: si.siApachespark, status: "showcase", role: "Reads the Iceberg tables; benchmark engine.", evidence: "One-day rollup in 64.9 s (DuckDB 4.7 s, Flink 92.5 s)." },
    ],
  },
  {
    name: "Warehouse and modelling",
    tools: [
      { name: "DuckDB", icon: si.siDuckdb, engine: "duckdb", status: "production", role: "The free rollup engine and the dbt warehouse.", evidence: "One-day rollup in 2.7 s; runs every publish." },
      { name: "dbt", engine: "dbt", status: "production", role: "Staging, marts and metrics models, with tests and docs.", evidence: "Docs coverage of the warehouse 100% (gate 95%)." },
    ],
  },
  {
    name: "Quality and contracts",
    tools: [
      { name: "datacontract-cli", engine: "datacontract-cli", status: "production", role: "ODCS data contract tests.", evidence: "Runs on every publish: 25 generated and 3 hand-written ODCS contracts." },
      { name: "JSON Schema", status: "production", role: "One schema per export, versioned with it.", evidence: "Every export is validated before upload, and again by this site before it renders." },
    ],
  },
  {
    name: "Lineage and metadata",
    tools: [
      { name: "OpenLineage", status: "showcase", role: "Run events from dbt-ol, Flink and the Airflow provider.", evidence: "Lineage graph to the site exports: 121 nodes, 140 edges, 294 column edges." },
      { name: "Marquez", version: "0.51.1", status: "showcase", role: "OpenLineage server for browsing runs.", evidence: "Received dbt-ol, Flink and Spark events; gate path 13 of 13 nodes, 6 of 6 fields." },
      { name: "DataHub", version: "v1.7.0.1", status: "showcase", role: "Metadata catalog.", evidence: "Ingested dbt 451, Iceberg 261 and Kafka 6 events with 0 failures; 57 assertions." },
    ],
  },
  {
    name: "Observability",
    tools: [
      { name: "OpenTelemetry Collector", version: "0.163.1", icon: si.siOpentelemetry, status: "showcase", role: "Collects stage traces and metrics.", evidence: "Ran in the obs profile with Prometheus and Grafana (31 MB RAM measured)." },
      { name: "Prometheus", version: "3.15.0", icon: si.siPrometheus, status: "showcase", role: "Metrics store.", evidence: "Ran in the obs profile (42 MB RAM measured)." },
      { name: "Grafana", version: "13.2.4", icon: si.siGrafana, status: "showcase", role: "Pipeline dashboard.", evidence: "Ran in the obs profile (296 MB RAM measured)." },
    ],
  },
  {
    name: "Orchestration",
    tools: [
      { name: "GitHub Actions", icon: si.siGithubactions, status: "production", role: "Production scheduler: ingest every 6 hours, publish daily.", evidence: "First green publish 2026-10-30; the history backfill ran here too." },
      { name: "Apache Airflow", version: "3.3.2", icon: si.siApacheairflow, status: "showcase", role: "The same CLI as a DAG, for local runs.", evidence: "DAG calling the CLI: 6 of 6 tasks in 27.8 s, 13 OpenLineage events." },
      { name: "Docker Compose", icon: si.siDocker, status: "showcase", role: "The full profile's services, one compose profile per phase.", evidence: "Each profile ran locally, with RAM measured by docker stats." },
    ],
  },
  {
    name: "Cloud rungs",
    tools: [
      { name: "BigQuery sandbox", icon: si.siGooglebigquery, engine: "bigquery", status: "showcase", role: "In-place rollup, with maximumBytesBilled on every job.", evidence: "Rollup columns vs payload, one day: 29.1 MB vs 588.9 MB dry run; $0." },
      { name: "Databricks Free Edition", icon: si.siDatabricks, engine: "dbt-databricks", status: "showcase", role: "dbt on Unity Catalog and a Lakeflow Declarative Pipeline.", evidence: "dbt build: 123 nodes, 94 tests passed; Unity Catalog lineage 104 edges." },
    ],
  },
  {
    name: "AI narration",
    tools: [
      { name: "OpenRouter (free model)", icon: si.siOpenrouter, engine: "keystone-llm", status: "production", role: "Breaks package-to-repository ties and writes the weekly brief.", evidence: "Free model only, at $0; the brief names the model it used." },
    ],
  },
  {
    name: "Site and hosting",
    tools: [
      { name: "Next.js", version: "16.4.1", icon: si.siNextdotjs, status: "production", role: "Static export of this site.", evidence: "Rebuilt daily from the site-data release." },
      { name: "React", version: "19.3.1", icon: si.siReact, status: "production", role: "Components; every figure goes through one traced component.", evidence: "Each figure records the export file and JSON Pointer it came from." },
      { name: "TypeScript", icon: si.siTypescript, status: "production", role: "Strict types for every export.", evidence: "Type checks gate every pull request." },
      { name: "Tailwind CSS", version: "4.3.3", icon: si.siTailwindcss, status: "production", role: "Styles and theme tokens.", evidence: "Light and dark themes both pass axe contrast checks." },
      { name: "Playwright", status: "production", role: "End-to-end gates on the built site.", evidence: "Traces every number to its export; checks phone layout and word breaks." },
      { name: "axe-core", status: "production", role: "Accessibility checks (WCAG 2.2 AA tags).", evidence: "Runs on every page type in light and dark before each deploy." },
      { name: "Vitest", icon: si.siVitest, status: "production", role: "Unit tests for the loader, schemas and trace resolver.", evidence: "Runs on every pull request." },
      { name: "GitHub Pages", icon: si.siGithubpages, status: "production", role: "Hosting.", evidence: "Deployed by GitHub Actions only after the gates pass." },
    ],
  },
  {
    name: "Supply-chain hardening",
    tools: [
      { name: "OpenSSF Scorecard", status: "production", role: "Repository security checks.", evidence: "Scorecard workflow green on the pipeline repository." },
      { name: "zizmor", status: "production", role: "GitHub Actions workflow audit.", evidence: "Runs in the pipeline's CI; actions are pinned by SHA." },
      { name: "gitleaks", status: "production", role: "Secret scanning.", evidence: "Pre-commit hook and CI action in the pipeline." },
      { name: "pip-audit", status: "production", role: "Known vulnerabilities in Python dependencies.", evidence: "Strict audit of the locked requirements in the pipeline's CI." },
      { name: "Syft", status: "showcase", role: "SBOM of the pipeline.", evidence: "SBOM generated by the release workflow's dry run." },
    ],
  },
];

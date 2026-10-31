// The fields the site reads from the pipeline's exports. The JSON Schemas in schemas/ are the
// contract (checked by scripts/fetch-data.mjs); these types only describe what is rendered.

export type State = "ok" | "partial data" | "pending data" | "skipped";

export interface Envelope<Row> {
  dataset: string;
  dataset_version: string;
  generated_at: string;
  produced_by: { profile: "free" | "full"; fallback: boolean; run_id: string; keystone_version: string };
  window: { start: string | null; end: string | null; periods: unknown[] };
  sources: { name: string; url: string; terms?: string }[];
  privacy: { level: "repository" | "package"; people: string };
  corrections: string;
  row_count: number;
  rows: Row[];
  status?: { state: State; detail: string };
}

export interface Signal {
  name: string;
  available: boolean;
  sub: number | null;
  weight: number;
  reason: string;
}

export interface RadarRow {
  repo_id: number;
  repo_name: string | null;
  packages: string[];
  score_version: string;
  cut: string;
  fragility: number | null;
  criticality: number | null;
  risk: number | null;
  coverage: number;
  note: string;
  top_signals: Signal[];
  // radar v2 (ADR-084): set by the pipeline, not derived here.
  scored: boolean;
  unscored_reason: string | null;
  rank: number | null;
}

export interface ProjectRow extends Omit<RadarRow, "top_signals" | "scored" | "unscored_reason" | "rank"> {
  components: Signal[];
  criticality_inputs: Record<string, unknown>;
}

export interface BacktestRepo {
  name: string;
  repo_id?: number | null;
  status: string;
  fragility?: number | null;
  percentile?: number | null;
  flagged?: boolean;
  signals?: Signal[];
}

export interface BacktestPoint {
  cut: string;
  status: string;
  hour_coverage: number;
  reference_size: number;
  leakage_check: string | null;
  repos: BacktestRepo[];
}

export interface BacktestRow {
  id: string;
  month: string;
  cut: string;
  summary: string;
  sources: string[];
  outcome: string;
  points: BacktestPoint[];
  sensitivity: { variants: number; per_repo: Record<string, unknown> } | null;
}

export interface BriefRow {
  week: string;
  text: string | null;
  model: string | null;
  input_sha256: string;
  outcome: "written" | "cached" | "skipped" | "rejected" | "error";
  detail: string;
}

export interface BenchmarkRow {
  rung: string;
  engine: "DuckDB" | "Spark" | "Flink";
  input_rows: number;
  input_mb: number;
  wall_s: number[];
  engine_s: number[] | null;
  peak_mb: number[];
  rows_out: number;
  mb_out: number;
}

export interface Stage {
  name: string;
  service: string;
  version: string | null;
  records_in: number | null;
  records_out: number | null;
  duration_seconds: number | null;
  records_per_second: number | null;
  status: string;
  started_at: string;
}

export interface Engine {
  name: string;
  version: string | null;
  role: string;
  active: boolean;
  last_used: string | null;
}

export interface Run {
  run_id: string;
  started_at: string;
  ended_at: string;
  wall_seconds: number;
  stages: number;
  events_processed: number;
  status: string;
}

export interface LifetimeSpan {
  chunks: number;
  complete_chunks: number;
  days: number;
  first: string;
  last: string;
  events: number;
  bytes_downloaded: number;
  job_hours: number;
  hours_missing_at_source: number;
}

export interface PipelineMetrics {
  generated_at: string;
  metrics_version?: number;
  // History backfill totals (ADR-084); null when no chunk records were read. Absent before v2.
  lifetime?: (LifetimeSpan & { source: string; windows: (LifetimeSpan & { name: string })[] }) | null;
  profile: string;
  produced_by: {
    profile: string;
    fallback: boolean;
    reason?: string;
    run_id: string;
    decided_at?: string;
    probes?: { name: string; ok: boolean }[];
  };
  engines: Engine[];
  totals: {
    events_processed: number;
    events_stored: number;
    bytes_downloaded: number | null;
    bytes_parsed: number;
    files_parsed: number;
    rollup_rows: number;
    date_range: { first_event: string; newest_event: string; source_hours: number };
    backfill_window: { start: string; end: string; decision: string };
  };
  last_run: { run_id: string; stages: Stage[] };
  history: { runs: Run[]; daily_volume: { date: string; events_processed: number }[] };
  freshness: { newest_data_hour: string; lag_hours: number; slo_hours: number; status: string };
  quality: {
    checks_passed: number;
    dbt_tests_failed: number;
    quarantined_rows: number;
    contract_violations: number;
  };
  cost: { usd: number; basis: string; free_quota: { name: string; used_pct: number | null }[] };
  lineage_summary: { nodes: number; edges: number; documented_pct: number };
}

export interface LineageDataset {
  id: string;
  name: string;
  title: string;
  layer: string;
  domain: string;
  kind: string;
  fields: string[];
  cataloged: boolean;
}

export interface Lineage {
  generated_at: string;
  datasets: LineageDataset[];
  jobs: { id: string; name: string; tool: string; runs: number }[];
  edges: { from: string; to: string; kind: string }[];
  field_edges: unknown[];
  tools: Record<string, { table_edges?: number; column_edges?: number }>;
  gate_path: { tables: string[]; field?: string[] };
  full_engine_path: string[];
  summary: { nodes: number; edges: number; field_edges: number; datasets: number; jobs: number };
}

export interface CatalogDataset {
  id: string;
  title: string;
  layer: string;
  domain: string;
  classification: string;
  description: string;
  contract: string | null;
  freshness_sla_hours: number | null;
  published: boolean;
  glossary_terms: string[];
  columns: { name: string; type: string; description: string }[];
}

export interface Catalog {
  generated_at: string;
  completeness: {
    models: number;
    models_documented: number;
    columns: number;
    columns_documented: number;
    datasets: number;
    datasets_complete: number;
    documented_pct: number;
  };
  domains: Record<string, string>;
  classifications: Record<string, string>;
  datasets: CatalogDataset[];
}

export interface Glossary {
  generated_at: string;
  terms: { term: string; definition: string; status: string }[];
}

export interface FetchReport {
  source: string;
  fetched_at: string;
  error?: string;
  index_generated_at?: string;
  files: Record<string, { ok: boolean; reason?: string }>;
}

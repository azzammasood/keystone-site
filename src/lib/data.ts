// Build-time loader for data/site/ (written by scripts/fetch-data.mjs). Server components only.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  BacktestRow,
  BenchmarkRow,
  BriefRow,
  Catalog,
  Envelope,
  FetchReport,
  Glossary,
  Lineage,
  PipelineMetrics,
  ProjectRow,
  RadarRow,
} from "./types";

export const DATA_DIR = process.env.KEYSTONE_DATA_DIR ?? join(process.cwd(), "data", "site");

export type Loaded<T> =
  | { ok: true; file: string; data: T }
  | { ok: false; file: string; reason: string };

export function readReport(dir: string): FetchReport | null {
  try {
    return JSON.parse(readFileSync(join(dir, "_fetch.json"), "utf8")) as FetchReport;
  } catch {
    return null;
  }
}

// A file is rendered only if fetch-data accepted it; otherwise the page shows why it is missing.
export function loadFrom<T>(dir: string, file: string): Loaded<T> {
  const r = readReport(dir);
  if (!r) return { ok: false, file, reason: "exports were not fetched for this build" };
  if (r.error) return { ok: false, file, reason: r.error };
  const entry = r.files[file];
  if (!entry) return { ok: false, file, reason: "not listed in the pipeline's index.json" };
  if (!entry.ok) return { ok: false, file, reason: `rejected: ${entry.reason ?? "failed checks"}` };
  return { ok: true, file, data: JSON.parse(readFileSync(join(dir, file), "utf8")) as T };
}

// Each export is read once per build worker: thousands of project pages share project_pages.json.
const cache = new Map<string, Loaded<unknown>>();
function load<T>(file: string): Loaded<T> {
  if (!cache.has(file)) cache.set(file, loadFrom<T>(DATA_DIR, file));
  return cache.get(file) as Loaded<T>;
}

export const radar = () => load<Envelope<RadarRow>>("radar.json");
export const projects = () => load<Envelope<ProjectRow>>("project_pages.json");
export const backtests = () => load<Envelope<BacktestRow>>("backtests.json");
export const briefs = () => load<Envelope<BriefRow>>("brief.json");
export const benchmarks = () => load<Envelope<BenchmarkRow>>("benchmarks.json");
export const metrics = () => load<PipelineMetrics>("pipeline_metrics.json");
export const lineage = () => load<Lineage>("metadata/lineage.json");
export const catalog = () => load<Catalog>("metadata/catalog.json");
export const glossary = () => load<Glossary>("metadata/glossary.json");
export const fetchReport = () => readReport(DATA_DIR);

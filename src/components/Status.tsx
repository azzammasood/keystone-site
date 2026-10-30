import type { Envelope } from "@/lib/types";
import type { Loaded } from "@/lib/data";
import { utc } from "@/lib/format";
import { Static, V } from "./V";

// The export's own status, shown whenever it is not "ok". Never hidden, never softened.
export function Status({ file, env }: { file: string; env: Envelope<unknown> }) {
  if (!env.status || env.status.state === "ok") return null;
  return (
    <p className="status" role="status">
      <V src={file} at="/status/state" value={env.status.state} className="state" />
      <V src={file} at="/status/detail" value={env.status.detail} />
    </p>
  );
}

// A file this build could not use (not published yet, or rejected by the schema check).
export function Unavailable({ r }: { r: Extract<Loaded<unknown>, { ok: false }> }) {
  return (
    <p className="status" role="status">
      <span className="state">pending data</span>
      <span>
        <code>{r.file}</code> is not available for this build:{" "}
        <Static why="fetch report">{r.reason}</Static>
      </span>
    </p>
  );
}

export function Source({ file, env }: { file: string; env: Envelope<unknown> }) {
  return (
    <p className="source">
      from <code>{file}</code> · generated{" "}
      <V src={file} at="/generated_at" value={env.generated_at}>
        {utc(env.generated_at)}
      </V>{" "}
      · profile <V src={file} at="/produced_by/profile" value={env.produced_by.profile} />
      {env.produced_by.fallback ? " (fallback)" : ""}
    </p>
  );
}

export function SourceAt({ file, at, iso }: { file: string; at: string; iso: string }) {
  return (
    <p className="source">
      from <code>{file}</code> · generated{" "}
      <V src={file} at={at} value={iso}>
        {utc(iso)}
      </V>
    </p>
  );
}

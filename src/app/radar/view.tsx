import Link from "next/link";
import { Page } from "@/components/Page";
import { RadarSkeleton, RadarTable } from "@/components/RadarTable";
import { Source, Status, Unavailable } from "@/components/Status";
import { Static, V, ptr } from "@/components/V";
import * as data from "@/lib/data";
import { day } from "@/lib/format";

const F = "radar.json";

// The radar is split into static pages of PER rows in export order, so a page stays light
// however many repositories the export holds. Page 1 is /radar/, page n is /radar/n/.
export const PER = 100;
export const pageCount = (rows: number) => Math.max(1, Math.ceil(rows / PER));
const href = (n: number) => (n === 1 ? "/radar/" : `/radar/${n}/`);

type PagerProps = { n: number; of: number; start: number; end: number; total: number; label: string };
function Pager({ n, of, start, end, total, label }: PagerProps) {
  return (
    <nav className="sub" aria-label={label} style={{ marginTop: 18 }}>
      Rows <V src={F} at={ptr("rows", start)} derive="index" value={start + 1} /> to{" "}
      <V src={F} at={ptr("rows", end - 1)} derive="index" value={end} /> of{" "}
      <V src={F} at="/row_count" value={total} />
      {of > 1 ? (
        <>
          {" "}
          · page <Static why="page number">{n} of {of}</Static>
          {n > 1 ? (
            <>
              {" "}
              · <Link href={href(n - 1)} rel="prev">previous</Link>
            </>
          ) : null}
          {n < of ? (
            <>
              {" "}
              · <Link href={href(n + 1)} rel="next">next</Link>
            </>
          ) : null}
        </>
      ) : null}
    </nav>
  );
}

export function RadarView({ n }: { n: number }) {
  const r = data.radar();
  return (
    <Page
      eyebrow="radar"
      title="Repositories under strain"
      lede="Repositories that many packages depend on, ranked by signs of strain in their public activity. Each score is a signal to look closer, never a prediction."
    >
      {r.ok ? (
        <>
          <Status file={F} env={r.data} />
          {r.data.window.start && r.data.window.end ? (
            <p className="sub" style={{ marginTop: 18 }}>
              Window{" "}
              <V src={F} at="/window/start" value={r.data.window.start}>
                {day(r.data.window.start)}
              </V>{" "}
              to{" "}
              <V src={F} at="/window/end" value={r.data.window.end}>
                {day(r.data.window.end)}
              </V>
              .
            </p>
          ) : null}
          {r.data.rows.length === 0 ? (
            <>
              <p style={{ marginTop: 22 }}>
                <V src={F} at="/row_count" value={r.data.row_count} /> repositories scored.
                The table fills in once enough history has loaded.
              </p>
              <RadarSkeleton />
            </>
          ) : (
            (() => {
              const of = pageCount(r.data.rows.length);
              const start = (n - 1) * PER;
              const end = Math.min(start + PER, r.data.rows.length);
              const at = { n, of, start, end, total: r.data.row_count };
              return (
                <>
                  <Pager {...at} label="Radar pages" />
                  <RadarTable env={r.data} start={start} limit={PER} />
                  {of > 1 ? <Pager {...at} label="Radar pages, end of table" /> : null}
                </>
              );
            })()
          )}
          <Source file={F} env={r.data} />
        </>
      ) : (
        <Unavailable r={r} />
      )}
    </Page>
  );
}

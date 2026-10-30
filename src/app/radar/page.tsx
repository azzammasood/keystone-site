import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { RadarSkeleton, RadarTable } from "@/components/RadarTable";
import { Source, Status, Unavailable } from "@/components/Status";
import { V } from "@/components/V";
import * as data from "@/lib/data";
import { day } from "@/lib/format";

export const metadata: Metadata = { title: "Radar" };

export default function Radar() {
  const r = data.radar();
  return (
    <Page
      eyebrow="radar"
      title="Repositories under strain"
      lede="Repositories that many packages depend on, ranked by signs of strain in their public activity. Each score is a signal to look closer, never a prediction."
    >
      {r.ok ? (
        <>
          <Status file="radar.json" env={r.data} />
          {r.data.window.start && r.data.window.end ? (
            <p className="sub" style={{ marginTop: 18 }}>
              Window{" "}
              <V src="radar.json" at="/window/start" value={r.data.window.start}>
                {day(r.data.window.start)}
              </V>{" "}
              to{" "}
              <V src="radar.json" at="/window/end" value={r.data.window.end}>
                {day(r.data.window.end)}
              </V>
              .
            </p>
          ) : null}
          {r.data.row_count === 0 ? (
            <>
              <p style={{ marginTop: 22 }}>
                <V src="radar.json" at="/row_count" value={r.data.row_count} /> repositories scored.
                The table fills in once enough history has loaded.
              </p>
              <RadarSkeleton />
            </>
          ) : (
            <RadarTable env={r.data} />
          )}
          <Source file="radar.json" env={r.data} />
        </>
      ) : (
        <Unavailable r={r} />
      )}
    </Page>
  );
}

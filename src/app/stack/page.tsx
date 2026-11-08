import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { Static, V } from "@/components/V";
import * as data from "@/lib/data";
import { day } from "@/lib/format";
import { Architecture } from "./Architecture";
import { LAYERS, type Icon, type Tool } from "./tools";

export const metadata: Metadata = { title: "Tech stack" };
const F = "pipeline_metrics.json";

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
const tint = (icon: Icon, mode: keyof typeof CARD) => (contrast(icon.hex, CARD[mode]) >= 3 ? `#${icon.hex}` : "var(--fg)");

function Logo({ tool }: { tool: Tool }) {
  if (!tool.icon) {
    const letters = tool.name.replace(/\(.*\)/, "").split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
    return (
      <span className="logo badge" aria-hidden="true">
        {letters}
      </span>
    );
  }
  return (
    <svg
      className="logo"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ ["--ic-dark" as string]: tint(tool.icon, "dark"), ["--ic-light" as string]: tint(tool.icon, "light") }}
    >
      <path d={tool.icon.path} />
    </svg>
  );
}

export default function Stack() {
  const m = data.metrics();
  const engines = m.ok ? m.data.engines : [];
  const production = LAYERS.flatMap((l) => l.tools).filter((t) => t.status === "production").length;
  return (
    <Page
      eyebrow="tech stack"
      title="What runs, and what it proved"
      lede="Every tool here ran, with the evidence. Production tools run on every scheduled job; showcase tools ran locally or once, to show the same pipeline on a full streaming and lakehouse stack."
    >
      <Architecture />

      <p className="sub" style={{ marginTop: 22 }}>
        <span className="pill prod">production, runs daily</span> <span className="pill show">showcase, ran locally or once</span>{" "}
        · <Static why="tool count">{production}</Static> production tools. Versions and last runs come from{" "}
        <code>engines[]</code> in pipeline_metrics.json where the pipeline records them.
      </p>

      {LAYERS.map((layer) => (
        <section key={layer.name} aria-labelledby={`layer-${layer.name}`}>
          <h3 id={`layer-${layer.name}`}>{layer.name}</h3>
          <ul className="tools">
            {layer.tools.map((t) => {
              const i = t.engine ? engines.findIndex((e) => e.name === t.engine) : -1;
              const e = i >= 0 ? engines[i] : undefined;
              return (
                <li key={t.name} className="tool">
                  <Logo tool={t} />
                  <div>
                    <div className="name">
                      {t.name}{" "}
                      {e?.version ? (
                        <span className="sub">
                          <V src={F} at={`/engines/${i}/version`} value={e.version} wrap />
                        </span>
                      ) : t.version ? (
                        <span className="sub">
                          <Static why="tool version (pipeline README)">{t.version}</Static>
                        </span>
                      ) : null}
                    </div>
                    <span className={`pill ${t.status === "production" ? "prod" : "show"}`}>
                      {t.status === "production" ? "production, runs daily" : "showcase, ran locally or once"}
                    </span>
                    <p>
                      <Static why="tool role (pipeline README)">{t.role}</Static>
                    </p>
                    <p className="sub">
                      <Static why="evidence (pipeline README and docs)">{t.evidence}</Static>
                      {e?.last_used ? (
                        <>
                          {" "}
                          Last ran{" "}
                          <V src={F} at={`/engines/${i}/last_used`} value={e.last_used}>
                            {day(e.last_used)}
                          </V>
                          .
                        </>
                      ) : null}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="sub" style={{ marginTop: 32 }}>
        Logos: Simple Icons (<Static why="licence name">CC0</Static>); trademarks belong to their owners. Tools without an icon there show
        their initials.
      </p>
    </Page>
  );
}

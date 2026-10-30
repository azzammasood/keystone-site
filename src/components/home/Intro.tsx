"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// The reader-paced intro: GH Archive hours (one tile per real hour loaded, or per N hours once
// there are many) -> the packages and vulnerabilities layers -> the tiles stand up as an arch whose
// keystone glows -> the landing. Shown once per browser session; skipped for reduced motion.
const MAX_TILES = 240;
const COLS = 19;
export const INTRO_SEEN = "keystone-intro-seen";

export function Intro({ hours }: { hours: number }) {
  const per = Math.max(1, Math.ceil(hours / MAX_TILES));
  const count = Math.ceil(hours / per);
  const [at, setAt] = useState(1);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const tiles = [...el.querySelectorAll<HTMLElement>(".spin i")];
    const rows = Math.ceil(count / COLS);
    const grid = (k: number) =>
      `translate3d(${((k % COLS) - (COLS - 1) / 2) * 22}px,${(Math.floor(k / COLS) - (rows - 1) / 2) * 26}px,0)`;
    const arcN = Math.ceil(count / 6);
    const arch = (k: number) => {
      const j = k % arcN, layer = Math.floor(k / arcN), a = (Math.PI * (j + 0.5)) / arcN;
      const r = 130 + Math.floor(layer / 3) * 24;
      return {
        tf: `translate3d(${(r * Math.cos(a)).toFixed(1)}px,${((layer % 3) - 1) * 20}px,${(r * Math.sin(a) + 10).toFixed(1)}px) rotateX(90deg) rotateY(${(90 - (a * 180) / Math.PI).toFixed(1)}deg)`,
        key: Math.abs(j - (arcN - 1) / 2) < 1,
      };
    };
    const stage = (n: number) =>
      tiles.forEach((t, k) => {
        if (n === 0) t.style.transform = grid(k) + " translateZ(260px)";
        if (n === 1) { t.style.transform = grid(k); t.style.opacity = "1"; t.classList.remove("key"); }
        if (n === 2) t.style.opacity = ".55";
        if (n === 3) { const p = arch(k); t.style.transform = p.tf; t.style.opacity = "1"; t.classList.toggle("key", p.key); }
        if (n === 4) { t.style.transform += " translateZ(-520px)"; t.style.opacity = "0"; }
      });
    (el as HTMLDivElement & { stage?: (n: number) => void }).stage = stage;
    stage(0);
    const id = setTimeout(() => stage(1), 80);
    next.current?.focus({ preventScroll: true });
    return () => clearTimeout(id);
  }, [count]);

  const stage = (n: number) => (root.current as (HTMLDivElement & { stage?: (n: number) => void }) | null)?.stage?.(n);

  function land() {
    if (done) return;
    setDone(true);
    try {
      sessionStorage.setItem(INTRO_SEEN, "1");
    } catch {}
    document.documentElement.classList.remove("intro");
    document.body.classList.add("landed");
    window.dispatchEvent(new Event("keystone-landed"));
    setTimeout(() => setGone(true), 1100);
  }

  function advance() {
    if (busy.current || done) return;
    busy.current = true;
    if (at < 3) {
      const n = at + 1;
      setAt(n);
      stage(n);
      setTimeout(() => (busy.current = false), 500);
      return;
    }
    stage(4);
    setAt(4);
    setTimeout(land, 1300);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " ", "ArrowRight", "ArrowDown", "PageDown"].includes(e.key)) {
        e.preventDefault();
        advance();
      } else if (e.key === "Escape") land();
    };
    if (!done) addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  if (gone) return null;
  // Portalled to <body>: <main> is its own stacking context, and the intro must sit above the nav.
  return createPortal(
    <div
      id="intro"
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Introduction"
      className={`${at === 2 ? "s2" : ""} ${done ? "done" : ""}`}
      onClick={advance}
      onWheel={(e) => e.deltaY > 20 && advance()}
    >
      <div className={`st ${at === 1 ? "on" : ""}`}>
        <p>
          GitHub&apos;s public activity is archived, <em>one file per hour</em>.
        </p>
        <small>
          <data value={hours} data-src="pipeline_metrics.json#/totals/date_range/source_hours">
            {hours.toLocaleString("en-US")}
          </data>{" "}
          hours read so far
          {per > 1 ? <span data-static="tile scale"> · one tile per {per} hours</span> : null}
        </small>
      </div>
      <div className={`st ${at === 2 ? "on" : ""}`}>
        <p>
          Keystone links it to the <em>packages</em> you install and their known <em>vulnerabilities</em>.
        </p>
        <small>sources: GH Archive · ecosyste.ms · OSV</small>
      </div>
      <div className={`st ${at === 3 ? "on" : ""}`}>
        <p>
          And shows which projects everyone relies on show <em>signs of strain</em>.
        </p>
      </div>
      <div className="files" aria-hidden="true">
        <div className="world">
          <div className="spin">
            <div className="pl">packages</div>
            <div className="pl v">vulnerabilities</div>
            {Array.from({ length: count }, (_, k) => (
              <i key={k} style={{ ["--r" as string]: (k * 37) % count }} />
            ))}
          </div>
        </div>
      </div>
      <div className="pager">
        <button
          ref={next}
          className="next"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            advance();
          }}
        >
          {at >= 3 ? "enter" : "continue"}
        </button>
        <div className="dots" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <i key={n} className={at === n ? "on" : ""} />
          ))}
        </div>
      </div>
      <button
        className="skip"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          land();
        }}
      >
        skip intro
      </button>
    </div>,
    document.body,
  );
}

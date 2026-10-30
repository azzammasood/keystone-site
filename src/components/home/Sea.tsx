"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_SEEN, Intro } from "./Intro";

// The seabed: lineage layers as ridge bands (published at the front), one bump per dataset whose
// height is its column count from metadata/lineage.json. Also runs the landing, the water depth on
// scroll and the section reveals. Paused when the tab is hidden; still for reduced motion.
export type Bed = [layer: string, datasets: [title: string, fields: number][]][];

export function Sea({ bed, hours }: { bed: Bed; hours: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_SEEN) === "1";
    } catch {}
    if (document.documentElement.classList.contains("intro") && !seen && !reduced && hours > 0) {
      setIntro(true); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      document.documentElement.classList.remove("intro");
      document.body.classList.add("landed");
    }

    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.2 },
    );
    document.querySelectorAll("section.dive").forEach((s) => io.observe(s));

    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return () => io.disconnect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const size = () => {
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
    };
    size();

    const rowsPer = 7, NX = 90, bands = [...bed].reverse(), NZ = bands.length * rowsPer;
    const maxF = Math.max(1, ...bed.flatMap(([, ds]) => ds.map((d) => d[1])));
    const H: number[][] = [];
    for (let z = 0; z < NZ; z++) {
      const ds = bands[Math.floor(z / rowsPer)]?.[1] ?? [];
      const env = Math.sin((Math.PI * (z % rowsPer)) / (rowsPer - 1));
      const row: number[] = [];
      for (let x = 0; x < NX; x++) {
        const u = x / (NX - 1);
        let h = 0;
        ds.forEach((d, i) => {
          const c = (i + 0.5) / ds.length, s = 0.5 / ds.length;
          h = Math.max(h, (d[1] / maxF) * Math.exp(-(((u - c) / s) ** 2)));
        });
        row.push(h * env);
      }
      H.push(row);
    }

    const col = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    let acc = col("--accent"), mute = col("--mute");
    const recolour = () => { acc = col("--accent"); mute = col("--mute"); };
    const scheme = matchMedia("(prefers-color-scheme: light)");
    scheme.addEventListener("change", recolour);
    addEventListener("keystone-mode", recolour);

    let tilt = 0.5, target = 0.5, sink = 0, t0 = performance.now(), raf = 0, running = true;
    const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    const onLand = () => (t0 = performance.now());
    addEventListener("keystone-landed", onLand);
    const onMove = (e: PointerEvent) => (target = e.clientY / innerHeight);
    addEventListener("pointermove", onMove);
    const water = document.getElementById("water");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      sink = max > 0 ? scrollY / max : 0;
      water?.style.setProperty("--wy", `${60 - sink * 80}%`);
      if (reduced) draw(performance.now());
    };
    addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { size(); if (reduced) draw(performance.now()); };
    addEventListener("resize", onResize);

    function draw(now: number) {
      if (!cv || !ctx) return;
      const t = (now - t0) / 1000, W = cv.width, Hh = cv.height;
      tilt += (target - tilt) * 0.05;
      const rise = reduced ? 1 : ease(t / 1.2);
      const scan = reduced ? -1 : ((t - 1) * 2.5) % (NZ + 10);
      const cam = 1.6 + tilt * 1.2 + sink * 1.4, horizon = Hh * (0.36 + tilt * 0.06 - sink * 0.25);
      const fade = 1 - Math.min(1, sink * 1.6) * 0.3;
      ctx.clearRect(0, 0, W, Hh);
      const proj = (x: number, z: number, h: number) => {
        const zz = 1 + (z / NZ) * cam;
        return [W * 0.5 + ((x / (NX - 1) - 0.5) * W * 1.3) / zz, horizon + (Hh * 0.97 - horizon) / zz - (h * rise * Hh * 0.28) / zz] as const;
      };
      for (let z = NZ - 1; z >= 0; z--) {
        const lit = scan < 0 ? 0 : Math.max(0, 1 - Math.abs(z - scan) / 4);
        ctx.beginPath();
        for (let x = 0; x < NX; x++) {
          const [sx, sy] = proj(x, z, H[z]?.[x] ?? 0);
          if (x) ctx.lineTo(sx, sy);
          else ctx.moveTo(sx, sy);
        }
        ctx.strokeStyle = lit > 0.05 ? acc : mute;
        ctx.globalAlpha = (lit > 0.05 ? 0.2 + lit * 0.4 : 0.1 + (1 - z / NZ) * 0.22) * fade * Math.min(1, rise * 1.5);
        ctx.lineWidth = (lit > 0.05 ? 1.25 : 1) * dpr;
        ctx.stroke();
      }
      // clear the water behind the text column so the ridges never sit under words
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
      const g = ctx.createLinearGradient(0, 0, W * (innerWidth < 900 ? 1 : 0.62), 0);
      g.addColorStop(0, "rgba(0,0,0,.92)");
      g.addColorStop(0.7, "rgba(0,0,0,.6)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, Hh);
      ctx.globalCompositeOperation = "source-over";
    }
    const loop = (now: number) => {
      draw(now);
      if (running) raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      running = !document.hidden && !reduced;
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);
    onScroll();
    if (reduced) draw(performance.now());
    else onVis();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      scheme.removeEventListener("change", recolour);
      removeEventListener("keystone-mode", recolour);
      removeEventListener("keystone-landed", onLand);
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [bed, hours]);

  return (
    <>
      <canvas id="sea" ref={canvas} aria-hidden="true" />
      {intro ? <Intro hours={hours} /> : null}
    </>
  );
}

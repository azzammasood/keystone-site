"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  ["/radar/", "Radar"],
  ["/pipeline/", "Pipeline Live"],
  ["/backtests/", "Backtests"],
  ["/lineage/", "Lineage"],
  ["/stack/", "Tech stack"],
  ["/about/", "About"],
] as const;

type Mode = "light" | "dark";

function current(): Mode {
  const set = document.documentElement.dataset.mode;
  if (set === "light" || set === "dark") return set;
  return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function Nav() {
  const path = usePathname();
  const [mode, setMode] = useState<Mode | null>(null);
  // Phones hide the links behind a menu button; a navigation closes it.
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [path]);
  // Read the mode the boot script applied; the button stays unlabelled until then.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMode(current()), []);

  function toggle() {
    const next: Mode = current() === "light" ? "dark" : "light";
    const html = document.documentElement;
    // Crossfade the colours (globals.css, html.theming); instant for reduced motion.
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      html.classList.add("theming");
      window.setTimeout(() => html.classList.remove("theming"), 450);
    }
    html.dataset.mode = next;
    try {
      localStorage.setItem("keystone-mode", next);
    } catch {}
    setMode(next);
    window.dispatchEvent(new Event("keystone-mode"));
  }

  return (
    <nav className={`nav${open ? " open" : ""}`} aria-label="Main">
      <Link className="logo" href="/">
        KEYSTONE
      </Link>
      <button type="button" className="menu" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen((o) => !o)}>
        {open ? "close" : "menu"}
      </button>
      <span className="links" id="nav-links">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </span>
      <button type="button" onClick={toggle} aria-label="Switch colour mode">
        {mode === null ? "mode" : mode === "light" ? "dark" : "light"}
      </button>
    </nav>
  );
}

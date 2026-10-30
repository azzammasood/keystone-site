"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  ["/radar/", "Radar"],
  ["/pipeline/", "Pipeline Live"],
  ["/backtests/", "Backtests"],
  ["/lineage/", "Lineage"],
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
  // Read the mode the boot script applied; the button stays unlabelled until then.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMode(current()), []);

  function toggle() {
    const next: Mode = current() === "light" ? "dark" : "light";
    document.documentElement.dataset.mode = next;
    try {
      localStorage.setItem("keystone-mode", next);
    } catch {}
    setMode(next);
    window.dispatchEvent(new Event("keystone-mode"));
  }

  return (
    <nav className="nav" aria-label="Main">
      <Link className="logo" href="/">
        KEYSTONE
      </Link>
      <span className="links">
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

import type { ReactNode } from "react";

// Remounts on every navigation, so each page arrives with one sonar sweep: a scan line passes
// down the screen and the page is revealed behind it (globals.css, .sweep). Only clip-path and
// opacity animate, so fixed layers (the seabed canvas) keep their place. Off for reduced motion.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="scanline" aria-hidden="true" />
      <div className="sweep">{children}</div>
    </>
  );
}

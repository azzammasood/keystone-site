import type { Metadata, Viewport } from "next";
import { Space_Mono, Syne } from "next/font/google";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import "./globals.css";

const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });
const syne = Syne({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-syne" });

export const metadata: Metadata = {
  title: { default: "Keystone", template: "%s · Keystone" },
  description:
    "Open-source supply-chain radar: public GitHub activity linked to packages and known vulnerabilities. Signals, never predictions.",
};

export const viewport: Viewport = { themeColor: "#02060d", width: "device-width", initialScale: 1 };

// Applied before paint: the saved mode, the `js` class that enables reveal motion, and on the home
// page the `intro` class that covers the landing until the intro (components/home/Intro) mounts.
const base = JSON.stringify(process.env.NEXT_PUBLIC_BASE_PATH ?? "");
const boot = `(function(d){d.classList.add("js");try{var m=localStorage.getItem("keystone-mode");if(m)d.dataset.mode=m;var p=location.pathname;if((p===${base}+"/"||p===${base})&&!sessionStorage.getItem("keystone-intro-seen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("intro")}catch(e){}})(document.documentElement)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${syne.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div id="water" aria-hidden="true" />
        <Nav />
        <main id="main">{children}</main>
        <footer className="site">
          <nav aria-label="All pages">
            <Link href="/radar/">Radar</Link>
            <Link href="/pipeline/">Pipeline Live</Link>
            <Link href="/backtests/">Backtests</Link>
            <Link href="/lineage/">Lineage</Link>
            <Link href="/catalog/">Catalog</Link>
            <Link href="/scale/">Scale</Link>
            <Link href="/briefs/">Weekly briefs</Link>
            <Link href="/about/">About the data and method</Link>
            <Link href="/built/">How it&apos;s built</Link>
            <Link href="/corrections/">Corrections and removal</Link>
            <Link href="/maker/">The maker</Link>
          </nav>
          <span>Data: GH Archive · OSV · ecosyste.ms (terms on the About page)</span>
          <span>Repository and package level only. Signals, never predictions.</span>
        </footer>
      </body>
    </html>
  );
}

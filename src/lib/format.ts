// Display formatting only: it changes how a value is written, never the value.
export const full = (n: number | null | undefined) =>
  n == null ? "not recorded" : n.toLocaleString("en-US");

export function short(n: number): string {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e4) return `${Math.round(n / 1e3)}K`;
  return n.toLocaleString("en-US");
}

export const fixed = (n: number | null | undefined, d = 2) =>
  n == null ? "not scored" : n.toFixed(d);
export const share = (s: number, d = 1) => `${(s * 100).toFixed(d)}%`;
export const gigabytes = (bytes: number) => (bytes / 1e9).toLocaleString("en-US", { maximumFractionDigits: 1 });
export const megabytes = (bytes: number) => Math.round(bytes / 1e6).toLocaleString("en-US");
export const day = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : "not recorded");
export const utc = (iso: string | null | undefined) =>
  iso ? `${iso.slice(0, 16).replace("T", " ")} UTC` : "not recorded";
export const year = (iso: string) => iso.slice(0, 4);
export const secs = (s: number | null | undefined) =>
  s == null ? "not recorded" : s < 60 ? `${s.toFixed(1)} s` : `${(s / 60).toFixed(1)} min`;

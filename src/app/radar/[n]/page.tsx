import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as data from "@/lib/data";
import { RadarView, pageCount } from "../view";

export const dynamicParams = false;

// Radar pages 2 and on. With a single page there are none, and the placeholder below is the only
// one built (it renders as not found).
export function generateStaticParams() {
  const r = data.radar();
  const of = r.ok ? pageCount(r.data.rows.length) : 1;
  const ns = Array.from({ length: of - 1 }, (_, i) => ({ n: String(i + 2) }));
  return ns.length ? ns : [{ n: "2" }];
}

type Props = { params: Promise<{ n: string }> };

function page(raw: string) {
  const r = data.radar();
  const n = Number(raw);
  return r.ok && Number.isInteger(n) && n >= 2 && n <= pageCount(r.data.rows.length) ? n : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = page((await params).n);
  return { title: n ? `Radar, page ${n}` : "Radar" };
}

export default async function RadarPage({ params }: Props) {
  const n = page((await params).n);
  if (!n) notFound();
  return <RadarView n={n} />;
}

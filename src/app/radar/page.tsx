import type { Metadata } from "next";
import { RadarView } from "./view";

export const metadata: Metadata = { title: "Radar" };

export default function Radar() {
  return <RadarView n={1} />;
}

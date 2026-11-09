import { describe, expect, it } from "vitest";
import { longestSegment } from "../../src/components/V";

// h1.title data scales to fit its longest unbreakable run (globals.css), so that run's width
// estimate must cover the widest letters and split where breakable() inserts <wbr>.
describe("longestSegment", () => {
  it("measures the longest run between break points, in em", () => {
    expect(longestSegment("a/b")).toBeCloseTo(1.17 + 0.5, 1); // "a/" then "b"
    expect(longestSegment("doctrine/doctrinemongodbbundle")).toBeGreaterThan(
      longestSegment("doctrine/x"),
    );
  });
  it("weights wide letters", () => {
    expect(longestSegment("WWWW")).toBeGreaterThan(longestSegment("IIII") * 4);
  });
  it("counts unknown characters as the widest", () => {
    expect(longestSegment("é")).toBeGreaterThanOrEqual(1.897);
  });
});

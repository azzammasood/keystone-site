import { expect, test } from "@playwright/test";
import { sample } from "./pages";

// No heading breaks inside a word, at phone and desktop width. Identifiers may wrap only after
// . _ / - : (V.tsx, breakable), so each run between those is one word here.
test.use({ reducedMotion: "reduce" });

for (const width of [375, 1280]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const path of sample()) {
      test(`no heading breaks inside a word: /${path}`, async ({ page }) => {
        await page.goto(path);
        const broken = await page.evaluate(() => {
          const out: string[] = [];
          for (const el of document.querySelectorAll("main :is(h1, h2, h3, .hero-num b, .g .v)")) {
            const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            for (let n = walk.nextNode(); n; n = walk.nextNode()) {
              const text = n.textContent ?? "";
              for (const m of text.matchAll(/[^\s._/:-]+/g)) {
                const range = document.createRange();
                range.setStart(n, m.index);
                range.setEnd(n, m.index + m[0].length);
                const tops = new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top / 4)));
                if (tops.size > 1) out.push(`<${el.tagName.toLowerCase()}> "${m[0]}"`);
              }
            }
          }
          return out.slice(0, 5);
        });
        expect(broken, broken.join("\n")).toEqual([]);
      });
    }
  });
}

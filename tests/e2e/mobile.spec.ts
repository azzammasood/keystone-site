import { expect, test } from "@playwright/test";
import { sample } from "./pages";

// At phone width no page scrolls sideways: wide tables scroll inside their own box, and long
// headings wrap.
test.use({ viewport: { width: 375, height: 812 }, reducedMotion: "reduce" });

for (const path of sample()) {
  test(`no sideways scroll at 375px: /${path}`, async ({ page }) => {
    await page.goto(path);
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw, `page is ${sw}px wide in a ${cw}px viewport`).toBeLessThanOrEqual(cw);
  });
}

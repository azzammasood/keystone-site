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

    // Stacked tables (table.stack) are cards here: no sideways scroll inside the wrapper, "why"
    // runs nearly full width, and no card is taller than its own lines plus padding.
    const bad = await page.evaluate(() => {
      const out: string[] = [];
      for (const t of document.querySelectorAll<HTMLTableElement>("table.stack")) {
        const wrap = t.parentElement!;
        if (t.scrollWidth > wrap.clientWidth + 1) out.push(`table ${t.scrollWidth}px in a ${wrap.clientWidth}px box`);
        for (const tr of t.querySelectorAll<HTMLTableRowElement>("tbody tr")) {
          const h = (sel: string) => tr.querySelector(sel)?.getBoundingClientRect().height ?? 0;
          const row = tr.getBoundingClientRect();
          const why = tr.querySelector(".c-why")?.getBoundingClientRect();
          const lines = h(".c-name") + Math.max(h(".c-data"), h(".c-sub"), h(".c-weight")) + h(".c-why");
          if (why && why.width < row.width * 0.8) out.push(`why is ${Math.round(why.width)}px of a ${Math.round(row.width)}px row`);
          if (row.height > lines + 40) out.push(`row ${Math.round(row.height)}px for ${Math.round(lines)}px of lines`);
        }
      }
      return out.slice(0, 5);
    });
    expect(bad, bad.join("\n")).toEqual([]);
  });
}

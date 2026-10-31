import { expect, test } from "@playwright/test";
import { sample } from "./pages";
import { mismatches } from "./resolve";

// The site's core promise: every figure is traced to an export, and matches it. This runs in
// the browser (after hydration) on a sample; html-trace.spec.ts checks every built page.
test.use({ reducedMotion: "reduce" });

for (const path of sample()) {
  test(`every figure on /${path} is traced to an export`, async ({ page }) => {
    await page.goto(path);
    const traced = await page.$$eval("main [data-src]", (els) =>
      els.map((e) => ({ src: e.getAttribute("data-src")!, value: e.getAttribute("value"), derive: e.getAttribute("data-derive") })),
    );
    const wrong = mismatches(traced);
    expect(wrong, wrong.join("\n")).toEqual([]);

    // Any digit in the page text must sit inside a traced value or an explicit <Static>.
    const loose = await page.evaluate(() => {
      const out: string[] = [];
      const main = document.querySelector("main");
      if (!main) return ["no <main>"];
      const walk = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const el = n.parentElement;
        if (!el || !/\d/.test(n.textContent ?? "") || el.closest("script,style,[data-src],[data-static]")) continue;
        out.push(`<${el.tagName.toLowerCase()}> "${(n.textContent ?? "").trim().slice(0, 80)}"`);
      }
      return out;
    });
    expect(loose, `untraced digits:\n${loose.join("\n")}`).toEqual([]);
  });
}

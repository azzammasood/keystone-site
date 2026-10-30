import { expect, test } from "@playwright/test";
import { pages } from "./pages";
import { asText, derive, resolve } from "./resolve";

// The site's core promise: every figure is traced to an export, and matches it.
test.use({ reducedMotion: "reduce" });

for (const path of pages()) {
  test(`every figure on /${path} is traced to an export`, async ({ page }) => {
    await page.goto(path);
    const traced = await page.$$eval("main [data-src]", (els) =>
      els.map((e) => ({ src: e.getAttribute("data-src")!, value: e.getAttribute("value"), derive: e.getAttribute("data-derive") })),
    );
    const wrong: string[] = [];
    for (const t of traced) {
      const r = resolve(t.src);
      if (!r.found) {
        wrong.push(`${t.src}: not in the export`);
        continue;
      }
      if (t.derive === "index") {
        if (!/^[1-9]\d*$/.test(t.value ?? "")) wrong.push(`${t.src}: bad row number ${t.value}`);
        continue;
      }
      const want = asText(derive(r.value, t.derive));
      if (want !== t.value) wrong.push(`${t.src}${t.derive ? ` (${t.derive})` : ""}: page ${t.value}, export ${want}`);
    }
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

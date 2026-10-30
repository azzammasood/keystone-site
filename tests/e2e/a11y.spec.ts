import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pages } from "./pages";

// The intro needs the archive hour count; a build without pipeline_metrics.json has no intro.
const hasIntro = existsSync(join(process.env.KEYSTONE_DATA_DIR ?? "data/site", "pipeline_metrics.json"));

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme, reducedMotion: "reduce" });
    for (const path of pages()) {
      test(`axe: /${path}`, async ({ page }) => {
        await page.goto(path);
        const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        expect(r.violations.map((v) => `${v.id}: ${v.nodes.length} nodes (${v.nodes[0]?.target})`)).toEqual([]);
      });
    }

    test("axe: home with the intro open", async ({ page }) => {
      test.skip(!hasIntro, "no pipeline_metrics.json in this build");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto("");
      await expect(page.locator("#intro")).toBeVisible();
      await page.waitForTimeout(900);
      const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.length} nodes (${v.nodes[0]?.target})`)).toEqual([]);
    });
  });
}

test("the intro steps through and lands, and is not shown again in the session", async ({ page }) => {
  test.skip(!hasIntro, "no pipeline_metrics.json in this build");
  await page.goto("");
  const intro = page.locator("#intro");
  await expect(intro).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: /continue|enter/ }).click();
    await page.waitForTimeout(600);
  }
  await expect(intro).toHaveCount(0, { timeout: 5000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.reload();
  await expect(page.locator("#intro")).toHaveCount(0);
});

test("the mode toggle switches and is remembered", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("radar/");
  await page.getByRole("button", { name: "Switch colour mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
});

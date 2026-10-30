import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadFrom } from "@/lib/data";
import { day, fixed, short, share, utc } from "@/lib/format";
// @ts-expect-error plain ESM script shared with fetch-data.mjs
import { checkEntry, makeValidator, sha256 } from "../../scripts/exports.mjs";
import { asText, derive, pointer } from "../e2e/resolve";

const FIX = "fixtures/site-data";
const validate = makeValidator("schemas");
const index = JSON.parse(readFileSync(join(FIX, "index.json"), "utf8")) as {
  rows: { path: string; bytes: number; sha256: string; schema: string }[];
};

function dir(report: object, files: Record<string, string> = {}) {
  const d = mkdtempSync(join(tmpdir(), "ks-"));
  writeFileSync(join(d, "_fetch.json"), JSON.stringify(report));
  for (const [name, body] of Object.entries(files)) writeFileSync(join(d, name), body);
  return d;
}

describe("fixture exports", () => {
  it.each(index.rows.map((r) => [r.path, r]))("%s passes size, hash and schema", (_, entry) => {
    expect(checkEntry(entry, readFileSync(join(FIX, entry.path)), validate)).toBeNull();
  });

  it("rejects a changed file", () => {
    const entry = index.rows.find((r) => r.path === "radar.json")!;
    const buf = Buffer.from(readFileSync(join(FIX, entry.path), "utf8").replace("partial data", "partial dat_"));
    expect(checkEntry(entry, buf, validate)).toMatch(/sha256/);
  });

  it("rejects a file that breaks its schema even when the index agrees", () => {
    const doc = JSON.parse(readFileSync(join(FIX, "radar.json"), "utf8"));
    doc.privacy.level = "person";
    const buf = Buffer.from(JSON.stringify(doc));
    const entry = { path: "radar.json", bytes: buf.length, sha256: sha256(buf), schema: "radar_row.schema.json" };
    expect(checkEntry(entry, buf, validate)).toMatch(/envelope/);
  });
});

describe("loader", () => {
  it("reports exports that were never fetched", () => {
    const r = loadFrom(mkdtempSync(join(tmpdir(), "ks-")), "radar.json");
    expect(r.ok).toBe(false);
  });

  it("passes on the fetch error (release not published)", () => {
    const r = loadFrom(dir({ error: "release site-data has not been published yet", files: {} }), "radar.json");
    expect(r).toMatchObject({ ok: false, reason: "release site-data has not been published yet" });
  });

  it("never renders a rejected file", () => {
    const d = dir({ files: { "radar.json": { ok: false, reason: "sha256 does not match the index" } } }, { "radar.json": "{}" });
    expect(loadFrom(d, "radar.json")).toMatchObject({ ok: false, reason: "rejected: sha256 does not match the index" });
  });

  it("loads an accepted file", () => {
    const d = dir({ files: { "x.json": { ok: true } } }, { "x.json": '{"a":1}' });
    expect(loadFrom(d, "x.json")).toEqual({ ok: true, file: "x.json", data: { a: 1 } });
  });
});

describe("trace resolution", () => {
  const doc = { a: [{ on: true }, { on: false }, { on: true }], "b/c": { "d~e": 5 } };
  it("follows RFC 6901 pointers", () => {
    expect(pointer(doc, "/b~1c/d~0e")).toBe(5);
    expect(pointer(doc, "/a/1/on")).toBe(false);
    expect(pointer(doc, "/missing")).toBeUndefined();
  });
  it("derives counts", () => {
    expect(derive(doc.a, "len")).toBe(3);
    expect(derive(doc.a, "len:on=true")).toBe(2);
    expect(asText(null)).toBe("null");
  });
});

describe("format", () => {
  it("only changes how a value is written", () => {
    expect(short(882216)).toBe("882K");
    expect(short(2363426)).toBe("2.4M");
    expect(short(653)).toBe("653");
    expect(fixed(null)).toBe("not scored");
    expect(share(0.001)).toBe("0.1%");
    expect(day("2026-10-23T05:57:47+00:00")).toBe("2026-10-23");
    expect(utc("2026-10-23T05:57:47+00:00")).toBe("2026-10-23 05:57 UTC");
  });
});

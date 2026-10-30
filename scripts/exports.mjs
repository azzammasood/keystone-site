// Shared by fetch-data.mjs and the unit tests: validate one export file against the pipeline's
// published JSON Schemas (schemas/, copied from keystone-pipeline contracts/).
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

export function makeValidator(schemaDir) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const f of readdirSync(schemaDir).filter((n) => n.endsWith(".schema.json"))) {
    ajv.addSchema(JSON.parse(readFileSync(join(schemaDir, f), "utf8")), f);
  }
  const err = (v) => ajv.errorsText(v.errors, { separator: "; " }).slice(0, 400);
  // `*_row.schema.json` describes the rows of an export envelope; any other schema the whole file.
  return function validate(schemaName, doc) {
    if (schemaName.endsWith("_row.schema.json")) {
      const env = ajv.getSchema("export_envelope.schema.json");
      if (!env(doc)) return `envelope: ${err(env)}`;
      const row = ajv.getSchema(schemaName);
      if (!row) return `unknown schema ${schemaName}`;
      for (const [i, r] of doc.rows.entries()) if (!row(r)) return `row ${i}: ${err(row)}`;
      if (doc.row_count !== doc.rows.length) return "row_count does not match rows";
      return null;
    }
    const whole = ajv.getSchema(schemaName);
    if (!whole) return `unknown schema ${schemaName}`;
    return whole(doc) ? null : err(whole);
  };
}

export const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

// Check one file named by the index: size, hash, JSON, schema. Returns null when accepted.
export function checkEntry(entry, buf, validate) {
  if (buf.length !== entry.bytes) return `size ${buf.length} != index ${entry.bytes}`;
  if (sha256(buf) !== entry.sha256) return "sha256 does not match the index";
  let doc;
  try {
    doc = JSON.parse(buf.toString("utf8"));
  } catch {
    return "not valid JSON";
  }
  return validate(entry.schema, doc);
}

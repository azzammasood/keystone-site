import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...next,
  ...nextTs,
  { ignores: [".next/**", "out/**", "data/**", "node_modules/**", "docs/design/**", "next-env.d.ts"] },
];
export default config;

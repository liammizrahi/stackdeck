import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  { ignores: ["public/**", "out/**"] },
  {
    files: ["next.config.js"],
    languageOptions: { globals: { process: "readonly" } },
  },
];

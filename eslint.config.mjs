// eslint.config.mjs
import libraryConfig from "@workspace/eslint-config/library.js";

/** @type {import("eslint").Linter.FlatConfigItem[]} */
export default [
  // Base/shared configuration
  libraryConfig,
  // Local configuration overrides
  {
    ignores: ["apps/**", "packages/**"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: true,
    },
  },
];

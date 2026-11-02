import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Incremental lint baseline.
 *
 * Scope is intentionally narrow (server, API bridge, shared contracts and
 * scripts) so the gate can pass today without a repository-wide formatting
 * rewrite. Client code is covered by TypeScript (`npm run check`) and is
 * enrolled file-by-file as it is touched.
 */
export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "artifacts/**",
      "client/public/**",
      "docs/**",
      "**/*.min.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mjs,js}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
  {
    // The client carries a legacy unused-symbol backlog (342 warnings at the
    // time this gate was introduced). `tsc` remains the type authority; the
    // unused-vars rule is enrolled here incrementally rather than failing the
    // whole repository on day one.
    files: ["client/src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);

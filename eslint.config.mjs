import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/fallback-*.js",
    "public/swe-worker-*.js",
    "public/workbox-*.js",
    "public/sw.js",
  ]),
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-console": [
        "error",
        {
          allow: ["warn", "error"],
        },
      ],
      "simple-import-sort/imports": ["error", {
        groups: [
          ["^react", "^next", "^[a-z]", "^@[^/]"],
          ["^@/components", "^@/lib", "^@/providers", "^@/stores", "^@/hooks", "^@/types"],
          ["^\\."],
        ],
      }],
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "error",
    },
  },
]);

export default eslintConfig;

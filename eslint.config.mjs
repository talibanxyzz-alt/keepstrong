import nextConfig from "eslint-config-next";

/** Turn off React Compiler preview rules; keep rules-of-hooks + exhaustive-deps from Next config. */
const reactCompilerRulesOff = Object.fromEntries(
  [
    "static-components",
    "use-memo",
    "component-hook-factories",
    "preserve-manual-memoization",
    "immutability",
    "globals",
    "refs",
    "set-state-in-effect",
    "error-boundaries",
    "purity",
    "set-state-in-render",
    "config",
    "gating",
  ].map((name) => [`react-hooks/${name}`, "off"])
);

const config = [
  ...nextConfig,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/sw.js",
      "public/workbox-*.js",
      "public/fallback-*.js",
      "coverage/**",
      "playwright-report/**",
    ],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
      ...reactCompilerRulesOff,
    },
  },
];

export default config;

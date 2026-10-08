// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      complexity: ["warn", { max: 12 }],
      "max-lines-per-function": [
        "warn",
        {
          max: 120,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    files: ["src/components/animations/**/*.{ts,tsx,js,jsx}"],
    rules: {
      complexity: "off",
      "max-lines-per-function": "off",
    },
  },
  {
    // Temporary complexity debt carve-out for known legacy hotspots.
    // Keep list explicit so debt is trackable and can be burned down incrementally.
    files: [
      "src/api/iconUpload.ts",
      "src/app/profile/page.tsx",
      "src/axios.setup.ts",
      "src/components/IconUploader/IconUploader.tsx",
      "src/components/LocaleSelector/LocaleSelector.tsx",
      "src/components/SavedHaikusList/SavedHaikusList.tsx",
      "src/components/ShareLink/ShareLink.tsx",
      "src/components/ThemeSelector/ThemeSelector.tsx",
      "src/hooks/useAccountLabels.ts",
      "src/hooks/useAuthentication.ts",
      "src/hooks/useHaikuSocket.ts",
      "src/hooks/useWebSocket.ts",
      "src/utils/processImageForUpload.ts",
    ],
    rules: {
      complexity: "off",
      "max-lines-per-function": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...storybook.configs["flat/recommended"]
]);

export default eslintConfig;

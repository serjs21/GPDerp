import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".next/**",
      "coverage/**",
      "generated/**",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "unused-imports/no-unused-imports": "error",
      "no-useless-assignment": "off",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Wallet balances are written only by src/modules/wallet; everyone else calls its functions.
  {
    files: ["src/**/*.ts"],
    ignores: ["src/modules/wallet/**", "**/__tests__/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression > MemberExpression.callee[property.name=/^(create|createMany|createManyAndReturn|update|updateMany|updateManyAndReturn|upsert|delete|deleteMany)$/] > MemberExpression.object[property.name='wallet']",
          message: "Write the Wallet table only through src/modules/wallet/wallet.repository.ts.",
        },
        {
          selector: "Property[key.name='wallet'] > ObjectExpression.value > Property[key.name=/^(create|createMany|connectOrCreate|update|upsert|delete|deleteMany)$/]",
          message: "Write the Wallet table only through src/modules/wallet/wallet.repository.ts.",
        },
      ],
    },
  },

  eslintConfigPrettier,
);

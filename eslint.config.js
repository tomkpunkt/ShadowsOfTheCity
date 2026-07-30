import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "generated/**", "coverage/**", "playwright-report/**", "eslint.config.js"]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off"
    }
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_"
        }
      ]
    }
  }
);

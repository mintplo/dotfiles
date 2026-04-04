return {
  "stevearc/conform.nvim",
  opts = {
    formatters_by_ft = {
      python = {
        "ruff_fix",
        "ruff_format",
        "ruff_organize_imports",
      },
      -- JS/TS formatting is handled by LazyVim extras:
      -- linting.eslint and lang.typescript.biome auto-activate
      -- based on project config files (eslint.config.*, biome.json)
    },
  },
}

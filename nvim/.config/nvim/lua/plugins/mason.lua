return {
  "mason-org/mason.nvim",
  opts = {
    ensure_installed = {
      -- Lua
      "lua-language-server",
      -- Python (extras handle basedpyright + ruff)
      "debugpy",
      -- JS/TS (extras handle ts_ls, eslint-lsp, biome)
      "prettier",
      "eslint_d",
    },
  },
}

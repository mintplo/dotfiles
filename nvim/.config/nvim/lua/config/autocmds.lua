-- Autocmds are automatically loaded on the VeryLazy event
-- Default autocmds that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/autocmds.lua

-- Auto-reload files changed outside Neovim (e.g. by Claude Code)
vim.opt.autoread = true
vim.api.nvim_create_autocmd({ "FocusGained", "BufEnter", "CursorHold", "CursorHoldI" }, {
  pattern = "*",
  callback = function()
    if vim.fn.mode() ~= "c" then
      vim.cmd("checktime")
    end
  end,
  desc = "Auto-reload files changed externally",
})

-- Disable comment continuation on new line
vim.api.nvim_create_autocmd("FileType", {
  pattern = "*",
  callback = function()
    vim.opt.formatoptions:remove({ "c", "r", "o" })
  end,
  desc = "Disable New Line Comment",
})

-- Disable spell check and diagnostics for markdown
vim.api.nvim_create_autocmd("FileType", {
  pattern = "markdown",
  callback = function(args)
    vim.opt_local.spell = false
    vim.diagnostic.enable(false, { bufnr = args.buf })
  end,
  desc = "Disable spell check and diagnostics in markdown files",
})

local js_filetypes = {
  javascript = true,
  javascriptreact = true,
  typescript = true,
  typescriptreact = true,
  ["javascript.jsx"] = true,
  ["typescript.tsx"] = true,
}

vim.api.nvim_create_autocmd("BufWritePre", {
  group = vim.api.nvim_create_augroup("JsBiomeEslintFormat", { clear = true }),
  callback = function(args)
    if not js_filetypes[vim.bo[args.buf].filetype] then
      return
    end

    if not LazyVim.format.enabled(args.buf) then
      return
    end

    local ok, conform = pcall(require, "conform")
    if not ok or not conform.get_formatter_info("biome-check", args.buf).available then
      return
    end

    if #vim.lsp.get_clients({ bufnr = args.buf, name = "eslint" }) == 0 then
      return
    end

    conform.format({
      bufnr = args.buf,
      async = false,
      lsp_format = "never",
      quiet = true,
      formatters = { "biome-check" },
    })

    vim.lsp.buf.format({
      bufnr = args.buf,
      async = false,
      timeout_ms = 20000,
      filter = function(client)
        return client.name == "eslint"
      end,
    })
  end,
})

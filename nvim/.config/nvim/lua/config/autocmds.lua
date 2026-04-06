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

-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua

-- Delete without overwriting clipboard
vim.keymap.set("n", "d", '"_d')
vim.keymap.set("v", "d", '"_d')

-- Close buffer
vim.keymap.set("n", "<C-b>", "<cmd>:bd<CR>", { desc = "Close buffer" })

-- Disable macro recording
vim.keymap.set("n", "q", "")

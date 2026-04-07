return {
  "carderne/pi-nvim",
  lazy = false,
  config = function()
    require("pi-nvim").setup()
  end,
  keys = {
    { "<leader>p", ":Pi<CR>", mode = { "n", "v" }, desc = "Send to Pi" },
    { "<leader>pp", ":PiSend<CR>", desc = "Pi: Send prompt" },
    { "<leader>pf", ":PiSendFile<CR>", desc = "Pi: Send file" },
    { "<leader>ps", ":PiSendSelection<CR>", mode = "v", desc = "Pi: Send selection" },
    { "<leader>pb", ":PiSendBuffer<CR>", desc = "Pi: Send buffer" },
    { "<leader>pi", ":PiPing<CR>", desc = "Pi: Ping" },
  },
}

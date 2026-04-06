local wk = require("which-key")
wk.add({
  { "<leader>/", desc = "Toggle Comment lines" },
})

return {
  "nvim-mini/mini.comment",
  event = "VeryLazy",
  opts = {
    mappings = {
      comment = "<leader>/",
      comment_line = "<leader>/",
      comment_visual = "<leader>/",
      textobject = "<leader>/",
    },
  },
}

local snacks = require("snacks")

return {
  "snacks.nvim",
  opts = {
    picker = {
      win = {
        input = {
          keys = {
            ["<a-r>"] = { "toggle_regex", mode = { "i", "n" } },
          },
        },
      },
      sources = {
        files = {
          hidden = true,
          ignored = true,
        },
        grep = {
          hidden = true,
          ignored = true,
        },
        explorer = {
          hidden = true,
          ignored = true,
          win = {
            list = {
              keys = {
                ["<c-y>"] = "explorer_yank_filename",
              },
            },
          },
        },
      },
      previewers = {
        diff = {
          builtin = false,
          cmd = { "delta" },
        },
        git = {
          builtin = false,
          args = { "-c", "core.pager=delta" },
        },
      },
      actions = {
        explorer_yank_filename = function(picker)
          local items = picker:selected({ fallback = true })
          if #items > 0 then
            local filenames = {}
            for _, item in ipairs(items) do
              table.insert(filenames, vim.fn.fnamemodify(item.file, ":t"))
            end
            local value = table.concat(filenames, "\n")
            vim.fn.setreg("+", value)
            snacks.notify.info("Copied " .. #filenames .. " filename(s)")
          end
        end,
      },
    },
  },

  keys = {
    {
      "<leader><space>",
      function()
        snacks.picker.smart({
          hidden = true,
          ignored = true,
        })
      end,
      desc = "Find Files (Root Dir)",
    },
    {
      "<leader>ff",
      function()
        snacks.picker.smart({
          hidden = true,
          ignored = true,
        })
      end,
      desc = "Find Files",
    },
    {
      "<leader>sg",
      function()
        snacks.picker.grep({
          hidden = true,
          ignored = true,
          regex = false,
        })
      end,
      desc = "Grep",
    },
    {
      "<leader>fe",
      function()
        snacks.explorer({
          cwd = LazyVim.root(),
          hidden = true,
          ignored = true,
        })
      end,
      desc = "Explorer Snacks (root dir)",
    },
    {
      "<leader>fE",
      function()
        snacks.explorer({
          hidden = true,
          ignored = true,
        })
      end,
      desc = "Explorer Snacks (cwd)",
    },
    {
      "<leader>e",
      function()
        snacks.explorer({
          cwd = LazyVim.root(),
          hidden = true,
          ignored = true,
        })
      end,
      desc = "Explorer Snacks (root dir)",
    },
    {
      "<leader>E",
      function()
        snacks.explorer({
          hidden = true,
          ignored = true,
        })
      end,
      desc = "Explorer Snacks (cwd)",
    },
    {
      "<leader>ba",
      function()
        snacks.bufdelete.all()
      end,
      desc = "Delete all buffers",
    },
  },
}

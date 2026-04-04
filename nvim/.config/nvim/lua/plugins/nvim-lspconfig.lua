return {
  "neovim/nvim-lspconfig",
  opts = {
    servers = {
      basedpyright = {
        settings = {
          basedpyright = {
            disableOrganizeImports = true,
            analysis = {
              autoImportCompletions = true,
              autoSearchPaths = true,
              useLibraryCodeForTypes = true,
              diagnosticMode = "openFilesOnly",
              inlayHints = {
                callArgumentNames = false,
              },
            },
            venvPath = "./",
            venv = ".venv",
            importFormat = "absolute",
          },
        },
      },
    },
  },
}

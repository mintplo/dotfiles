import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

// cmux integration for Pi agent:
// - Updates sidebar status ("Running" / "Idle") as Pi works
// - Fires a cmux notification when Pi goes idle (waiting for input)
//
// Requires manaflow-ai/cmux to be installed and Pi to be running inside it.
// Silently no-ops if cmux is not available.

export default function (pi: ExtensionAPI) {
  async function runCmux(args: string[]) {
    try {
      await pi.exec("cmux", args, { timeout: 1500 });
    } catch {
      // cmux not available or not running — ignore
    }
  }

  pi.on("agent_start", async () => {
    await runCmux(["set-status", "pi", "Running"]);
  });

  pi.on("agent_end", async (_event, ctx) => {
    await runCmux(["set-status", "pi", "Idle"]);

    // Only notify when Pi is truly waiting for input, not mid-stream.
    if (!ctx.isIdle()) return;

    await runCmux(["notify", "--title", "Pi", "--body", "Waiting for input"]);
  });

  pi.on("session_end", async () => {
    await runCmux(["clear-status", "pi"]);
  });
}

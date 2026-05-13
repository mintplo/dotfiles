---
name: lazyweb
description: Use Lazyweb through MCPorter for UI inspiration, design research, pricing/onboarding/product-flow references, screenshots, comparisons, and design feedback against real apps.
version: 1.1.0
tags:
  - design-research
  - ui-references
  - screenshots
  - mcporter
---

# Lazyweb

Use this skill when the user asks for UI inspiration, design research, app screenshots, product flow examples, onboarding patterns, pricing or paywall examples, competitive UI references, or feedback on an existing interface.

Lazyweb gives Pi access to real product screenshots and design patterns through the `mcp` tool backed by MCPorter.

## Pi MCPorter Tool

Use the generic `mcp` tool for Lazyweb database access:

- List configured MCP servers: `mcp({})`
- List Lazyweb tools: `mcp({ server: "lazyweb" })`
- Check connectivity/auth: `mcp({ call: "lazyweb.lazyweb_health", args: {} })`
- Search screenshots: `mcp({ call: "lazyweb.lazyweb_search", args: { query: "pricing page", limit: 10 } })`
- Find similar screenshots: `mcp({ call: "lazyweb.lazyweb_find_similar", args: { screenshot_id: 123, limit: 10 } })`
- Compare an image: `mcp({ call: "lazyweb.lazyweb_compare_image", args: { image_url: "https://...", limit: 10 } })`

The `mcp` tool is enabled by default for this dotfiles setup. If it is disabled, ask the user to run `/mcp on`. Use `/mcp status` or `/mcp refresh lazyweb` when debugging MCP configuration.

## Token Handling

The Lazyweb bearer token is a free no-billing token for UI reference tools. It does not authorize purchases, paid spend, private user data, or destructive actions.

MCPorter reads `LAZYWEB_MCP_TOKEN` from the mcporter extension-local `.env` file:

```text
~/.pi/agent/extensions/mcporter/.env
```

Do not write the token into tracked repo files. Do not commit it to public git history.

## When To Use

- Before creating a landing page, app screen, onboarding flow, checkout, pricing page, dashboard, settings page, or mobile app UI.
- When asked to compare a design against real products.
- When asked to improve a screenshot or produce design recommendations.
- When a coding agent needs concrete UI examples instead of generic visual guesses.

## When Not To Use

- Backend-only tasks.
- Database schema work.
- Legal, medical, finance, or non-design research.
- Generic code cleanup with no UI or product-design component.

## Search Workflow

1. Run `mcp({ call: "lazyweb.lazyweb_health", args: {} })` unless Lazyweb connectivity was already verified in the session.
2. Run `lazyweb.lazyweb_search` 2–4 times through `mcp` with different concrete phrasings.
   - Example: `mcp({ call: "lazyweb.lazyweb_search", args: { query: "pricing page with plan cards", platform: "desktop", limit: 10 } })`
   - Example: `mcp({ call: "lazyweb.lazyweb_search", args: { query: "mobile onboarding progress checklist", platform: "mobile", limit: 10 } })`
3. Read each result's `visionDescription` before using it as evidence.
4. Prefer fewer, directly relevant references over many loose matches.
5. If a user asks for “more like this”, use `lazyweb.lazyweb_find_similar` through `mcp`.
6. If a user provides an existing screenshot or URL, use `lazyweb.lazyweb_compare_image` through `mcp` when appropriate.

## Reporting Guidance

When producing a reference report:

- Save durable output under `.lazyweb/<topic-or-task>/` when the user asks for files or a reusable report.
- Download referenced screenshots locally before putting them in committed or shared reports; avoid relying on expiring signed URLs.
- Group references by pattern, not just by company.
- Label provenance as `[Lazyweb]`.
- Summarize what the references have in common and how the pattern applies to the user's product.

Use Lazyweb for design evidence, not vibes.

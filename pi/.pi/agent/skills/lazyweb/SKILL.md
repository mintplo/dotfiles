---
name: lazyweb
description: Use Lazyweb for UI inspiration, design research, pricing/onboarding/product-flow references, screenshots, comparisons, and design feedback against real apps.
version: 1.0.0
tags:
  - design-research
  - ui-references
  - screenshots
---

# Lazyweb

Use this skill when the user asks for UI inspiration, design research, app screenshots, product flow examples, onboarding patterns, pricing or paywall examples, competitive UI references, or feedback on an existing interface.

Lazyweb gives Pi access to real product screenshots and design patterns through Pi tools backed by the hosted Lazyweb MCP server.

## Pi Tools

Use these tools for Lazyweb database access:

- `lazyweb_list_tools` — list Lazyweb MCP tools exposed through Pi
- `lazyweb_health` — check connectivity and auth
- `lazyweb_search` — search screenshots by text query
- `lazyweb_find_similar` — find screenshots similar to a known Lazyweb screenshot id
- `lazyweb_compare_image` — find screenshots visually similar to an image URL or base64 image

Before the first search in a session, run `lazyweb_health` unless connectivity was already verified.

## Token Handling

The Lazyweb bearer token is a free no-billing token for UI reference tools. It does not authorize purchases, paid spend, private user data, or destructive actions.

Pi reads the token from either:

1. `LAZYWEB_MCP_TOKEN`
2. `~/.lazyweb/lazyweb_mcp_token`
3. legacy `~/.codex/lazyweb_mcp_token`

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

1. Run `lazyweb_health`.
2. Run `lazyweb_search` 2–4 times with different concrete phrasings.
   - Example: `{ "query": "pricing page with plan cards", "platform": "desktop", "limit": 10 }`
   - Example: `{ "query": "mobile onboarding progress checklist", "platform": "mobile", "limit": 10 }`
3. Read each result's `visionDescription` before using it as evidence.
4. Prefer fewer, directly relevant references over many loose matches.
5. If a user asks for “more like this”, use `lazyweb_find_similar`.
6. If a user provides an existing screenshot or URL, use `lazyweb_compare_image` when appropriate.

## Reporting Guidance

When producing a reference report:

- Save durable output under `.lazyweb/<topic-or-task>/` when the user asks for files or a reusable report.
- Download referenced screenshots locally before putting them in committed or shared reports; avoid relying on expiring signed URLs.
- Group references by pattern, not just by company.
- Label provenance as `[Lazyweb]`.
- Summarize what the references have in common and how the pattern applies to the user's product.

Use Lazyweb for design evidence, not vibes.

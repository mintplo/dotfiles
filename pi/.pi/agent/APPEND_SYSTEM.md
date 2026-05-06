## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.
- When the user's request is ambiguous or has multiple valid interpretations, use the `question` tool before proceeding.
- Use the `question` tool proactively to clarify scope, preferences, constraints, and tradeoffs before making large changes.
- Do all non-blocked exploration first, then ask exactly one focused question if needed.
- Do not use the `question` tool for trivial decisions you can safely default.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- No comments that restate what code does. Use descriptive names and small functions instead.
  Extract complex conditions into well-named variables. If a comment is needed, the code isn't clear enough.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Code Search Strategy

**Use precise tools first. `rg`/broad browsing is a fallback, not the first move.**

### Decision Tree

1. **Know the symbol name** → `search_symbols`.
2. **Need a high-level map** → `project_map`.
3. **Know a file/path fragment** → `find` or `fuzzy_search` with `target="files"`.
4. **Know exact text or an identifier** → `rg` tool with a short literal pattern.
5. **Need OR logic across naming variants** → `multi_grep`.
6. **Need typo-tolerant file/content discovery** → `fuzzy_search` with `target="auto"`.
7. **Have a symbol/location and need semantics** → `goto_definition`, `find_references`, `hover_info`.
8. **Need file errors** → `get_diagnostics`.
9. **Need current external information** → `web_search`, then `web_fetch` for primary sources.

### search_symbols

- **First search: OMIT the kind filter.** Don't guess if it's a class, function, or method.
  - ✅ `search_symbols("ReviewCycleEditor")` → finds the class immediately
  - ❌ `search_symbols("ReviewCycleEditor", kind="function")` → misses it if it's a class
- Add `kind` only to narrow down when too many results come back.
- Use short, exact symbol names. Partial match works, but shorter is better.
- If the tool reports that universal-ctags is missing, fall back to `rg`/`multi_grep` and tell the user to run `brew install universal-ctags`.

### rg / grep / multi_grep / fuzzy_search

- Prefer the `rg` tool for exact content search. Do not run shell `grep`.
- Use `multi_grep` for snake_case / camelCase / PascalCase variants in one call.
- Use `fuzzy_search` only when you are unsure whether the match is in a path or content, or when typos are likely.
- Keep queries short. Start broad enough to match, then narrow.
- Use path/constraints instead of shell pipelines when possible.

### LSP Tools

- Use `goto_definition` when you have a file location or symbol and need the implementation.
- Use `find_references` before changing public APIs or renaming symbols.
- Use `hover_info` for type signatures and documentation.
- Use `get_diagnostics` to verify file-level errors after meaningful changes.

### Web Search

- Use `web_search` only for current external facts, docs, release notes, API behavior, or user-requested web research.
- DuckDuckGo works without an API key. Force it with `provider="duckduckgo"` when the user asks for DuckDuckGo specifically.
- Prefer source links from official docs, changelogs, repositories, or vendor pages.
- Use `web_fetch` to read important result URLs before citing details.

### Fullstack Search: Don't Assume Frontend or Backend

- When the user mentions a domain concept, search across the entire codebase first.
- Don't assume FE or BE. The same name can exist in Python and TypeScript.
- If `search_symbols` finds it in one layer, check if there's a counterpart in the other.

### Know When to Stop Exploring

- For exploration requests, once you find the direct answer, summarize what you found and ask if deeper exploration is wanted.
- Don't explore every transitive dependency, every caller, every related service just because they exist.
- A good heuristic: if the question can be answered with what you've already read, stop reading more files.
- Present findings in layers: core answer first, then related notes for deeper context.

### Never

- Read files one by one hoping to find something.
- Use shell `grep`; use `rg` or the search tools.
- Use `bash cat` to read files when `read` exists.
- Apply narrow filters on the first search attempt unless you are certain.

## 6. Environment Rules

- `edit`/`write` tools auto-format and run LSP diagnostics. Don't re-run formatters or diagnostics on files you just modified unless verification requires it.
- Run Python with `uv run python` (not `python` or `python3`).
- Use ripgrep syntax for shell searches when needed: `rg -t py "pattern"` or `rg -g '*.py' "pattern"`.
- Do not use shell `grep`. Use `rg`, `multi_grep`, or `fuzzy_search`.

## 7. Context Economy

**Every turn's cost scales with total context size. Keep context small.**

- After `edit`, trust its output — it already contains the updated file content.
- After `edit`/`write`, trust the auto-diagnostics — they already run automatically.
- When using `read`, use `offset`/`limit` to fetch only the relevant section.
- When command output may be long, pipe through `head -50` or `tail -20`.
- If you've read the same file 3+ times in one conversation, rethink your approach.

## 8. Mermaid Rules

- When writing Mermaid diagrams, use English labels only inside Mermaid source.
- Keep Mermaid node, participant, and note labels short. Put detailed Korean explanation outside the diagram.

## 9. Language Preference

- Use Korean for natural-language output by default.
- When the model exposes thinking/reasoning content, produce that in Korean too.
- Keep code, commands, file paths, URLs, API names, and identifiers in their original form unless the user explicitly asks for translation.
- If the user explicitly asks for another language, follow the user's request.

# Release Notes Guide

> For the commit message convention (types, scopes, examples), see `dev/COMMITS.md`.
> Scopes used in release notes can be **rewritten** from the committed scope when a more editorial scope fits better (e.g. `feat(portal)` touching `robots.txt` → published as `**seo:**`).

## Release Notes Format

Release notes are published as GitHub Releases.

### Categories

Listed in order, include only non-empty sections:

| Category | Emoji | When to use |
|----------|-------|-------------|
| Highlights | — | Narrative summary for major releases or significant new features (e.g., introduction of a new subsystem) |
| Breaking Changes | 🛠 | Changes that require user action |
| Features | 🚀 | New capabilities, options, elements |
| Bug Fixes | 🔧 | Resolved issues (don't repeat the word "fix") |
| Code Refactoring | 🔬 | Internal restructuring |
| Performance | ⚡ | Performance improvements |
| Chores | 🔧 | Only significant ones (skip CI cleanup, WIP, trivial tweaks) |
| Reverts | 🔄 | Rolled-back changes |

### Entry Format

```markdown
- **scope:** description
```

### Sorting Rules

1. Sort entries by scope
2. Within `page-element` scope: new elements first (prefixed with ✨), then configuration changes
3. Within other scopes: `add` entries first, then other verbs

### Special Prefixes

| Prefix | When to use |
|--------|-------------|
| ✨ | New page-element type |
| 🔥 | Major feature, big refactor, or significant change |

### PR References

When a commit references a pull request, add a link at the end:

```markdown
- **portal:** add search engine ([#37](https://github.com/data-fair/portals/pull/37))
```

### Bug Fixes Guidelines

- Don't repeat "fix" — the section title already says Bug Fixes
- Describe what was wrong, not what you did
- Skip fixes for bugs introduced after the last release (if you add a feat and fix it before the next release, only mention the feat)

### Example

```markdown
## Highlights

🔥 **Feature name:** Narrative description of a major change.

## 🚀 Features

- ✨ **page-element:** add icon element
- **page-element:** add options to card element ([#29](https://github.com/data-fair/portals/pull/29))
- 🔥 **portal:** first version of portal search engine ([#37](https://github.com/data-fair/portals/pull/37))
- **portal:** add PWA install action button on mobile ([#34](https://github.com/data-fair/portals/pull/34))
- **seo:** add JSON-LD structured data ([#33](https://github.com/data-fair/portals/pull/33))

## 🔧 Bug Fixes

- **portal:** image processing errors with pixel limit enforcement
- **portal:** Elasticsearch errors ([#38](https://github.com/data-fair/portals/pull/38))

## 🔬 Code Refactoring

- 🔥 **portal:** restructure pages management ([#27](https://github.com/data-fair/portals/pull/27))
```

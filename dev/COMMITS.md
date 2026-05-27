# Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commits are validated by [commitlint](https://commitlint.js.org/) via a Husky `commit-msg` hook.

## Format

```
type(scope): description
```

## Types

| Type | Description |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `chore` | Maintenance task (CI, configs, cleanup) |
| `design` | Visual/UI design change |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `build` | Build system or external dependencies |
| `revert` | Revert a previous commit |

## Scopes

The allowed scopes are enforced by `commitlint.config.ts` (`scope-enum`, level `2`/error). Any scope outside this list **rejects the commit**.

| Scope | Usage |
|-------|-------|
| `api` | Backend API changes |
| `ui` | UI component library (portals-manager) |
| `portal` | Nuxt SSR portal (pages, layouts, middleware) |
| `portal-config` | Portal configuration schema and superadmin options (header, footer, navbar, theme, advanced toggles like `md2Compat`) |
| `page-element` | Page element components and their schemas (cards, topics list, etc.) |
| `types` | Shared type definitions |
| `deps` | Dependency updates |
| `analytics` | Analytics/tracking (Matomo, Piano, page-tracking config) |
| `reuses` | Content reuse system |
| `seo` | SEO improvements (`robots.txt`, `sitemap.xml`, `.well-known/*`, structured data, crawl rules) |

### Scope is editorial, not mechanical

Pick the scope from the **intent** of the change, not from the directory you touched. A few non-obvious cases:

| Change | Scope | Not |
|--------|-------|-----|
| `portal/server/api/robots.txt.ts`, `sitemap.xml`, `.well-known/*` | `seo` | `portal` |
| Analytics config option in `portal/` (Matomo/Piano paths, tracking flags) | `analytics` | `portal` |
| Card components, page-element schemas in `portal/` | `page-element` | `portal` |
| Header/footer/navbar/theme config, superadmin advanced toggles | `portal-config` | `portal` |
| Test file covering a feature (e.g. `tests/features/.../seo-indexing.e2e.spec.ts`) | the feature scope (e.g. `seo`) | `tests` (not in the enum) |

### When to omit the scope

Scope is **optional** (`scope-empty` is level `1`/warning — the commit passes, but commitlint prints a warning).

Prefer splitting a change into several commits, each with its own scope, when it crosses workspaces in a separable way. **Omit the scope only when the change genuinely has no dominant scope** — e.g. a cross-cutting `chore` touching docker, root configs and dev tooling at once. The warning is then expected and can be ignored.

## Examples

```
feat(portal): fallback to summary on cards when image is missing
fix(seo): emit /event/:slug (singular) in sitemap
chore: unify dev environment with data-fair conventions
```

## Release notes

Once merged, commits feed the release notes — see `RELEASES.md` for the release format and category mapping (scopes can be **rewritten** in the release note when the editorial scope differs from the committed one).

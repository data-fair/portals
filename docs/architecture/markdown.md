# Markdown fields

A markdown field of a portal or page configuration is a source field (`layout: 'markdown'`) next
to a `*_html` field (`$ref: common-defs#/$defs/rendered-html`). The API renders the HTML on write
only, in `renderPortalConfigMarkdown()` (`api/src/portals/service.ts`) and
`renderMarkdownElements()` (`api/src/pages/service.ts`), with `renderMarkdown()` of
`shared/markdown`. The portal displays the stored `*_html` and never renders markdown itself.

- Write `x_html = x ? renderMarkdown(x) : undefined`, not `if (x) { x_html = renderMarkdown(x) }`:
  the editor sends back the `x_html` of the last save, so the `if` form keeps showing the old HTML
  after the source field is emptied.
- Making an existing field markdown needs an upgrade script (`upgrade/X.Y.Z/`) to fill its
  `*_html`, otherwise the content of portals and pages not saved again disappears. A new field
  does not.
- The editor preview does not refetch after `saveDraft`: render the markdown client side, as
  `ui/src/components/page/page-preview-element.vue` does.
- Stored HTML rendered with older versions of `@data-fair/lib-utils` coexists with new HTML, so
  the paragraph margins of `shared/markdown/style.css` serve both markups (see its compat rule).

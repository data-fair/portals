# Pages of the portals

How the pages of the data portals work: their model (draft and live content, owners, portals), who may do what, the page types, groups, images, and the behaviour of the content blocks that the schemas do not tell. How to fill the editor form (describeState, setFieldValue, editArray, saveForm…) is in the `portals-page-config` skill; the configuration of a portal itself (theme, menu, header, footer, iframe sources) is in `portals-config`.

## The model

- A page belongs to an **owner**: an account (organization or user), optionally one department of an organization. A page created with **portals_create_page** belongs to the active account (and department) of the session; **portals_transfer_page** gives it, with its images, to another owner.
- A page has a **live** configuration and a **draft** one. The portals_page_config tools edit the draft and save it whole; **portals_publish_page** copies the draft to the live configuration; **portals_cancel_page_draft** puts the live configuration back in the draft. The draft is never shown to visitors.
- A page is shown on a portal only when it is **attached** to it (**portals_attach_page_to_portals**) **and published**. Attaching does not publish the draft, publishing does not attach. The two are independent: say which one remains.
- A portal shows only the pages whose owner is the portal's account (organization or user; the department may differ). A portal in staging mode shows the pages whose publication is **requested** on it instead of the attached ones.
- **portals_attach_page_to_portals** and **portals_request_page_publication** take the whole list of portal ids: read the current `portals` / `requestedPortals` with **portals_get_page**, add or remove an id, send the full list back.
- **portals_update_page** only renames the page in the back-office lists (an empty title follows the title of its configuration); the visitors see `title` of the configuration.
- **portals_list_pages** lists the pages of the active account only, department included: a page missing from the list can exist in another department; **portals_get_page** reads it by id when the session has a role on its owner.
- Duplicate a page with `sourcePageId` on **portals_create_page**: its blocks are copied with fresh uuids and its images duplicated.
- **portals_delete_page** removes the page from every portal and deletes its images.

### Typical sequence

1. Find the portal (**portals_list_portals**) and the existing pages (**portals_list_pages**, filter on type, or search with `q`).
2. **portals_create_page** with `type` and `config.title` (or edit an existing page).
3. Build the content with the portals_page_config tools, starting with **portals_page_config_describeState**, saved with **portals_page_config_saveForm**.
4. Check the result with **portals_preview_portal_page**: it renders the draft of the page as the page editor previews it (blocks with the theme of one of its portals, without header and footer, catalogs with placeholder items), or with draft=false the published page on the portal. A page attached to no portal, nor requested on one, cannot be previewed. Before reporting what you could not check, run the checks your tools can do: the published page with its header (draft=false), whether a page a link or a button leads to is published (**portals_get_page**, then preview it), whether the datasets it shows are public (**datafair_list_account_datasets**). List as unchecked only what no tool can show.
5. **portals_publish_page**, then **portals_attach_page_to_portals** (or **portals_create_page_on_portals** to create it attached at once). A contributor asks instead with **portals_request_page_publication**; a portal administrator accepts by attaching it, then removes the portal from `requestedPortals` with **portals_request_page_publication** (attaching does not clear the request).

## Roles and token tiers

What the person's role on the owner allows (a scoped token never adds a right, it only narrows them):

| Action | Role needed |
| --- | --- |
| Read a page, edit and save its draft, publish or discard the draft, request its publication | admin or contrib of the page's owner |
| Create a page, attach it to portals, delete it | admin of the page's owner |
| Transfer a page | admin of the current **and** of the new owner |
| Create, edit, delete a group | admin of the group's owner |

- A department is an owner of its own: an admin of department `a` has no right on the pages of department `b`. A role at the organization level (no department) covers every department.
- A portal owned by the organization root can name `contributorDepartments`: the administrators of these departments publish on it as if they owned it. Otherwise, a page of another department reaches the portal through a publication request accepted by the portal's administrators, or through a transfer of the page.
- "requires admin role(s)" or "requires admin, contrib role(s)" means the right endpoint with the wrong role for this owner, not a wrong call.

An agent's token has a tier per family, and the tools offered follow it:

- the **write** tier *prepares*: create pages and groups, edit drafts (portals_page_config tools, **portals_update_page**, **portals_update_group**), upload images, discard drafts;
- the **admin** tier *puts live or changes hands*: **portals_publish_page**, **portals_attach_page_to_portals**, **portals_create_page_on_portals**, **portals_request_page_publication**, **portals_transfer_page**, **portals_delete_page**, **portals_delete_group**.

With a write-tier token, prepare everything, then tell the person exactly what remains for them to do: publish the draft of page *X* (id), attach it to portal *Y* (id), request its publication, transfer it… Never claim a page is online when only its draft was saved.

A tier is what **your token** may do, not the role a person needs: a contributor of the page's owner can publish its draft and request its publication, only attaching needs an administrator (table above). The conversation's state may give the role of the person you talk to (`person-role`): tell them which steps they can do themselves. Their real permissions can be finer than that role, so never tell them they cannot; without it, say who can do each step.

Handing over to a person, name where they do it in the back-office, with the link: the page's screen, `<site>/portals-manager/pages/<id>`, with the address of the `site` fact of the conversation's state (else the address of the **Page URL** of portals_preview_portal_page), as a full link, where:

- « Aperçu (brouillon) » shows the draft;
- « Valider le brouillon », in the actions panel on the right, publishes the draft (« Annuler le brouillon » discards it);
- the « Publications » tab attaches the page to portals, or requests its publication.

## Page types

- `generic` (free page): has `genericMetadata.slug` and optionally `genericMetadata.group`. Its address is `/pages/<slug>`, or `/pages-<group slug>/<slug>` in a group (the address the menus and links generate; give that one).
- `event` and `news`: `eventMetadata` / `newsMetadata` with their slug, shown in the event and news catalogs.
- **Standard pages**, one per type and per portal, at fixed addresses: `home` (`/`), `contact`, `accessibility`, `terms-of-service`, `legal-notice`, `privacy-policy`, `cookie-policy` (`/<type>`), `datasets`, `applications`, `reuses` (`/<type>`), `event-catalog` (`/event`), `news-catalog` (`/news`).

Slugs (generic, event, news) are **unique per owner** (type and id, all departments and portals together) on the **live** configuration: a duplicate slug saves fine in a draft, and the 409 naming the conflict comes at **portals_publish_page** (or at **portals_create_page**, whose configuration is live at once). When an organization has several portals, give distinct slugs. Without a slug, one is generated from the title, already unique.

### Standard pages

- Attaching a standard page to a portal (**portals_attach_page_to_portals** or **portals_create_page_on_portals**) **detaches the page of the same type** already on that portal, at once and silently.
- A `home` page can never be removed from a portal it is attached to ("You cannot unpublish home page"): it can only be replaced by another home page. **Never attach a test home page to a production portal.**
- A portal created through the API has no standard page: `/datasets` answers "Page not found" until a `datasets` page is attached (`portals-config`). Created with no blocks, the catalog types (`datasets`, `applications`, `reuses`, `event-catalog`, `news-catalog`) get their default catalog block; the other types start empty.
- Breadcrumbs are never shown on the home page, whatever `showBreadcrumbs` says.
- Every page supports `description` (meta description, social cards) and `thumbnail` (sharing image, an uploaded image).

### Groups and breadcrumbs

A free page joins a group through `genericMetadata.group`: `{ _id, title, slug }` of a group read with **portals_list_groups** (group suggestions do not work in editor sessions: set the object yourself). Create one with **portals_create_group**.

The breadcrumb of the group's pages goes up to the group's **`rootPage`**, which is a **page slug**, not an id. Set it with **portals_update_group** (its `title` is required in the body): the server copies `rootPage` and the title into every page of the group. A breadcrumb that does not go up to the listing page almost always means `rootPage` is missing on the group.

## Images

- Upload with **portals_upload_image**, `resource: { type: 'page', _id: <page id> }`, after the page exists. Put the answer's `{ _id, name, mimeType }` in the image field (`thumbnail`, an `image` block, a card thumbnail…), with **`mobileAlt: false`**: the portal then serves the same image on mobile. `mobileAlt: true` makes the portal load a `<id>-mobile` variant, which exists only when the upload answered `mobileAlt: true` (images wider than ~1536 px); a reference with `mobileAlt: true` and no variant is a broken image.
- The session's active account must be **exactly** the page's owner (type, id and department), else "404 linked page not found".
- An image reference resolves **only from the page it was uploaded for**: never copy one into another page or portal (404 there). Re-upload it, or use an absolute `url` in an `image` block. **portals_transfer_page** moves the images with the page; a duplication copies them.
- SVG uploaded as `image/svg+xml` is stored as is (sharp at any size, the answer says width and height 0: compute the block height from its viewBox); every other format is converted to webp. Prefer SVG for logos and pictograms. An animated GIF becomes an animated webp whose announced height stacks all frames.
- There is no image deletion: publishing or discarding the draft removes from the page's media library every image that neither configuration references any more.

## Content blocks

The schema gives every field, its values and its constraints (portals_page_config_describeState). What it does not say:

- **Every block** has a `uuid` (hidden in the form): give each new block a short unique random string. Most blocks have `mb` (bottom margin, 0–16, default 4); `title` and `divider` have none: to space below a title, insert an empty `text` block carrying the `mb`.
- **Server-computed properties**: at each save the server renders the markdown of `text` and `alert` blocks to `_html`, computes `anchor._slug` of anchored titles and the table of contents `_toc`. Never write them; sending back what was read is fine.
- **Unknown keys**: an unknown top-level key of the page configuration is refused (400 naming it); an unknown property of a block is dropped by the save. There is no page-level `toc` option.
- **`text` / `alert`**: sanitized markdown (headings, lists, tables, bold, links, images, code, quotes). `<iframe>`, `<script>`, `<video>`, `style=""` and `<details>` are removed: embed with the `application` or `iframe` blocks. Prefer `title` blocks to markdown `#` headings, whose size and margins cannot be set. Mermaid fences in a `text` block stay raw code. `alertType: 'none'` lets you choose `icon` and `color`.
- **`title`**: `titleSize` (the look, `h1`…`h6`) and `titleTag` (the HTML tag, `h1`…`h6` or `div`) are independent. The portal renders its own title as an `<h1>` when its header shows it (`header.show && header.showTitle && !header.logoPrimaryCentered` in the portal configuration, readable with **portals_portal_config_getData**; ask the person when you cannot read it): then use `titleTag: 'h2'` for the page title to keep one `<h1>`. A `line` needs a `line.color`, or no line is drawn. A `link` with an `icon` makes a "text + arrow" link (the icon comes before the text).
- **Table of contents**: enabled title by title with `anchor: { enabled: true, inToc: true, label? }`; one title in it is enough to show it. Write `inToc` explicitly (`true` or `false`). Anchor H2/H3 titles, not the page's H1.
- **Full width**: `fluid: true` on the page configuration (not on the portal, not on a block). On a fluid page the table of contents becomes a floating button with a side gutter; for a wide page without one (dashboard, embedded application), set `inToc: false` on every anchored title and check that `_toc` is empty after the save. `banner.fullWidth` / `image.banner` only extend a block's background to the edges.
- **`image`**: `height` on a wide image crops it to that ratio. The content column is ~896 px wide: `height ≈ 896 × image height / image width`. For a very wide band (ratio above ~2.5) use `cover: true` without `height`; `cover: true` without `height` keeps the ratio, it crops nothing. `title` is the alt text; `isPresentation` marks a decorative image.
- **`button`**: `link` is a link item (`external` with `href`, `standard` with `subtype`, `generic` with `pageRef { slug, title, group? }`, `event`, `news`). Page link suggestions do not work in editor sessions: read the slug of the target page (`genericMetadata.slug` with **portals_page_config_getData** on that page) and its group, and set `pageRef` yourself. Variants are `default`, `outlined`, `tonal`: there is no text-only button, use a `title` with `link` or a markdown link. `usePortalConfig: true` takes the portal's button style.
- **`card`**: `children` and `actions` are required arrays, even empty. Its `link` makes the whole card clickable. The `imageZoom` hover effect zooms only the card's `thumbnail`, never an `image` block in its children. A borderless white card with the `elevate` effect reads as a line under the card: keep `border: true`.
- **`banner`**: `background.tintStrength` acts only when both `background.color` and `background.image` are set. Root `banner` and `image` blocks already get negative top and bottom margins (hero): do not compensate.
- **`tabs`**: `align` is required (`start`, `center`, `end`), even with `grow`; no background option.
- **Containers** (`two-columns`, `responsive-grid`, `card`, `banner`, `tabs`, `expansion-panels`) nest blocks; markdown, anchors and image cleanup go through them.
- **Functional blocks** (catalogs, lists, dataset table and form, search, topics, contact…) depend on the portal's features and on the data-fair datasets and applications of the owner.
- **Listings** (one markdown line per entry in a `text` block): sort the lines alphabetically by their link label after adding one.
- Name a data-fair application by the title of its base application in data-fair, not by its repository name.
- No custom JSON-LD can be injected: the portal emits WebSite, WebPage and BreadcrumbList by itself.

## Embedding a visualization

| | `application` block | `iframe` block |
| --- | --- | --- |
| Target | a data-fair application of the **portal's own** data-fair | any URL |
| Content security | nothing to allow | its origin must be in the portal's `allowedFrameSources` |
| Height | `displayMode`: `auto-resize` (default), `aspect-ratio` + `ratio` / `maxHeight`, `fixed-height` + `height` (min 150) | none, deduced from the width |
| Extras | `actionButtons.items` (`fullscreen`, `capture`, `embed`, `datasets`), `syncParams` | `title` (accessibility), `scroll` |

- Prefer the `application` block. Its `application` object needs `id`, `title` and `slug` of an application of the portal's data-fair; the application must be **public**, or the block breaks for anonymous visitors.
- `syncParams`: `none`, `sandboxed` (URL parameters prefixed by the block's `uuid`), `shared-filters` (filters shared with the other blocks of the page).
- An application of another data-fair instance, or an external page, goes in an `iframe` block, and its origin must be added to `allowedFrameSources` of the portal configuration (a portal administrator, `portals-config`): an empty list blocks every external iframe.

## Mermaid diagrams

Block `{ type: 'mermaid', code, description }`, rendered in the visitor's browser with the portal's theme and `securityLevel: 'strict'`. `description` is the text alternative read by screen readers: always write it.

- The SVG is shown at most at its natural width, and shrunk with its text when wider than the content column (~720 px): a wide `flowchart LR` becomes unreadable. Prefer `flowchart TB`, short labels (1–3 words per line, `<br/>` to break), few parallel branches; a taller diagram is fine.
- The `base` theme derives yellow or orange cluster backgrounds from the portal's colours. Start the code with an explicit directive to neutralize them:
  `%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#ffffff", "primaryTextColor": "#212121", "primaryBorderColor": "#1565c0", "lineColor": "#78909c", "secondaryColor": "#ffffff", "tertiaryColor": "#ffffff", "clusterBkg": "#ffffff", "clusterBorder": "#90a4ae", "fontSize": "16px"}}}%%`
  Keep `fontSize` at 16px: a larger font widens the diagram in proportion.
- Quoted labels accept accents, `()`, `+`, `/`, `%`; avoid `&` and `#`. Link subgraphs by their id rather than every inner node. `direction TB` inside a subgraph of an `LR` flow is not always respected.
- A syntax error shows the source code instead of the diagram.

# Configuration of a portal

How a data portal is configured: its model (draft and live configuration, owner, settings), who may do what, what a save sets off in the other services of the platform and the delays that follow, and the behaviour of the configuration sections that the schema does not tell (theme, fonts, images, navigation, footer, cards, contact, security). How to fill the editor form (describeState, setFieldValue, editArray, saveForm…) is in the `portals-portal-config` skill; the content of the pages, standard pages included, is in `portals-pages`.

## The model

- A portal belongs to an **owner**: an account (organization or user), optionally one department. It has a **live** configuration (what visitors see) and a **draft** one, plus settings outside the configuration: owner, staging mode, contributor departments, its address (`ingress`).
- The portals_portal_config tools edit the draft as a form, starting with **portals_portal_config_describeState**, and **portals_portal_config_saveForm** saves the **whole document**: there is no partial update. **portals_publish_portal_config** puts the draft live; **portals_cancel_portal_config_draft** puts the live configuration back in the draft.
- The draft is visible at the draft address of the portal (`<id>.draft` next to the portal's address): it requires a login on that host (its own session) and is never indexed.
- **portals_update_portal_settings** changes the settings: staging mode (the portal shows the pages whose publication is *requested* on it, a preview of contributions), `contributorDepartments` (the administrators of these departments publish on it as if they owned it; only for a portal owned by the organization root), owner.
- **portals_create_portal** takes a `config` with only `title` and `menu`, or a `sourcePortalId` to duplicate (a portal you administer or a reference portal): the published configuration, its images, menu and styles are copied, **not its pages**. The new portal's draft equals its live configuration: nothing to publish.
- **portals_delete_portal** deletes the portal, its images and its data-fair publication site; its pages stay, detached.
- A dedicated domain (`ingress`) is set by a platform super-administrator only. Without one, the portal's address follows the platform's pattern with its id.

### Typical sequence

1. Find the portal with **portals_list_portals** (or create it with **portals_create_portal**).
2. Edit with the portals_portal_config tools and save.
3. **portals_publish_portal_config**, then check the portal's address.
4. For a new portal, create and attach its standard pages (below).

## Roles and token tiers

- Reading a portal needs admin or contrib on its owner (or membership of one of its contributor departments). Editing its draft, publishing, settings, creation and deletion need **admin** of the portal's owner. A department is an owner of its own; an organization-level role covers every department.
- An agent's token has a tier per family. The **write** tier *prepares*: edit and save the draft (portals_portal_config tools), discard it, upload images and font files. The **admin** tier *puts live or changes hands*: **portals_publish_portal_config**, **portals_update_portal_settings**, **portals_create_portal**, **portals_delete_portal**, **portals_delete_font_asset**.
- With a write-tier token, prepare and save the draft, then tell the person what remains: publish the draft of portal *X* (id), and any settings change. Never claim a change is online when only the draft was saved.

## A portal created through the API has no pages

**portals_create_portal** creates no page: the manager's wizard creates them, the API does not. A new portal has no home page and `/datasets` answers "Page not found" until a `datasets` page is attached; the same for `/contact`, `/legal-notice`… Create each useful page (`home`, `datasets`, `applications`, then `contact`, `legal-notice`, `privacy-policy`, `accessibility`…) with **portals_create_page_on_portals** (or **portals_create_page**, then **portals_attach_page_to_portals**), owned by the **portal's account** (a portal shows only the pages of its own account), then add them to the menu. Catalog types get their default catalog block; the others start empty and their content belongs to `portals-pages`. A menu item towards a type without an attached page leads to a 404.

## Saving

- A save is validated against the schema; the errors name the path (`body/draftConfig/footer must have required property rows`). In a `oneOf` (menu items, links, footer blocks) read the deepest path and ignore the "must match exactly one schema in oneOf" around it.
- Unknown keys of the portal configuration are not refused, and have no effect: take the property names from describeState, never guess them.
- A body is limited to 100 kB (413 beyond). The big contributors are MDI icons (`icon.mdi` carries `name`, `svg` and `svgPath`) repeated in the menu, topics and links: keep their number down.
- Outside a white-label portal, the footer must show the Koumoul mention: `footer.copyright: true`, or an `images` footer block with an item `source: 'koumoul'`; otherwise the save is refused (400). White label is set by a super-administrator only.
- Editor suggestions do not work for the portal topics nor for the font names in editor sessions: take the topics from data-fair and the fonts from the list below, and set the values yourself.

## What a save and a publication set off

At each save and each publication, before writing, the manager syncs the other services; if one refuses, the whole call fails with its message (`data-fair error (…)`, `simple-directory error (…)`).

- **data-fair**: the portal's publication site (`data-fair-portals:<id>`): title and address of the live configuration, dataset and application URL templates, `private` when `authentication` is `required`, staging and contributor departments. Sent only when one of these changes. Known limitation: until the platform's data-fair accepts the portals secret key for agent sessions, a publication or settings change that alters the publication site can fail with a "data-fair error": then ask the person to do that step from the back-office.
- **simple-directory**: two sites, the draft (updated at each save) and the live one (updated at **publication** only), carrying theme, logo, fonts and the contact address.
- **ingress manager**: the draft host and, with an `ingress`, the dedicated domain.

Delays: the theme variables (backgrounds, `bg-primary`, buttons) are rebuilt at each request and change at once. The `text-*` colour classes, links and **fonts** come from simple-directory's theme stylesheet, whose hash the portal caches for **1 minute**: a text colour or font change can appear up to ~1 min after the rest. The hashed stylesheet is immutable: no browser cache to clear.

## Theme and colours

The server recomputes the theme at each save:

- `assistedMode: true`: the four palettes (default, dark, high contrast, dark high contrast) are **reset to the defaults** (`background`, `surface`, `info`, `warning`…), then `primary`, `secondary`, `accent` and their `on-*` are set from `assistedModeColors`, and `text-primary` / `text-secondary` / `text-accent` are darkened (lightened in dark themes) until AA contrast (AAA in high contrast). Any colour set by hand in `colors` is overwritten. A charter yellow `#FFC300` becomes `text-secondary` `#8a6900`: this is intended.
- `assistedMode: false` (or absent): the palettes are kept as written; only `assistedModeColors` is realigned on `colors`.
- For exact colours (a custom `background`, a `text-secondary` imposed by a charter) save with `assistedMode: false` and write `colors` / `darkColors` explicitly. To start from the assisted colours then retouch: save once in assisted mode, read the computed palettes back, then save again with `assistedMode: false` and the retouches. One save "assisted + retouches" loses the retouches.
- `dark`, `hc`, `hcDark` each enable a variant **and** the theme switcher; a visitor whose system is dark switches to `dark` automatically when it is enabled. `logoDark` is used only in a dark theme.

## Fonts

`bodyFontFamily` and `headingFontFamily` (empty heading = the body font; nothing set = Nunito). The names are those of the font files uploaded by the account (**portals_list_font_assets**, **portals_upload_font_asset**) and the standard ones: Montserrat, Noto Sans, Nunito, Pacifico, Roboto. An unknown name falls back silently to the browser's font. Fonts follow the 1 minute delay above.

## Images

- Upload with **portals_upload_image**, `resource: { type: 'portal', _id: <portal id> }`, and put the answer's `{ _id, name, mimeType, mobileAlt? }` as is in `logo`, `logoDark`, `favicon`, `header.logoPrimary`, `navBar.logo`, a card's default thumbnail, a footer images block…
- The session's active account must be **exactly** the portal's owner (type, id and department), else "404 linked portal not found", even for an organization admin.
- SVG uploaded as `image/svg+xml` is stored as is (sharp at any size, width and height 0 in the answer); every other format is converted to webp, and above 1536 px wide a mobile variant is made (`mobileAlt: true`: keep it).
- A portal image is served by that portal only, and is removed at the next publication or draft discard once neither configuration references it.

## Navigation

- **Menu** `menu.children`: `standard` items (`subtype`: home, contact, datasets, applications, reuses, event-catalog, news-catalog, legal-notice, privacy-policy, cookie-policy, accessibility, terms-of-service, sitemap, catalog-api-doc), `generic` / `event` / `news` (`pageRef { slug, title, group? }`), `external` (`title`, `href`), `submenu` (`title`, `children`). Page link suggestions do not work in editor sessions: find the pages with **portals_list_pages**, read their slug (and group) in their configuration, and set `pageRef` yourself.
- **`navBar`**: `fluid` absent means **full width**: set `fluid: false` to align the tabs on the content. `align` absent means centered. `loginColor` sets only the background of the login button. `navBarHome` (with `navBarHomeActive`) is a variant for the home page; the same for `header` / `headerHome`.
- **`header`**: the portal title is rendered as an `<h1>` when `show && showTitle && !logoPrimaryCentered`: the pages then use `<h2>` for their titles (`portals-pages`).
- **`breadcrumb.position`** absent means hidden (`below-nav`, `above-footer`, `both`); never on the home page.

## Footer

`copyright` (boolean), `background { color, image? }`, `rows[]`. A row has `columns` 1, 2 or 3 and its blocks in `blocks`, `blocks2`, `blocks3` (the blocks of hidden columns stay stored); block types `images`, `text`, `links`, `buttons`, `social`, `divider`, each requiring `type` and `align`. The Koumoul mention rule above applies.

## Cards, catalogs, defaults: write every value

**The schema defaults are not applied at render.** The manager's form fills them when a section is opened; the API does not, and the portal renders an absent key as "off". A portal configured through the API with `datasets.card: {}` shows cards without summary, image, owner or action buttons. Set every wanted value explicitly:

- `datasets.card` / `applications.card`: `actionsLocation` absent = no action; `actionsStyle` absent = text only (`full` = icon + text); `showSummary` shows the dataset's `summary`, never its description; `thumbnail.show`, `topics.show`, `keywords.show`… absent = hidden. `reuses.card` and `news.card` have no actions.
- `datasets.page`: the applications, reuses and related datasets sections are rendered only with an explicit `display` (`card`, …); `metadata.location` absent = full width; `metadata.actionButtons` lists the buttons.
- `applications.page`: `datasets.display: 'card'` for "data used"; `metadata.showBaseApplication` is shown unless `false`.
- `defaults` (`elevation`, `density`, `rounded`, `hover`) are inherited by cards, buttons, blocks and tabs that set nothing; absent on a new portal (flat cards).
- Topic icons come from the owner's topics in data-fair, not from the portal: `showIcon` only shows what exists there.

## Contact, social, security

- `contactInformations.email` is never shown publicly: it is the destination of the contact form (synced to simple-directory); empty, messages go to the platform's global contact address. `infos` is markdown.
- `socialLinks` take **identifiers, not URLs** (`linkedin: 'koumoul'`): a full URL makes a broken link.
- `allowRobots: true` to be indexed by search engines: absent, `robots.txt` answers `Disallow: /` (always on the draft).
- `allowedFrameSources`: the origins the pages may embed in an `iframe` block; empty = no external iframe. `allowedFrameAncestors`: the sites allowed to embed the portal.
- `authentication`: `none`, `optional`, `required` (`required` makes the data-fair publication site private).

# Patches

Local patches applied via [`patch-package`](https://github.com/ds300/patch-package). Applied in production by the `Dockerfile` (`RUN npx patch-package`); for local dev run `npx patch-package` after `npm install`.

## `vuetify+4.1.8.patch`

### `lib/composables/router.js` — d-frame iframe support

Makes Vuetify links work when the portal is embedded as an iframe via [`@data-fair/frame`](https://github.com/data-fair/frame):

- Replaces the default `href` (resolved against the iframe's own router) with `useParentUrl(...)`, so internal navigation updates the URL of the **parent** window instead of the iframe.
- Defaults `target` to `_top` on link props, so user clicks navigate the top window rather than reloading inside the iframe.

**Removal criterion**: when Vuetify exposes a public hook to override the link resolver / target without monkey-patching. Currently no such API.

### `lib/composables/theme.js` — W3C HTML validity for the theme stylesheet

Vuetify 4 deliberately injects `<style id="vuetify-theme-stylesheet">` at `bodyOpen` (commit [`2475a28`](https://github.com/vuetifyjs/vuetify/commit/2475a28426470bd966f59ad5864cdbddd457b09f), fixing issue [#22656](https://github.com/vuetifyjs/vuetify/issues/22656)) to work around a CSS `@layer` ordering bug. The result is HTML-invalid (W3C rejects `<style>` outside `<head>`).

This patch:
1. Drops `tagPosition: 'bodyOpen'` so the stylesheet renders inside `<head>`.
2. Prefixes the stylesheet content with the canonical layer order declaration (`@layer vuetify-core, vuetify-components, vuetify-overrides, vuetify-utilities, vuetify-final;`), so the cascade stays correct regardless of parse order vs. `lib/styles/main.css`.

**Removal criterion**: when Vuetify upstream stops placing the theme stylesheet in `<body>` (track #22656 and related).

### `lib/components/VBadge/VBadge.js` — W3C HTML validity for badges inside buttons

`VBadge` renders a `div` root plus a hardcoded `div.v-badge__wrapper`, while `VBtn`
puts its default slot inside a `span.v-btn__content`. A badge inside a button — the
documented Vuetify pattern, used by `df-notification-queue` in the portal header —
therefore emits a `div` inside a `span`, which W3C rejects ("Element `div` not allowed
as child of element `span`"). RGAA 8.2.

This patch renders both elements as `span`:

1. Defaults the public `tag` prop to `span` instead of `div`.
2. Replaces the hardcoded `div.v-badge__wrapper` with a `span` (no public API for it).

No visual change: `.v-badge` and `.v-badge__wrapper` both declare their `display`
explicitly in Vuetify's own CSS (`inline-block` and `flex`), so the tag name carries
no layout meaning. Only the outer tag is reachable from userland, hence the patch.

**Removal criterion**: when Vuetify renders badges with phrasing content, or exposes
a prop for the wrapper element.

### `lib/components/VField/VField.js` — W3C HTML validity for field labels

`VField` builds its main label props as:

```js
const ariaHidden = hasFloatingLabel.value && isActive.value
return { 'aria-hidden': ariaHidden, for: ariaHidden ? undefined : id.value }
```

When `ariaHidden` is `false` it still emits the attribute, so the label renders as
`<label for="…" aria-hidden="false">`. W3C rejects that: `aria-hidden` must not be
used on a `label` associated with a labelable element, whatever its value. RGAA 8.2.

This patch emits the attribute only when it is true (`ariaHidden || undefined`), which
is already the behaviour of the neighbouring `for` binding. The floating label is
untouched: it carries `aria-hidden="true"` but no `for`, so it is not associated and
stays valid.

**Removal criterion**: when Vuetify stops emitting `aria-hidden="false"` on labels.

### `lib/components/VDivider/VDivider.js` — redundant ARIA role on dividers

`VDivider` always renders an `hr` and hardcodes `role: \`${attrs.role || 'separator'}\``.
`hr` already has `separator` as its implicit role, so the attribute is redundant and
the W3C validator reports one "The `separator` role is unnecessary for element `hr`"
per divider — six of them on the portal home page.

This patch emits `role` only when the caller supplies one (`attrs.role`), so an
explicit `role="presentation"` on a decorative divider is still honoured while the
default stays implicit. `aria-orientation` is left untouched: it is not flagged, and
it carries real meaning on vertical dividers.

Informational only — it fails no criterion and blocks no W3C error — but it is noise
in every audit report. Upstream issue vuetifyjs/vuetify#18229 raised it in September
2023; it was closed by the stale bot without ever being triaged, so the case was
never argued on its merits.

**Removal criterion**: when Vuetify stops hardcoding the implicit `separator` role.

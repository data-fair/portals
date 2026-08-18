# Patches

Local patches applied via [`patch-package`](https://github.com/ds300/patch-package). Applied in production by the `Dockerfile` (`RUN npx patch-package`); for local dev run `npx patch-package` after `npm install`.

## `vuetify+4.1.10.patch`

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

### `lib/components/VChip/VChip.js` — W3C HTML validity for chips

Same defect as `VBadge`, one component further: `VChip` defaults its root `tag` to
`span` (a chip is an inline box) but hardcodes four inner wrappers as `div` —
`v-chip__filter`, `v-chip__prepend`, `v-chip__content` and `v-chip__append`. Every
chip therefore emits a `div` inside a `span`, which W3C rejects — seven occurrences
on the portal catalogue page alone (the topic filter chips, all on `__content`).
RGAA 8.2.

This patch renders all four as `span`, which is what the sibling `v-chip__overlay`
and `v-chip__underlay` wrappers already were. No visual change: Vuetify's own CSS
declares `display: inline-flex` on `.v-chip__content` and on the
`.v-chip__filter`/`.v-chip__prepend`/`.v-chip__append` group, so the tag name carries
no layout meaning. The close button is left alone — it is a `button`, already valid
phrasing content. None of the wrappers is reachable from userland (`tag` only
controls the root), hence the patch.

Only `__content` is exercised by the portal today, but the patch covers the four so
it stays identical to the upstream fix proposed for this defect.

**Removal criterion**: when Vuetify renders the chip wrappers as phrasing content, or
exposes props for them.

### `lib/components/VTabs/VTab.js` — W3C HTML validity for the tab slider

Same defect as `VBadge` and `VChip`, one component further: `VTab` renders its
underline as a hardcoded `div.v-tab__slider` inside `VBtn`'s default slot, which
`VBtn` wraps in a `span.v-btn__content`. Every tab therefore emits a `div` inside a
`span` — four occurrences in the portal header navigation. RGAA 8.2.

This patch renders the slider as a `span`. No visual change: `.v-tab__slider` is
`position: absolute`, which blockifies the box whatever the tag name. The element is
not reachable from userland (`tag` only controls the root of the underlying `VBtn`),
hence the patch.

**Removal criterion**: when Vuetify renders the slider as phrasing content.

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

### `lib/components/VSelect/VSelect.js` — W3C HTML validity for the hidden native select

`VSelect` mirrors its items into a `<select hidden>` so the value is submitted with a
native form. It builds each entry with a `value` but no children and no `label`:

```js
_createElementVNode("option", { key: item.value, value: item.value, selected: … }, null)
```

The HTML spec requires an empty `option` to carry a `label` attribute, so W3C reports
one error per item — four on the portal catalogue page ("Trier par"). RGAA 8.2.

This patch passes `label: item.title`, the string `transformItem` already computes for
display. The element is `hidden`, so there is no visual or behavioural change; the
`label` is what a native form control would expose anyway.

**Removal criterion**: when Vuetify gives the mirrored options a label or a text node.

> **Not patched — `role="combobox"` without `aria-expanded`.** `VTextField` applies its
> `role` prop to *both* the `VField` root and the `input` (`VTextField.js` lines 168 and
> 198), and `VSelect` defaults that prop to `combobox`. Two nested comboboxes result.
> The inner one (the `input`) is correct and carries `aria-expanded`/`aria-controls` in
> SSR; the outer one gets them only at runtime, from `VMenu`'s `activator="parent"`
> binding, so the server-rendered markup has a bare `role="combobox"` and W3C rejects it.
> The correct fix is upstream — the ARIA 1.2 combobox pattern puts the role on the input
> only — and removing the role locally would leave `VMenu`'s runtime `aria-expanded` on a
> roleless `div`, trading one defect for another. Tracked upstream as
> vuetifyjs/vuetify#22098 instead.

> **Not patched — `aria-controls` / `aria-owns` on an unmounted overlay.** `VMenu`
> advertises both on its activator, and `useMenuActivator` does the same on the field of
> `VSelect`/`VAutocomplete`/`VCombobox`, with the id of an overlay that is only rendered
> once the menu opens: while closed, they reference an id absent from the document
> (RGAA 7.1). Fixed from userland instead, with `eager` defaults on those four
> components in `portal/nuxt.config.ts` — the overlay stays mounted, so the ids always
> resolve. The lists are virtualised, so mounting them up front costs a window of items,
> not the whole set. Tracked upstream as vuetifyjs/vuetify#23119.

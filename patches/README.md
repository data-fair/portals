# Patches

Local patches applied via [`patch-package`](https://github.com/ds300/patch-package). Applied in production by the `Dockerfile` (`RUN npx patch-package`); for local dev run `npx patch-package` after `npm install`.

## `vuetify+4.0.7.patch`

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

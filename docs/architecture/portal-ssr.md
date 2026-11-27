# Portal server rendering

Pitfalls of the Nuxt portal (`portal/`) on the server side.

## Errors of a route exempted from auth

On a private portal (`authentication: 'required'`) or a draft, `portal/server/middleware/2.auth.ts`
redirects anonymous requests to the login page, except routes exempted by path (the font assets).
A Nuxt error thrown by such a route (`throw createError(...)`) is rendered, for browser-like
requests, through an internal `/__nuxt_error?url=...` request that is not exempted: the 404 becomes
a redirect to the login page.

- An exempted route answers its errors with `setResponseStatus()` and a plain body, never by
  throwing.
- Never exempt `/__nuxt_error` in the auth middleware: its `url` query is client controlled, it
  would render private pages anonymously.

## Response status set by a component

A server side effect that depends on the result of a `useFetch` (such as `setResponseStatus(event,
503)` when a block could not load its content) does nothing in the `setup` of the page or of the
block: the fetches are not settled yet there (Nuxt waits for them at the end of the setup), so the
condition is always false and the status stays 200. Watchers do not run on the server either.

Put it in the `<script setup>` of the component rendered only in that case, as
`portal/app/components/content-unavailable.vue` does: a child is set up when its parent renders,
after the fetches, and before the response is sent. Keep the `statusCode < 400` guard so a more
specific status already set (404, 403 by `page-error`) wins.

## Build assets, SRI and immutable cache

The `/_nuxt/*` assets are served with an immutable one year cache, and `nuxt-security` adds an
`integrity` hash (SRI) of their actual bytes to the page. Vite names a chunk from its code, before
appending anything like a `//# sourceMappingURL=` comment. A build change that alters the bytes of a
chunk without changing its name (enabling `sourcemap.client: true` does) breaks returning
visitors: their cached copy fails the integrity check, the script is blocked and the app does not
hydrate. Such a change needs the bytes to stay the same (`sourcemap.client: 'hidden'` emits the maps
without the comment) or a new chunk name.

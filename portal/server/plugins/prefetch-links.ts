// Nuxt renders its prefetch links with an `as` attribute. That is a sensible hint, used by Chromium
// to type the request, but the HTML spec only allows `as` with rel="preload" / "modulepreload", so the
// W3C validator reports 14 to 38 errors per page, which fails RGAA criterion 8.2 (valid source code).
// We drop it for compliance: the prefetch itself is kept and still fills the cache for the next pages.
// Upstream: https://github.com/nuxt/nuxt/issues/19752 (closed without fix)
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    html.head = html.head.map(chunk => chunk.replace(/ rel="prefetch" as="[^"]*"/g, ' rel="prefetch"'))
  })
})

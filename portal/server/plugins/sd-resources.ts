// dynamic CSP modifications based on portal config
// similar to https://github.com/Baroshem/nuxt-security/blob/main/src/runtime/nitro/plugins/50-updateCsp.ts

import memoize from 'memoizee'
import axios from '@data-fair/lib-node/axios.js'

export const getSiteHashes = memoize(async (privateDirectoryUrl: string, proto: string, hostname: string) => {
  return axios.get<{ publicInfo: string, themeCss: string, fonts?: { href: string, type?: string }[] }>(privateDirectoryUrl + '/simple-directory/api/sites/_hashes', {
    headers: {
      'x-forwarded-proto': proto,
      'x-forwarded-host': hostname
    }
  }).then(r => r.data)
}, {
  profileName: 'getSiteHashes',
  promise: true,
  primitive: true,
  maxAge: 1000 * 60, // 1 minute
  preFetch: true
})

// escape values interpolated into HTML attributes — the href comes from
// site-configured theme data, so it must not be able to break out of the attribute
const escapeHtmlAttr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  nitroApp.hooks.hook('render:html', async (html, { event }) => {
    const hashes = await getSiteHashes(config.privateDirectoryUrl, getHeader(event, 'x-forwarded-proto')!, getHeader(event, 'x-forwarded-host')!)
    for (const font of hashes.fonts ?? []) {
      const type = font.type ? ` type="${escapeHtmlAttr(font.type)}"` : ''
      html.head.push(`<link rel="preload" as="font"${type} href="${escapeHtmlAttr(font.href)}" crossorigin>`)
    }
    html.head.push(`<link href="/simple-directory/api/sites/${hashes.themeCss}/_theme.css" rel="stylesheet">`)
  })
})

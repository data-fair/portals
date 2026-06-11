import memoize from 'memoizee'
import axios from '@data-fair/lib-node/axios.js'

type PreloadLink = { href: string, as?: string, type?: string, crossorigin?: boolean }

// escape values interpolated into HTML attributes — the href comes from
// site-configured theme data, so it must not be able to break out of the attribute
const escapeHtmlAttr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const buildPreloadLink = (link: PreloadLink): string => {
  const as = link.as ? ` as="${escapeHtmlAttr(link.as)}"` : ''
  const type = link.type ? ` type="${escapeHtmlAttr(link.type)}"` : ''
  const crossorigin = link.crossorigin ? ' crossorigin' : ''
  return `<link rel="preload"${as}${type} href="${escapeHtmlAttr(link.href)}"${crossorigin}>`
}

export const getSiteHashes = memoize(async (privateDirectoryUrl: string, proto: string, hostname: string) => {
  return axios.get<{ publicInfo: string, themeCss: string, preloadLinks?: PreloadLink[] }>(privateDirectoryUrl + '/simple-directory/api/sites/_hashes', {
    headers: {
      'x-forwarded-proto': proto,
      'x-forwarded-host': hostname
    }
  }).then(r => ({ themeCss: r.data.themeCss, preloadLinks: (r.data.preloadLinks ?? []).map(buildPreloadLink) }))
}, {
  profileName: 'getSiteHashes',
  promise: true,
  primitive: true,
  maxAge: 1000 * 60, // 1 minute
  preFetch: true
})

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  nitroApp.hooks.hook('render:html', async (html, { event }) => {
    const hashes = await getSiteHashes(config.privateDirectoryUrl, getHeader(event, 'x-forwarded-proto')!, getHeader(event, 'x-forwarded-host')!)
    for (const link of hashes.preloadLinks) html.head.push(link)
    html.head.push(`<link href="/simple-directory/api/sites/${hashes.themeCss}/_theme.css" rel="stylesheet">`)
  })
})

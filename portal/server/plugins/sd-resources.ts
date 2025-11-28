// dynamic CSP modifications based on portal config
// similar to https://github.com/Baroshem/nuxt-security/blob/main/src/runtime/nitro/plugins/50-updateCsp.ts

import memoize from 'memoizee'
import axios from '@data-fair/lib-node/axios.js'

export const getSiteHashes = memoize(async (privateDirectoryUrl: string, proto: string, hostname: string) => {
  return axios.get<{ publicInfo: string, themeCss: string }>(privateDirectoryUrl + '/simple-directory/api/sites/_hashes', {
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

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  nitroApp.hooks.hook('render:html', async (html, { event }) => {
    const hashes = await getSiteHashes(config.privateDirectoryUrl, getHeader(event, 'x-forwarded-proto')!, getHeader(event, 'x-forwarded-host')!)
    html.head.push(`<link href="/simple-directory/api/sites/${hashes.themeCss}/_theme.css" rel="stylesheet">`)
  })
})

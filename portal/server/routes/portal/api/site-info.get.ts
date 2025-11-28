import memoize from 'memoizee'
import axios from '@data-fair/lib-node/axios.js'
import type { SiteInfo } from '@data-fair/lib-vue/session'

export const getSiteInfo = memoize(async (privateDirectoryUrl: string, proto: string, hostname: string) => {
  return axios.get<SiteInfo>(privateDirectoryUrl + '/simple-directory/api/sites/_public', {
    headers: {
      'x-forwarded-proto': proto,
      'x-forwarded-host': hostname
    }
  }).then(r => r.data)
}, {
  profileName: 'getSiteInfo',
  promise: true,
  primitive: true,
  maxAge: 1000 * 60, // 1 minute
  preFetch: true
})

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  return getSiteInfo(config.privateDirectoryUrl, getHeader(event, 'x-forwarded-proto')!, getHeader(event, 'x-forwarded-host')!)
})

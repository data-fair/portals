import type { Portal } from '#api/types/portal'
import type { SiteInfo } from '@data-fair/lib-vue/session'

type RequestPortal = Pick<Portal, '_id' | 'config' | 'owner' | 'staging'> & { draft: boolean }

export default defineNuxtPlugin(async (nuxtApp) => {
  const [portalRes, siteInfo] = await Promise.all([
    useFetch<RequestPortal>('/portal/api/portal', { watch: false }),
    // TODO: performance issue with this fetch that is performed at each request
    // use a cache and the hash provided by SD /_hashes
    // @ts-expect-error $localFetch is not yet typed here but it is available
    nuxtApp.$localFetch<SiteInfo>('/simple-directory/api/sites/_public'),
  ])
  if (!portalRes.data.value) throw new Error('failed to fetch portal')
  if (!siteInfo) throw new Error('failed to fetch site info')
  return { provide: { portal: portalRes.data.value, siteInfo } }
})

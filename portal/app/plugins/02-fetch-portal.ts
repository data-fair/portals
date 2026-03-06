import type { SiteInfo } from '@data-fair/lib-vue/session'

export default defineNuxtPlugin(async (nuxtApp) => {
  const [portalRes, siteInfoRes] = await Promise.all([
    useFetch<RequestPortal>('/portal/api/portal', { watch: false }),
    useFetch<SiteInfo>('/portal/api/site-info', { watch: false }),
  ])
  if (!portalRes.data.value) throw new Error('failed to fetch portal')
  if (!siteInfoRes.data.value) throw new Error('failed to fetch site info')
  return { provide: { portal: portalRes.data.value, siteInfo: siteInfoRes.data.value } }
})

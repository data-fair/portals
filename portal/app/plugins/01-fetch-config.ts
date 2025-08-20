import type { PortalConfig } from '../../../api/types/portal'

export default defineNuxtPlugin(async () => {
  const config = (await useFetch<PortalConfig>('/portal/api/config', { watch: false })).data.value
  if (!config) throw new Error('failed to fetch portal config')
  return {
    provide: {
      portalConfig: config
    }
  }
})

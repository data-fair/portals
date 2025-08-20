import type { PortalConfig } from '../../../api/types/portal'

export default defineNuxtPlugin(async () => {
  const config = await useFetch<PortalConfig>('/portal/api/config', { watch: false })
  return {
    provide: {
      portalConfig: config.data.value
    }
  }
})

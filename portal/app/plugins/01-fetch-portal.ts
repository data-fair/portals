import type { Portal } from '#api/types/portal'

type RequestPortal = Pick<Portal, '_id' | 'config' | 'owner' | 'staging'> & { draft: boolean }

export default defineNuxtPlugin(async () => {
  const portal = (await useFetch<RequestPortal>('/portal/api/portal', { watch: false })).data.value
  if (!portal) throw new Error('failed to fetch portal')
  return { provide: { portal } }
})

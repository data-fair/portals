import useDFrameParentUrls from '@data-fair/frame/lib/vue/use-parent-urls'
import { useVueRouterDFrameContent } from '@data-fair/frame/lib/vue-router/d-frame-content'

export const useParentUrl = (to: string | undefined | null) => {
  if (!to) return null
  if (import.meta.client) {
    const dFrameParentUrls = useDFrameParentUrls(useVueRouterDFrameContent())
    return dFrameParentUrls.get(to)
  }
  return null
}

export default useParentUrl

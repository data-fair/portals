import type { HoverLike } from '../utils/hover'

export const useHoverConfig = (getHover: () => HoverLike | undefined, useDefaults = true) => {
  const { portalConfig } = usePortalStore()
  const resolved = computed(() => resolveHoverConfig(
    getHover(),
    useDefaults ? (portalConfig.value.defaults?.hover as HoverLike | undefined) : undefined
  ))
  return {
    hoverClasses: computed(() => hoverConfigClasses(resolved.value)),
    hoverStyle: computed(() => hoverConfigStyle(resolved.value))
  }
}

import type { ButtonHoverLike, HoverLike } from '../utils/hover'

export const useButtonHover = (getConfig: () => ButtonHoverLike | undefined) => {
  const { portalConfig } = usePortalStore()
  const resolved = computed(() => resolveButtonHover(
    getConfig(),
    portalConfig.value.defaults?.hover as HoverLike | undefined
  ))
  return {
    resolved,
    elevation: (isHovering: boolean | null, base?: number | string) => hoverElevation(resolved.value, !!isHovering, base),
    color: (isHovering: boolean | null, base?: string) => hoverButtonColor(resolved.value, !!isHovering, base),
    style: (isHovering: boolean | null) => hoverButtonStyle(resolved.value, !!isHovering)
  }
}

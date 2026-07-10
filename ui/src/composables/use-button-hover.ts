import type { ButtonHoverLike, HoverLike } from '../utils/hover'

export const useButtonHover = (getConfig: () => ButtonHoverLike | undefined) => {
  const { portalConfig } = usePortalStore()
  const reducedMotion = usePrefersReducedMotion()
  const resolved = computed(() => resolveButtonHover(
    getConfig(),
    (portalConfig.value.defaults?.hover as HoverLike | undefined)?.color
  ))
  return {
    resolved,
    elevation: (isHovering: boolean | null, base?: number | string) => hoverElevation(resolved.value, !!isHovering, base),
    color: (isHovering: boolean | null, base?: string) => resolved.value.effects.includes('color') && isHovering ? resolved.value.color : base,
    style: (isHovering: boolean | null) => stripMotion(hoverButtonStyle(resolved.value, !!isHovering), reducedMotion.value)
  }
}

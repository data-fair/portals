import type { HoverEffect, HoverLike } from '../utils/hover'

export const useHoverConfig = (getHover: () => HoverLike | undefined, useDefaults = true, relevantEffects?: HoverEffect[]) => {
  const { portalConfig } = usePortalStore()
  const reducedMotion = usePrefersReducedMotion()
  const resolved = computed(() => resolveHoverConfig(
    getHover(),
    useDefaults ? (portalConfig.value.defaults?.hover as HoverLike | undefined) : undefined,
    relevantEffects
  ))
  return {
    resolved,
    underlineBar: computed(() => resolved.value.effects.includes('titleUnderlineAnimated')),
    elevation: (isHovering: boolean | null, base?: number | string) => hoverElevation(resolved.value, !!isHovering, base),
    titleStyle: (isHovering: boolean | null) => hoverTitleStyle(resolved.value, !!isHovering),
    background: (isHovering: boolean | null, base?: string) => hoverBackground(resolved.value, !!isHovering, base),
    rootStyle: (isHovering: boolean | null, opts?: { hasBorder?: boolean, inlineBackground?: boolean }) => stripMotion(hoverRootStyle(resolved.value, !!isHovering, opts), reducedMotion.value),
    underlineBarStyle: (isHovering: boolean | null) => stripMotion(hoverUnderlineBarStyle(resolved.value, !!isHovering), reducedMotion.value),
    imageStyle: (isHovering: boolean | null) => stripMotion(hoverImageStyle(resolved.value, !!isHovering), reducedMotion.value)
  }
}

import type { MaybeRefOrGetter } from 'vue'
import type { HoverEffect, HoverLike } from '../utils/hover'

export const useHoverConfig = (getHover: () => HoverLike | undefined, relevantEffects?: MaybeRefOrGetter<HoverEffect[]>) => {
  const { portalConfig } = usePortalStore()
  const resolved = computed(() => resolveHoverConfig(
    getHover(),
    portalConfig.value.defaults?.hover as HoverLike | undefined,
    toValue(relevantEffects)
  ))
  return {
    resolved,
    hasUnderlineBar: computed(() => resolved.value.effects.includes('titleUnderlineAnimated')),
    elevation: (isHovering: boolean | null, base?: number | string) => hoverElevation(resolved.value, !!isHovering, base),
    titleStyle: (isHovering: boolean | null) => hoverTitleStyle(resolved.value, !!isHovering),
    background: (isHovering: boolean | null, base?: string) => hoverBackground(resolved.value, !!isHovering, base),
    rootStyle: (isHovering: boolean | null, opts?: { hasBorder?: boolean, inlineBackground?: boolean, small?: boolean }) => hoverRootStyle(resolved.value, !!isHovering, opts),
    underlineBarStyle: (isHovering: boolean | null) => hoverUnderlineBarStyle(resolved.value, !!isHovering),
    imageStyle: (isHovering: boolean | null) => hoverImageStyle(resolved.value, !!isHovering)
  }
}

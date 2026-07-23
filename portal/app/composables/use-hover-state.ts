/**
 * Drop-in replacement for VHover, whose slot return renders a fragment.
 *
 * Cards are links (`v-card :to`) containing links (action buttons, topic chips),
 * which is invalid HTML: the parser hoists the card content out of the anchor and
 * clones it. Vue silently repairs that in `hydrateElement` (it removes the leftover
 * siblings), but not in `hydrateFragment` — the fragment anchors VHover emits around
 * the card make the leftovers survive hydration and the card renders twice.
 *
 * Keep this until the nested links themselves are gone.
 */
export const useHoverState = (enabled?: () => boolean) => {
  const isHovering = ref(false)
  return {
    isHovering,
    hoverProps: {
      onMouseenter: () => { isHovering.value = !enabled || enabled() },
      onMouseleave: () => { isHovering.value = false }
    }
  }
}

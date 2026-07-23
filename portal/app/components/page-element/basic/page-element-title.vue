<template>
  <div :class="marginClass">
    <!-- element.link!.type !== 'none' est redondant avec isLink mais requis : vue-tsc ne propage pas le narrowing de l'union via la computed -->
    <a
      v-if="isLink && element.link!.type !== 'none' && isExternalLink(element.link!)"
      v-bind="hoverProps"
      :href="resolveLink(element.link!)"
      :title="altLinkTitle"
      :target="element.link?.target ? '_blank' : undefined"
      :rel="element.link?.target ? 'noopener' : undefined"
      :style="linkStyle"
    >
      <layout-title :element="element" :line-grow="lineGrow" :line-hovering="!!isHovering" />
    </a>
    <NuxtLink
      v-else-if="isLink && element.link!.type !== 'none'"
      v-bind="hoverProps"
      :to="resolveLink(element.link!)"
      :title="altLinkTitle"
      :target="element.link?.target ? '_blank' : undefined"
      :rel="element.link?.target ? 'noopener' : undefined"
      :style="linkStyle"
    >
      <layout-title :element="element" :line-grow="lineGrow" :line-hovering="!!isHovering" />
    </NuxtLink>
    <layout-title v-else :element="element" />
  </div>
</template>

<script setup lang="ts">
import type { TitleElement } from '#api/types/page-elements/index.ts'

const { element, context } = defineProps<{
  element: TitleElement
  context?: { isRoot: boolean, index: number, parentLength: number }
}>()

const { t } = useI18n()
const { isExternalLink, resolveLink } = useNavigationStore()

const isLink = computed(() => !!element.link && element.link.type !== 'none')
const { isHovering, hoverProps } = useHoverState()

const linkStyle = {
  textDecoration: 'none',
  color: 'inherit'
}

const lineGrow = computed(() =>
  isLink.value &&
  (element.line?.position === 'none' || element.line?.position === 'bottom-small') &&
  element.line?.growOnHover === true
)

const altLinkTitle = computed(() => {
  if (!element.link || element.link.type === 'none') return ''
  let linkTitle = element.link?.title || element.content || ''
  if (element.link?.target) linkTitle += ' - ' + t('newWindow')
  return linkTitle
})

/**
 * Computes the margin classes for the title based on its position
 * - No margin if it's the only element in the list
 * - Bottom margin only if it's the first element
 * - Both top and bottom margin otherwise
 */
const marginClass = computed(() => {
  const m = margins[element.titleSize] || '4'
  const isSingleElement = context?.parentLength === 1
  const isFirstElement = !context?.isRoot && context?.index === 0

  if (isSingleElement) return ''
  if (isFirstElement) return `mb-${m}`
  return `my-${m}`
})

const margins = {
  h6: '2',
  h5: '3',
  h4: '4',
  h3: '5',
  h2: '6',
  h1: '7'
}
</script>

<i18n lang="yaml">
  en:
    newWindow: New window
  fr:
    newWindow: Nouvelle fenêtre
</i18n>

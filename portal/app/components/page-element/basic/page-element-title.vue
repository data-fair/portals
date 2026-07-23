<template>
  <!--
    The link wraps the title text inside layout-title, not the heading itself: the
    heading also holds the copy-anchor button, and interactive content is not
    allowed inside a link.
  -->
  <v-hover
    v-slot="{ isHovering, props: hoverProps }"
    :disabled="!isLink"
  >
    <div
      :class="marginClass"
      v-bind="hoverProps"
    >
      <layout-title
        :element="element"
        :link="titleLink"
        :line-grow="lineGrow"
        :line-hovering="!!isHovering"
      />
    </div>
  </v-hover>
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

const titleLink = computed(() => {
  if (!element.link || element.link.type === 'none') return undefined
  const resolved = resolveLink(element.link)
  return {
    href: isExternalLink(element.link) ? resolved : undefined,
    to: isExternalLink(element.link) ? undefined : resolved,
    title: altLinkTitle.value,
    target: !!element.link.target
  }
})

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

<template>
  <div :class="marginClass">
    <a
      v-if="element.link && element.link?.type !== 'none' && isExternalLink(element.link)"
      :href="resolveLink(element.link)"
      :title="element.content && element.link?.target ? element.content + ' - ' + t('newWindow') : ''"
      :target="element.link?.target ? '_blank' : undefined"
      :rel="element.link?.target ? 'noopener' : undefined"
      style="text-decoration: none; color: inherit;"
    >
      <layout-title :element="element" />
    </a>
    <NuxtLink
      v-else-if="element.link && element.link?.type !== 'none' && !isExternalLink(element.link)"
      :to="resolveLink(element.link)"
      :title="element.content && element.link?.target ? element.content + ' - ' + t('newWindow') : ''"
      :target="element.link?.target ? '_blank' : undefined"
      :rel="element.link?.target ? 'noopener' : undefined"
      style="text-decoration: none; color: inherit;"
    >
      <layout-title :element="element" />
    </NuxtLink>
    <layout-title v-else :element="element" />
  </div>
</template>

<script setup lang="ts">
import type { TitleElement } from '#api/types/page-config'

const { element, context } = defineProps<{
  element: TitleElement
  context?: { isRoot: boolean, index: number }
}>()

const { t } = useI18n()
const { isExternalLink, resolveLink } = useNavigationStore()

const marginClass = computed(() => {
  const m = margins[element.titleSize] || '4'
  const noTopMargin = !context?.isRoot && context?.index === 0
  return noTopMargin ? `mb-${m}` : `my-${m}`
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

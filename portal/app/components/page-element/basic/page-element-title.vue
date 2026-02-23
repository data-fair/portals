<template>
  <div :class="`my-${margins[element.titleSize] || '4'}`">
    <a
      v-if="element.link && isExternalLink(element.link)"
      :href="resolveLink(element.link)"
      :title="element.content && element.link?.target ? element.content + ' - ' + t('newWindow') : ''"
      :target="element.link?.target ? '_blank' : undefined"
      :rel="element.link?.target ? 'noopener' : undefined"
      style="text-decoration: none; color: inherit;"
    >
      <layout-title :element="element" />
    </a>
    <NuxtLink
      v-else-if="element.link && !isExternalLink(element.link)"
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

const { element } = defineProps<{ element: TitleElement }>()

const { t } = useI18n()
const { isExternalLink, resolveLink } = useNavigationStore()

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

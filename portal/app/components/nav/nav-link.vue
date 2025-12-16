<template>
  <v-btn
    :to="!preview && !isExternalLink(link) ? resolveLink(link) : undefined"
    :href="!preview && isExternalLink(link) ? resolveLink(link) : undefined"
    :target="link.type === 'external' && link.target ? '_blank' : undefined"
    :rel="link.type === 'external' && link.target ? 'noopener' : undefined"
    :color="config?.color"
    :density="config?.density"
    :elevation="config?.elevation"
    :rounded="config?.rounded"
    :variant="config?.variant !== 'default' ? config?.variant : undefined"
    :class="{ 'text-none': !config?.uppercase, 'bg-surface': true }"
  >
    <v-icon
      v-if="config?.showIcon && link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
      :color="link.icon.color"
      :icon="link.icon.mdi?.svgPath || link.icon.custom"
      start
    />
    <!-- text-truncate enables text overflow with ellipsis (...) when chip width exceeds available space -->
    <span class="text-truncate">{{ resolveLinkTitle(link, locale) }}</span>
  </v-btn>
</template>

<script setup lang="ts">
import type { LinkItem, LinkConfig } from '#api/types/page-elements/index.js'

defineProps<{
  link: LinkItem
  config?: LinkConfig
}>()

const { locale } = useI18n()

const { preview } = usePortalStore()
const { isExternalLink, resolveLink, resolveLinkTitle } = useNavigationStore()

</script>

<style scoped>
/* Without this, .text-truncate class would have no effect. */
:deep(.v-btn__content) {
  max-width: 100%;
  min-width: 0; /* needed for btn but not for chip ?!! */
}
</style>

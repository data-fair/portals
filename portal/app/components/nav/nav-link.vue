<template>
  <v-btn
    :to="(!preview && link.type !== 'external') ? resolveLink(link) : undefined"
    :href="(!preview && link.type === 'external') ? link.href : undefined"
    :target="link.type === 'external' ? '_blank' : undefined"
    :rel="link.type === 'external' ? 'noopener' : undefined"
    :color="config?.color"
    :density="config?.density"
    :elevation="config?.elevation"
    :rounded="config?.rounded"
    :variant="config?.variant !== 'default' ? config?.variant : undefined"
  >
    <template #prepend>
      <v-icon
        v-if="config?.showIcon && link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
        :icon="link.icon.mdi?.svgPath || link.icon.custom"
        :color="link.icon.color"
      />
    </template>
    {{ resolveLinkTitle(link, locale) }}
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
const { resolveLink, resolveLinkTitle } = useNavigationStore()

</script>

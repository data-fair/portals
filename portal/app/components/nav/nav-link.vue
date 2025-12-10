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
    class="text-truncate justify-start"
    :class="{'text-none': !config?.uppercase}"
  >
    <template
      v-if="config?.showIcon && link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
      #prepend
    >
      <v-icon
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
const { isExternalLink, resolveLink, resolveLinkTitle } = useNavigationStore()

</script>

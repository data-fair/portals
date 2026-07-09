<template>
  <!--
    active false => remove overlay when the `to` props is the current route
  -->
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <v-btn
      v-bind="hoverProps"
      :to="!preview && !isExternalLink(link) ? resolveLink(link) : undefined"
      :href="!preview && isExternalLink(link) ? resolveLink(link) : undefined"
      :target="link.target ? '_blank' : undefined"
      :rel="link.target ? 'noopener' : undefined"
      :color="btnHover.color(isHovering, config?.color)"
      :density="config?.density ?? portalConfig.defaults?.density"
      :elevation="btnHover.elevation(isHovering, config?.elevation ?? portalConfig.defaults?.elevation)"
      :rounded="config?.rounded ?? portalConfig.defaults?.rounded"
      :variant="config?.variant !== 'default' ? config?.variant : undefined"
      :class="[{ 'text-uppercase': config?.uppercase, 'bg-surface': !btnHover.color(isHovering) }]"
      :style="btnHover.style(isHovering)"
      :active="false"
    >
      <!--
        Show icon in prepend, not directly in default slot with start props
        to align vertically with the text properly.
      -->
      <template
        v-if="config?.showIcon && link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
        #prepend
      >
        <v-icon
          :color="link.icon.color"
          :icon="link.icon.mdi?.svgPath || link.icon.custom"
        />
      </template>
      <!-- text-truncate enables text overflow with ellipsis (...) when chip width exceeds available space -->
      <span class="text-truncate">{{ resolveLinkTitle(link, locale) }}</span>
    </v-btn>
  </v-hover>
</template>

<script setup lang="ts">
import type { LinkItem } from '#api/types/page-elements/index.ts'
import type { ButtonConfig } from '#api/types/common-defs/index.ts'

const { config } = defineProps<{
  link: LinkItem
  config?: ButtonConfig
}>()

const { locale } = useI18n()

const { portalConfig, preview } = usePortalStore()
const { isExternalLink, resolveLink, resolveLinkTitle } = useNavigationStore()

const btnHover = useButtonHover(() => config)

</script>

<style scoped>
/* Without this, .text-truncate class would have no effect. */
:deep(.v-btn__content) {
  max-width: 100%;
  min-width: 0; /* needed for btn but not for chip ?!! */
}
</style>

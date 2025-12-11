<template>
  <div :class="element.centered && 'd-flex justify-center'">
    <v-menu
      v-if="element.links && element.links.length"
      :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          :color="config?.color"
          :density="config?.density"
          :elevation="config?.elevation"
          :rounded="config?.rounded"
          :variant="config?.variant !== 'default' ? config?.variant : undefined"
          :append-icon="mdiChevronDown"
          :class="{ 'text-none': !config?.uppercase }"
        >
          <!-- text-truncate enables text overflow with ellipsis (...) when chip width exceeds available space -->
          <span class="text-truncate">{{ element.label || 'Menu' }}</span>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(link, i) of element.links"
          :key="i"
          :title="resolveLinkTitle(link, locale)"
          :to="(!preview && link.type !== 'external') ? resolveLink(link) : undefined"
          :href="(!preview && link.type === 'external') ? link.href : undefined"
          :target="link.type === 'external' ? '_blank' : undefined"
          :rel="link.type === 'external' ? 'noopener' : undefined"
          color="primary"
          link
        >
          <template #prepend>
            <v-icon
              v-if="config?.showIcon && link.icon && (link.icon.mdi?.svgPath || link.icon.custom)"
              :icon="link.icon.mdi?.svgPath || link.icon.custom"
              :color="link.icon.color"
            />
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import type { MenuElement } from '#api/types/page-elements'
import { mdiChevronDown } from '@mdi/js'

const { element } = defineProps<{ element: MenuElement }>()
const { portalConfig } = usePortalStore()
const { locale } = useI18n()
const { preview } = usePortalStore()
const { resolveLink, resolveLinkTitle } = useNavigationStore()

const config = computed(() => {
  return (!element.usePortalConfig && element.config) ? element.config : portalConfig.value.navLinksConfig
})

</script>

<style scoped>
/* Without this, .text-truncate class would have no effect. */
:deep(.v-btn__content) {
  max-width: 100%;
  min-width: 0;
  /* needed for btn but not for chip ?!! */
}
</style>

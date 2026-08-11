<template>
  <div :class="element.centered && 'd-flex justify-center'">
    <!-- eager + no aria-haspopup: same rationale as the header submenus (nav-tabs.vue) -->
    <v-menu
      v-if="element.links && element.links.length"
      :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
      eager
    >
      <template #activator="{ props: menuProps }">
        <v-hover v-slot="{ isHovering, props: hoverProps }">
          <v-btn
            v-bind="{ ...menuProps, ...hoverProps }"
            :aria-haspopup="undefined"
            :color="btnHover.color(isHovering, config?.color)"
            :density="config?.density ?? portalConfig.defaults?.density"
            :elevation="btnHover.elevation(isHovering, config?.elevation ?? portalConfig.defaults?.elevation)"
            :rounded="config?.rounded ?? portalConfig.defaults?.rounded"
            :variant="config?.variant !== 'default' ? config?.variant : undefined"
            :append-icon="mdiChevronDown"
            :class="{ 'text-uppercase': config?.uppercase }"
            :style="btnHover.style(isHovering)"
          >
            <!-- text-truncate enables text overflow with ellipsis (...) when chip width exceeds available space -->
            <span class="text-truncate">{{ element.label || 'Menu' }}</span>
          </v-btn>
        </v-hover>
      </template>
      <v-list
        tag="ul"
        style="list-style: none"
      >
        <li
          v-for="(link, i) of element.links"
          :key="i"
        >
          <v-list-item
            :title="resolveLinkTitle(link, locale)"
            :to="(!preview && link.type !== 'external') ? resolveLink(link) : undefined"
            :href="(!preview && link.type === 'external') ? link.href : undefined"
            :target="link.type === 'external' ? '_blank' : undefined"
            :rel="link.type === 'external' ? 'noopener' : undefined"
            :role="undefined"
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
        </li>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import type { MenuElement } from '#api/types/page-elements/index.ts'
import { mdiChevronDown } from '@mdi/js'

const { element } = defineProps<{ element: MenuElement }>()
const { portalConfig } = usePortalStore()
const { locale } = useI18n()
const { preview } = usePortalStore()
const { resolveLink, resolveLinkTitle } = useNavigationStore()

const config = computed(() => {
  return (!element.usePortalConfig && element.config) ? element.config : portalConfig.value.navLinksConfig
})

const btnHover = useButtonHover(() => config.value)

</script>

<style scoped>
/* Without this, .text-truncate class would have no effect. */
:deep(.v-btn__content) {
  max-width: 100%;
  min-width: 0;
  /* needed for btn but not for chip ?!! */
}
</style>

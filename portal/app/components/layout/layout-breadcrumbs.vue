<template>
  <!--
    IMPORTANT: Manual v-for with <v-breadcrumbs-item> is used instead of the ":items" prop because:
      1. Bug Fix: Combining ":items" with the "#divider" slot in Nuxt 3 triggers a Vue "Slot invoked
        outside of render function" warning during hydration due to Vuetify's internal slot management.
      2. Stability: Manual rendering bypasses complex internal logic, ensuring a stable render cycle
        and better performance when breadcrumbs are updated reactively from a store.
  -->
  <component
    :is="isLayoutFull ? 'div' : VContainer"
    v-bind="isLayoutFull ? undefined : {
      class: ['pa-0', { container: breadcrumbConfig.fluid === false }],
      fluid: true
    }"
  >
    <nav :aria-label="t('breadcrumb')">
      <v-breadcrumbs
        tag="ol"
        density="compact"
        :class="{ 'px-0 ml-n1': isElement }"
      >
        <template
          v-for="(item, index) in breadcrumbItems"
          :key="index"
        >

          <v-breadcrumbs-item
            v-bind="typeof item === 'object' ? item : { title: item }"
            :class="{ 'text-body-2': breadcrumbConfig.compact && !isLayoutFull, 'text-medium-emphasis': !isLayoutFull }"
            :aria-current="index === breadcrumbItems.length - 1 ? 'page' : undefined"
          />

          <v-breadcrumbs-divider
            v-if="index < breadcrumbItems.length - 1"
            :class="{ 'px-1': breadcrumbConfig.compact && !isLayoutFull }"
          >
            <v-icon
              v-if="breadcrumbConfig.separator?.type === 'icon' && breadcrumbConfig.separator.icon?.svgPath"
              :icon="breadcrumbConfig.separator.icon.svgPath"
              :color="breadcrumbConfig.separator.color"
              size="small"
            />
            <span
              v-else
              :class="[
                breadcrumbConfig.separator?.color ? `text-${breadcrumbConfig.separator.color}` : undefined,
                { 'text-body-2': breadcrumbConfig.compact && !isLayoutFull, 'text-medium-emphasis': !isLayoutFull },
              ]"
            >
              {{ breadcrumbConfig.separator?.text || '/' }}
            </span>
          </v-breadcrumbs-divider>
        </template>
      </v-breadcrumbs>
    </nav>
  </component>
</template>

<script setup lang="ts">
import type { VBreadcrumbs } from 'vuetify/components'
import { VContainer } from 'vuetify/components'

type BreadcrumbItems = NonNullable<VBreadcrumbs['$props']['items']>

defineProps<{ isLayoutFull?: boolean, isElement?: boolean }>()

const { portalConfig } = usePortalStore()
const { breadcrumbs } = useNavigationStore()

const { t } = useI18n()

const breadcrumbConfig = computed(() => portalConfig.value.breadcrumb)

const breadcrumbItems = computed(() => {
  const items: BreadcrumbItems = [...breadcrumbs.value]

  // Add home link if configured
  if (breadcrumbConfig.value.showHome) {
    items.unshift({
      title: breadcrumbConfig.value.homeLabel || t('home'),
      to: '/',
      disabled: items.length === 0,
    })
  }

  return items
})
</script>

<i18n lang="yaml">
  en:
    home: Home
    breadcrumb: 'You are here:'
  fr:
    home: 'Accueil'
    breadcrumb: 'Vous êtes ici :'
</i18n>

<style scoped>

:deep(.v-breadcrumbs-item--link:not([aria-current="page"])) {
  background-image: linear-gradient(currentColor, currentColor);
  background-position: 0 90%;
  background-repeat: no-repeat;
  background-size: 100% 1px;
  text-decoration: none;
  display: inline-block;
}

:deep(.v-breadcrumbs-item--link:not([aria-current="page"]):hover),
:deep(.v-breadcrumbs-item--link:not([aria-current="page"]):active) {
  background-size: 100% 2px;
}

:deep(.v-breadcrumbs-item--link[aria-current="page"]) {
  pointer-events: none;
  text-decoration: none;
}

:deep(.v-breadcrumbs-divider) {
  pointer-events: none;
  user-select: none;
}
</style>

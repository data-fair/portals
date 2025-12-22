<template>
  <!--
    IMPORTANT: Manual v-for with <v-breadcrumbs-item> is used instead of the ":items" prop because:
      1. Bug Fix: Combining ":items" with the "#divider" slot in Nuxt 3 triggers a Vue "Slot invoked
        outside of render function" warning during hydration due to Vuetify's internal slot management.
      2. Stability: Manual rendering bypasses complex internal logic, ensuring a stable render cycle
        and better performance when breadcrumbs are updated reactively from a store.
  -->
  <v-breadcrumbs density="compact">
    <template
      v-for="(item, index) in breadcrumbItems"
      :key="index"
    >

      <v-breadcrumbs-item
        v-bind="typeof item === 'object' ? item : { title: item }"
        :disabled="(typeof item === 'object' && item.disabled) || index === breadcrumbItems.length - 1"
      />

      <v-breadcrumbs-divider v-if="index < breadcrumbItems.length - 1">
        <v-icon
          v-if="breadcrumbConfig.separator?.type === 'icon' && breadcrumbConfig.separator.icon?.svgPath"
          :icon="breadcrumbConfig.separator.icon.svgPath"
          :color="breadcrumbConfig.separator.color"
          size="small"
        />
        <span
          v-else
          :class="breadcrumbConfig.separator?.color ? `text-${breadcrumbConfig.separator.color}` : undefined"
        >
          {{ breadcrumbConfig.separator?.text || '/' }}
        </span>
      </v-breadcrumbs-divider>

    </template>
  </v-breadcrumbs>
</template>

<script setup lang="ts">
import type { VBreadcrumbs } from 'vuetify/components'

type BreadcrumbItems = NonNullable<VBreadcrumbs['$props']['items']>

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
      to: '/'
    })
  }

  return items
})
</script>

<i18n lang="yaml">
  en:
    home: Home
  fr:
    home: 'Accueil'
</i18n>

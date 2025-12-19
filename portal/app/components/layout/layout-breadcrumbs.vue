<template>
  <v-breadcrumbs
    :items="breadcrumbItems"
    density="compact"
  >
    <template #divider>
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

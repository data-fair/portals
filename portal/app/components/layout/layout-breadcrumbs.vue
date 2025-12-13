<template>

  <ul class="v-breadcrumbs v-breadcrumbs--density-compact">
    <template v-for="(item, i) of breadcrumbItems" :key="i">
      <li v-if="item.to" class="v-breadcrumbs-item">
        <custom-router-link :to="item.to">
          {{ item.title }}
        </custom-router-link>
      </li>
      <li v-else class="v-breadcrumbs-item v-breadcrumbs-item--disabled">{{ item.title }}</li>
      <li v-if="i < breadcrumbItems.length - 1" aria-hidden="true" class="v-breadcrumbs-divider">
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
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
const { portalConfig } = usePortalStore()
const { breadcrumbs } = useNavigationStore()

const { t } = useI18n()

const breadcrumbConfig = computed(() => portalConfig.value.breadcrumb)

const breadcrumbItems = computed(() => {
  const items: { title: string, to?: string, disabled?: boolean }[] = [...breadcrumbs.value]

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

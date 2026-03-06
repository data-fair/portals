<template>
  <layout-preview
    :title="t('preview') + ' - ' + dataset.title"
    :action-style="portalConfig.datasets.page.metadata?.actionsStyle"
    :icon="mdiBell"
    :resource-title="dataset.title"
    :text="t('preview')"
    :track-dialog="{ action: 'dataset-notifications', label: dataset.slug }"
  >
    <d-frame-wrapper
      :iframe-title="t('preview') + ' - ' + dataset.title"
      :src="src"
      scrolling="no"
      aspect-ratio
    />
  </layout-preview>
</template>

<script setup lang="ts">
import { mdiBell } from '@mdi/js'

const { dataset } = defineProps<{
  dataset: {
    id: string
    slug: string
    title: string
    owner: {
      type: string
      id: string
      department?: string
    }
  }
}>()
const { t } = useI18n()
const { portalConfig } = usePortalStore()

const src = computed(() => {
  const keys = [`data-fair:dataset-data-updated:${dataset.id}`, `data-fair:dataset-breaking-change:${dataset.id}`]
  const titles = ['Mise à jour des données', 'Rupture de compatibilité des données']
  const urlTemplate = '/datasets/' + dataset.id
  let sender = `${dataset.owner.type}:${dataset.owner.id}`
  if (dataset.owner.department) sender += ':' + dataset.owner.department
  return `/events/embed/subscribe?key=${encodeURIComponent(keys.join(','))}&title=${encodeURIComponent(titles.join(','))}&url-template=${encodeURIComponent(urlTemplate)}&register=false&sender=${encodeURIComponent(sender)}&outputs=auto`
})
</script>

<i18n lang="yaml">
  en:
    preview: Notifications
  fr:
    preview: Notifications
</i18n>

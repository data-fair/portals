<template>
  <v-container max-width="600">
    <h1 class="text-h4 mt-4">
      <v-icon
        size="large"
        color="primary"
        style="top:-2px"
        :icon="mdiBellCircle"
      />
      {{ t('notifications') }}
    </h1>
    <p class="my-4">
      {{ t('notificationsInfo') }}
    </p>
    <v-alert
      type="info"
      variant="outlined"
      :text="t('notificationsAlert')"
    />
    <d-frame-wrapper
      :iframe-title="t('notifications')"
      :src="notifyUrl"
    />
    <p class="my-4">
      {{ t('devicesInfo') }}
    </p>
    <d-frame-wrapper
      :iframe-title="t('devices')"
      src="/events/embed/devices"
    />
  </v-container>
</template>

<script setup lang="ts">
import { mdiBellCircle } from '@mdi/js'

const { portal, portalConfig } = usePortalStore()
const { t } = useI18n()

const notifyUrl = computed(() => {
  if (!topics.value) return
  const portalTitle = portalConfig.value.title || new URL(window.location.href).host
  const keys = [`data-fair:dataset-published:data-fair-portals:${portal.value._id}`]
  const titles = ['Nouveau jeu de données sur ' + portalTitle]
  for (const topic of topics.value) {
    keys.push(`data-fair:dataset-published-topic:data-fair-portals:${portal.value._id}:${topic.value.id}`)
    titles.push(`Nouveau jeu de données dans la thématique ${topic.value.title} sur ${portalTitle}`)
  }
  const icon = `/simple-directory/api/avatars/${portal.value.owner.type}/${portal.value.owner.id}/avatar.png`
  const urlTemplate = '/datasets/{id}'
  let sender = `${portal.value.owner.type}:${portal.value.owner.id}`
  if (portal.value.owner.department) sender += ':' + portal.value.owner.department
  return `/events/embed/subscribe?key=${encodeURIComponent(keys.join(','))}&title=${encodeURIComponent(titles.join(','))}&icon=${encodeURIComponent(icon)}&url-template=${encodeURIComponent(urlTemplate)}&sender=${encodeURIComponent(sender)}&outputs=auto`
})

const topicsFetch = useLocalFetch<{ results: [], count: number, facets: { topics: { count: string, value: { id: string, title: string } }[] } }>(
  '/data-fair/api/v1/datasets',
  {
    query: {
      facets: 'topics',
      mine: true,
      publicationSites: 'data-fair-portals:' + portal.value._id,
      size: 0
    }
  })
const topics = computed(() => topicsFetch.data.value?.facets.topics || [])

useNavigationStore().clearBreadcrumbs()
useHead({ title: t('notifications') })
</script>

<i18n lang="yaml">
  en:
    devices: Devices configured
    devicesInfo: Devices configured to receive your notifications
    notifications: Notifications
    notificationsInfo: You can configure here global notifications on this data portal.
    notificationsAlert: For targeted notifications on datasets visit their individual pages and click the bell.
  fr:
    devices: Appareils configurés
    devicesInfo: Appareils configurés pour recevoir vos notifications
    notifications: Notifications
    notificationsInfo: Vous pouvez configurer ici des notifications globales sur ce portail de données.
    notificationsAlert: Pour des notifications ciblées sur des jeux de données visitez leurs pages individuelles et cliquez sur la cloche.
</i18n>

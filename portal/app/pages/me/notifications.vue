<template>
  <v-container max-width="600">
    <h2 class="text-h4 mt-4">
      <v-icon
        size="large"
        color="primary"
        style="top:-2px"
        :icon="mdiBellCircle"
    />
      {{ t('notifications') }}
    </h2>
    <p class="my-4">
      {{ t('notificationsInfo') }}
    </p>
    <v-alert
      type="info"
      variant="outlined"
      :text="t('notificationsAlert')"
    />
    <d-frame :src="notifyUrl" />
  </v-container>
</template>

<script setup lang="ts">
import { mdiBellCircle } from '@mdi/js'

definePageMeta({ layout: 'personal' })

const { $portal } = useNuxtApp()
const { t } = useI18n()

const notifyUrl = computed(() => {
  if (!topics.value) return
  const portalTitle = $portal.config.title || new URL(window.location.href).host
  const keys = [`data-fair:dataset-published:data-fair-portals:${$portal._id}`]
  const titles = ['Nouveau jeu de données sur ' + portalTitle]
  for (const topic of topics.value) {
    keys.push(`data-fair:dataset-published-topic:data-fair-portals:${$portal._id}:${topic.id}`)
    titles.push(`Nouveau jeu de données dans la thématique ${topic.title} sur ${portalTitle}`)
  }
  const icon = `/simple-directory/api/avatars/${$portal.owner.type}/${$portal.owner.id}/avatar.png`
  const urlTemplate = '/datasets/{id}'
  let sender = `${$portal.owner.type}:${$portal.owner.id}`
  if ($portal.owner.department) sender += ':' + $portal.owner.department
  return `/events/embed/subscribe?key=${encodeURIComponent(keys.join(','))}&title=${encodeURIComponent(titles.join(','))}&icon=${encodeURIComponent(icon)}&url-template=${encodeURIComponent(urlTemplate)}&sender=${encodeURIComponent(sender)}&outputs=auto`
})

const topicsFetch = useLocalFetch<{ results: [], count: number, facets: { topics: { id: string, title: string }[] } }>(
  '/data-fair/api/v1/datasets',
  {
    query: {
      facets: 'topics',
      mine: true,
      publicationSites: 'data-fair-portals:' + $portal._id,
      size: 0
    }
  })
const topics = computed(() => topicsFetch.data.value?.facets.topics || [])
</script>

<i18n lang="yaml">
  en:
    notifications: Notifications
    notificationsInfo: You can configure here global notifications on this data portal.
    notificationsAlert: For targeted notifications on datasets visit their individual pages and click the bell.
  fr:
    notifications: Notifications
    notificationsInfo: Vous pouvez configurer ici des notifications globales sur ce portail de données.
    notificationsAlert: Pour des notifications ciblées sur des jeux de données visitez leurs pages individuelles et cliquez sur la cloche.
</i18n>

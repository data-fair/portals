<template>
  <div v-if="reuseDataFetch.data.value">
    <h3 class="text-h6 mb-4">
      {{ t('publication') }}
    </h3>

    <v-list>
      <v-list-item
        v-for="portal in portalsFetch.data.value?.results"
        :key="portal._id"
      >
        <template #prepend>
          <v-checkbox-btn
            :model-value="isPublished(portal._id)"
            color="primary"
            @update:model-value="togglePortal(portal._id)"
          />
        </template>
        <v-list-item-title>{{ portal.config.title }}</v-list-item-title>
        <v-list-item-subtitle v-if="isRequested(portal._id)">
          {{ t('requested') }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import type { Portal } from '#api/types/portal/index'

const { t } = useI18n()
const { reuseFetch: reuseDataFetch, patchReuse } = useReuseStore()

const portalsFetch = useFetch<{ results: Portal[], count: number }>($apiPath + '/portals', {
  query: {
    size: 1000,
    select: '_id,config.title'
  }
})

const isPublished = (portalId: string) => {
  return reuseDataFetch.data.value?.portals.includes(portalId) ?? false
}

const isRequested = (portalId: string) => {
  return reuseDataFetch.data.value?.requestedPortals.includes(portalId) ?? false
}

const togglePortal = async (portalId: string) => {
  const currentPortals = [...(reuseDataFetch.data.value?.portals ?? [])]
  const index = currentPortals.indexOf(portalId)

  if (index >= 0) {
    currentPortals.splice(index, 1)
  } else {
    currentPortals.push(portalId)
  }

  await patchReuse.execute({ portals: currentPortals })
}

</script>

<i18n lang="yaml">
  en:
    publication: Publication on portals
    requested: Publication requested

  fr:
    publication: Publication sur les portails
    requested: Publication demandée

</i18n>

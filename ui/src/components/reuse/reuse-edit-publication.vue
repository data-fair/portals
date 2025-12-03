<template>
  <v-alert
    v-if="!portals?.length"
    type="warning"
    variant="outlined"
    :title="t('noPortal')"
  >
    <template #append>
      <v-btn
        v-if="session.state.user.adminMode"
        to="/portals/new"
        color="primary"
      >
        {{ t('createPortal') }}
      </v-btn>
    </template>
  </v-alert>
  <template v-else-if="reuse">
    <v-list lines="three">
      <v-list-item
        v-for="(portal, i) in portals"
        :key="i"
      >
        <v-list-item-title>
          <a
            :href="getPortalUrl(portal)"
            target="_blank"
          >{{ portal.title }}</a>
        </v-list-item-title>
        <v-list-item-subtitle
          v-if="reuse.owner.department"
          class="mb-2"
        >
          <span>{{ reuse.owner.name }}</span>
          <span v-if="portal.owner.department"> - {{ portal.owner.departmentName || portal.owner.department }}</span>
        </v-list-item-subtitle>
        <v-list-item-subtitle
          v-if="reuse.portals.includes(portal._id)"
          class="mb-2"
        >
          <a
            :href="getPortalUrl(portal) + '/reuses/' + reuse.slug"
            target="_blank"
          >
            {{ getPortalUrl(portal) + '/reuses/' + reuse.slug }}
          </a>
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          <v-row class="my-0">
            <v-switch
              hide-details
              density="compact"
              :model-value="isPublished(portal)"
              :label="t('published')"
              class="mt-0 ml-6"
              @update:model-value="togglePortals(portal)"
            />
            <v-switch
              v-if="reuse.owner.type === 'organization' && !portal.staging && !reuse.portals.includes(portal._id)"
              hide-details
              density="compact"
              :model-value="reuse.requestedPortals.includes(portal._id)"
              :label="t('publicationRequested')"
              class="mt-0 ml-6"
              @update:model-value="toggleRequestedPortals(portal._id)"
            />
          </v-row>
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </template>
</template>

<script setup lang="ts">
import type { Portal } from '#api/types/portal'

const { t } = useI18n()
const session = useSessionAuthenticated()
const { patchReuse, reuse } = useReuseStore()

type PartialPortal = Pick<Portal, '_id' | 'title' | 'ingress' | 'owner' | 'staging'>
const portalsFetch = useFetch<{ results: PartialPortal[] }>($apiPath + '/portals', { query: { select: '_id,title,ingress,owner', size: 10000 } })
const portals = computed(() => portalsFetch.data.value?.results)

const isPublished = (portal: PartialPortal) => {
  if (!reuse.value) return
  return reuse.value.portals.includes(portal._id) || (portal.staging && reuse.value.requestedPortals.includes(portal._id))
}

const togglePortals = (portal: PartialPortal) => {
  if (!reuse.value) return
  if (portal.staging) return toggleRequestedPortals(portal._id)
  const id = portal._id
  const portals = reuse.value.portals.includes(id) ? reuse.value.portals.filter(i => i !== id) : [...reuse.value.portals, id]
  patchReuse.execute({ portals })
}

const toggleRequestedPortals = (id: string) => {
  if (!reuse.value) return
  const requestedPortals = reuse.value.requestedPortals.includes(id) ? reuse.value.requestedPortals.filter(i => i !== id) : [...reuse.value.requestedPortals, id]
  patchReuse.execute({ requestedPortals })
}

const getPortalUrl = (portal: PartialPortal): string => {
  if (portal.ingress?.url) return portal.ingress.url
  return $uiConfig.portalUrlPattern.replace('{subdomain}', portal._id)
}

</script>

<i18n lang="yaml">
  en:
    createPortal: Create a portal
    noPortal: You have not configured any portal yet.
    publicationRequested: Publication requested by a contributor
    published: Published

  fr:
    createPortal: Créer un portail
    noPortal: Vous n'avez pas encore configuré de portail.
    publicationRequested: Publication demandée par un contributeur
    published: Publié
</i18n>

<template>
  <p
    v-if="!portals?.length"
    class="mb-4"
  >
    {{ t('noPortal') }}
  </p>
  <template v-else-if="page">
    <p class="mb-4">
      {{ t('publishThisPage') }}
    </p>
    <v-alert
      v-if="warnings.length"
      type="warning"
      variant="outlined"
    >
      <p
        v-for="(warning, i) of warnings"
        :key="i"
      >
        {{ warning }}
      </p>
    </v-alert>
    <v-list lines="three">
      <v-list-item
        v-for="(portal,i) in portals"
        :key="i"
      >
        <v-list-item-title>
          <a
            v-if="portal.ingress"
            :href="portal.ingress?.url"
          >{{ portal.title }}</a>
          <template v-else>
            {{ portal.title }}
          </template>
        </v-list-item-title>
        <v-list-item-subtitle
          v-if="page.owner.department"
          class="mb-2"
        >
          <span>{{ page.owner.name }}</span>
          <span v-if="portal.owner.department"> - {{ portal.owner.departmentName || portal.owner.department }}</span>
        </v-list-item-subtitle>
        <v-list-item-subtitle
          v-if="portal.ingress && page.portals.includes(portal._id)"
          class="mb-2"
        >
          <a :href="portal.ingress.url + '/pages/' + page.slug">
            {{ portal.ingress.url + '/pages/' + page.slug }}
          </a>
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          <v-row class="my-0">
            <v-switch
              hide-details
              density="compact"
              :model-value="isPublished(portal)"
              :disabled="(warnings.length && !isPublished(portal)) || !canPublish(portal)"
              :label="t('published')"
              class="mt-0 ml-6"
              @update:model-value="togglePortals(portal)"
            />
            <v-switch
              v-if="page.owner.type === 'organization' && !portal.staging && !page.portals.includes(portal._id)"
              hide-details
              density="compact"
              :model-value="page.requestedPortals.includes(portal._id)"
              :disabled="(warnings.length && !page.requestedPortals.includes(portal._id)) || !canRequestPublication(portal)"
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

<i18n lang="yaml">
fr:
  noPortal: Vous n'avez pas configuré de portail sur lequel publier cette page.
  publishThisPage: Publiez cette page sur un ou plusieurs de vos portails
  published: Publié
  publicationRequested: Publication demandée par un contributeur
  warning:
    description: Description non renseignée
    content: Le contenu de la page est vide
en:
  noPortal: You haven't configured a portal to publish this page on.
  publishThisPage: Publish this page on one or more of your portals.
  published: Published
  publicationRequested: Publication requested by a contributor
  warning:
    description: Description not filled
    content: The page is empty
</i18n>

<script setup lang="ts">
import type { Portal } from '#api/types/portal'
import { getAccountRole } from '@data-fair/lib-vue/session'

const { t } = useI18n()

const session = useSessionAuthenticated()
const { patchPage, page } = usePageStore()

type PartialPortal = Pick<Portal, '_id' | 'title' | 'ingress' | 'owner' | 'staging'>
const portalsFetch = useFetch<{ results: PartialPortal[] }>($apiPath + '/portals', { query: { select: '_id,title,ingress,owner', size: 10000 } })
const portals = computed(() => portalsFetch.data.value?.results)

const warnings = () => {
  const warnings = []
  if (!page.value?.config.description) warnings.push(t('warning.description'))
  if (!page.value?.config.elements.length) warnings.push(t('warning.content'))
}

const isPublished = (portal: PartialPortal) => {
  if (!page.value) return
  return page.value.portals.includes(portal._id) || (portal.staging && page.value.requestedPortals.includes(portal._id))
}

const canPublish = (portal: PartialPortal) => {
  const role = getAccountRole(session.state, portal.owner)
  if (role === 'contrib' && portal.staging) return true
  return role === 'admin'
}
const canRequestPublication = (portal: PartialPortal) => {
  const role = getAccountRole(session.state, portal.owner)
  return role === 'contrib' || role === 'admin'
}

const togglePortals = (portal: PartialPortal) => {
  if (!page.value) return
  if (portal.staging) return toggleRequestedPortals(portal._id)
  const id = portal._id
  const portals = page.value.portals.includes(id) ? page.value.portals.filter(i => i !== id) : [...page.value.portals, id]
  patchPage.execute({ portals })
}

const toggleRequestedPortals = (id: string) => {
  if (!page.value) return
  const requestedPortals = page.value.requestedPortals.includes(id) ? page.value.requestedPortals.filter(i => i !== id) : [...page.value.requestedPortals, id]
  patchPage.execute({ requestedPortals })
}
</script>

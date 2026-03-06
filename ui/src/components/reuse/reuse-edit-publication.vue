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
    <v-table density="comfortable">
      <thead>
        <tr>
          <th>{{ t('portalTitle') }}</th>
          <th v-if="hasDepartmentPortals">
            {{ t('department') }}
          </th>
          <th class="w-25">
            {{ t('status') }}
          </th>
          <th>{{ t('actions') }}</th>
          <th>{{ t('link') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="portal in portals"
          :key="portal._id"
        >
          <td>
            <a
              :href="getPortalUrl(portal)"
              target="_blank"
            >{{ portal.title }}</a>
          </td>
          <td v-if="hasDepartmentPortals">
            {{ portal.owner.departmentName || portal.owner.department || '-' }}
          </td>
          <td class="w-25">
            <v-chip
              v-if="reuse.portals.includes(portal._id)"
              color="success"
              size="small"
            >
              {{ t('published') }}
            </v-chip>
            <v-chip
              v-else-if="reuse.requestedPortals.includes(portal._id)"
              color="warning"
              size="small"
            >
              {{ t('pending') }}
            </v-chip>
            <v-chip
              v-else
              color="default"
              size="small"
            >
              {{ t('notPublished') }}
            </v-chip>
          </td>
          <td class="w-25">
            <v-btn
              size="small"
              color="primary"
              :loading="publishAction.loading.value"
              @click="publishAction.execute(portal)"
            >
              {{ reuse.portals.includes(portal._id) ? t('unpublish') : t('publish') }}
            </v-btn>
            <v-btn
              v-if="reuse.requestedPortals.includes(portal._id)"
              size="small"
              color="warning"
              class="ml-2"
              :loading="refuseAction.loading.value"
              @click="refuseAction.execute(portal)"
            >
              {{ t('refuse') }}
            </v-btn>
          </td>
          <td style="width: 8.33%;">
            <v-btn
              v-if="reuse.portals.includes(portal._id)"
              :href="getPortalUrl(portal) + '/reuses/' + reuse.slug"
              :title="t('viewOn', { portalTitle: portal.title })"
              target="_blank"
              size="small"
              variant="text"
              :icon="mdiOpenInNew"
            />
          </td>
        </tr>
      </tbody>
    </v-table>
  </template>
</template>

<script setup lang="ts">
import type { Portal } from '#api/types/portal'
import { mdiOpenInNew } from '@mdi/js'

const { t } = useI18n()
const session = useSessionAuthenticated()
const { patchReuse, reuse } = useReuseStore()

type PartialPortal = Pick<Portal, '_id' | 'title' | 'ingress' | 'owner' | 'staging'>
const portalsFetch = useFetch<{ results: PartialPortal[] }>($apiPath + '/portals', { query: { select: '_id,title,ingress,owner', size: 10000 } })
const portals = computed(() => portalsFetch.data.value?.results)

const hasDepartmentPortals = computed(() => {
  return portals.value?.some(p => p.owner.department) ?? false
})

const publishAction = useAsyncAction(async (portal: PartialPortal) => {
  if (!reuse.value) return
  if (reuse.value.portals.includes(portal._id)) {
    // Unpublish
    const portals = reuse.value.portals.filter(id => id !== portal._id)
    await patchReuse.execute({ portals })
  } else {
    // Publish
    const portals = [...reuse.value.portals, portal._id]
    const requestedPortals = reuse.value.requestedPortals.filter(id => id !== portal._id)
    await patchReuse.execute({ portals, requestedPortals })
  }
})

const refuseAction = useAsyncAction(async (portal: PartialPortal) => {
  if (!reuse.value) return
  const requestedPortals = reuse.value.requestedPortals.filter(id => id !== portal._id)
  await patchReuse.execute({ requestedPortals })
})

const getPortalUrl = (portal: PartialPortal): string => {
  if (portal.ingress?.url) return portal.ingress.url
  return $uiConfig.portalUrlPattern.replace('{subdomain}', portal._id)
}

</script>

<i18n lang="yaml">
  en:
    actions: Actions
    approve: Approve
    createPortal: Create a portal
    department: Department
    link: Link
    noPortal: You have not configured any portal yet.
    notPublished: Not published
    pending: Pending
    portalTitle: Portal
    publish: Publish
    published: Published
    refuse: Refuse
    status: Status
    unpublish: Unpublish
    viewOn: View on {portalTitle}

  fr:
    actions: Actions
    approve: Approuver
    createPortal: Créer un portail
    department: Département
    link: Lien
    noPortal: Vous n'avez pas encore configuré de portail.
    notPublished: Non publié
    pending: En attente
    portalTitle: Portail
    publish: Publier
    published: Publié
    refuse: Refuser
    status: Statut
    unpublish: Dépublier
    viewOn: Voir sur {portalTitle}
</i18n>

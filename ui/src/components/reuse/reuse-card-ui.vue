<template>
  <custom-router-link :to="`/reuses/${reuse._id}`">
    <card-shell
      :title="reuse.title"
      :owner="showAll || !!(reuse.owner.department && !session.state.account.department) ? reuse.owner : undefined"
    >
      <!-- Author -->
      <card-meta-line
        v-if="reuse.config?.author"
        :icon="mdiAccount"
        :text="reuse.config.author"
      />

      <!-- Datasets count -->
      <card-meta-line
        :icon="mdiDatabase"
        icon-color="primary"
        :text="t('datasets', reuse.config?.datasets?.length ?? 0)"
      />

      <!-- Portal it was submitted from -->
      <card-meta-line
        v-if="submittedFrom"
        :icon="mdiInboxArrowDown"
        :text="t('submittedFrom', { portal: submittedFrom.title })"
      />

      <!-- Reuse portals -->
      <card-sites :sites="sites(reuse.portals)" />

      <template #footer>
        <!-- Modification and creation dates -->
        <card-dates
          :updated-at="reuse.updatedAt"
          :created-at="reuse.createdAt"
        />

        <!-- Pending publication request, on the right -->
        <v-spacer />
        <card-state-info
          v-if="reuse.requestedPortals?.length"
          :icon="mdiAlertCircle"
          color="warning"
          :text="t('pending')"
          :title="t('pendingPublicationRequest')"
          :help="t('pendingHelp', { portals: reuse.requestedPortals.map(id => portalsById[id]?.title ?? id).join(', ') })"
          strong
        />
      </template>
    </card-shell>
  </custom-router-link>
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse/index'
import { mdiAccount, mdiAlertCircle, mdiDatabase, mdiInboxArrowDown } from '@mdi/js'

const { t } = useI18n()
const session = useSessionAuthenticated()
const showAll = useBooleanSearchParam('showAll')

const { reuse, portalsById = {} } = defineProps<{
  reuse: Reuse
  // title and url of the portals, fetched once by the list
  portalsById?: Record<string, { title: string, url: string }>
}>()

const sites = (ids?: string[]) => (ids ?? []).map(id => portalsById[id]).filter(p => !!p)
const submittedFrom = computed(() => reuse.submitter?.portalId ? portalsById[reuse.submitter.portalId] : undefined)
</script>

<i18n lang="yaml">
  en:
    datasets: No dataset | 1 dataset | {n} datasets
    submittedFrom: Submitted from {portal}
    pending: Pending
    pendingPublicationRequest: Pending publication request
    pendingHelp: On {portals}, waiting for an administrator's approval.

  fr:
    datasets: Aucun jeu de données | 1 jeu de données | {n} jeux de données
    submittedFrom: Proposée depuis {portal}
    pending: En attente
    pendingPublicationRequest: Demande de publication en attente
    pendingHelp: Sur {portals}, à valider par un administrateur.

</i18n>

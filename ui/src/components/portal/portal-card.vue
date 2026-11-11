<template>
  <custom-router-link :to="`/portals/${portal._id}`">
    <card-shell
      :title="portal.config.title"
      :owner="showOwner ? portal.owner : undefined"
    >
      <!-- Portal url -->
      <card-meta-line
        :icon="mdiWeb"
        icon-color="primary"
        :text="url.replace(/^https?:\/\//, '')"
      />

      <!-- Portal description -->
      <div
        v-if="portal.config.description"
        class="df-card-desc px-1 text-body-medium"
      >
        {{ portal.config.description }}
      </div>

      <template #footer>
        <!-- Access -->
        <card-visibility
          :visibility="isPrivate ? 'private' : 'public'"
          :help="t(isPrivate ? 'privateHelp' : 'publicHelp')"
        />
      </template>
    </card-shell>
  </custom-router-link>
</template>

<script setup lang="ts">
import type { Portal } from '#api/types/portal'
import { mdiWeb } from '@mdi/js'

const props = defineProps({
  portal: {
    type: Object as () => Portal,
    default: null
  },
  showOwner: Boolean
})

const { t } = useI18n()

const isPrivate = computed(() => props.portal.config.authentication === 'required')
// same rule as the "open the portal" action
const url = computed(() => props.portal.ingress?.url || $uiConfig.portalUrlPattern.replace('{subdomain}', props.portal._id))
</script>

<i18n lang="yaml">
  en:
    privateHelp: Login required to view the portal.
    publicHelp: Portal available without login.
  fr:
    privateHelp: Connexion requise pour consulter le portail.
    publicHelp: Portail accessible sans connexion.
</i18n>

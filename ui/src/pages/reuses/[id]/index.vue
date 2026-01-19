<template>
  <v-container data-iframe-height>
    <v-card>
      <v-tabs v-model="tab">
        <v-tab value="preview">
          {{ t('tabs.preview') }}
        </v-tab>
        <v-tab value="preview-draft">
          {{ t('tabs.previewDraft') }}
        </v-tab>
        <v-tab value="publications">
          <span>{{ t('tabs.publications') }}</span>
          <v-icon
            v-if="hasPendingPublicationRequest"
            :icon="mdiAlertCircle"
            color="warning"
            class="ml-1"
          />
        </v-tab>
      </v-tabs>

      <v-card-text class="pa-0">
        <portal-preview-provider>
          <v-tabs-window v-model="tab">
            <v-tabs-window-item
              value="preview"
              class="ma-4"
            >
              <reuse-preview-wrapper
                v-if="reuseFetch.data.value?.config"
                :reuse-config="reuseFetch.data.value.config"
                :slug="reuseFetch.data.value.slug"
              />
            </v-tabs-window-item>

            <v-tabs-window-item
              value="preview-draft"
              class="ma-4"
            >
              <reuse-preview-wrapper
                v-if="reuseFetch.data.value?.draftConfig"
                :reuse-config="reuseFetch.data.value.draftConfig"
                :slug="reuseFetch.data.value.slug"
              />
            </v-tabs-window-item>

            <v-tabs-window-item value="publications">
              <reuse-edit-publication />
            </v-tabs-window-item>
          </v-tabs-window>
        </portal-preview-provider>
      </v-card-text>
    </v-card>
    <navigation-right>
      <reuse-actions :reuse-id="route.params.id" />
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import { mdiAlertCircle } from '@mdi/js'

const { t } = useI18n()
const route = useRoute<'/reuses/[id]/'>()

const { reuseFetch } = useReuseStore()

const tab = useStringSearchParam('tab', { default: 'preview' })

const hasPendingPublicationRequest = computed(() => {
  const requestedPortals = reuseFetch.data.value?.requestedPortals
  return Array.isArray(requestedPortals) && requestedPortals.length > 0
})

watch(reuseFetch.data, (reuse) => {
  if (!reuse) return
  setBreadcrumbs([
    { text: t('reuses'), to: '/reuses' },
    { text: reuse.title }
  ])
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    reuses: Reuses
    tabs:
      preview: Preview
      previewDraft: Preview (draft)
      publications: Publications
      informations: Informations

  fr:
    reuses: Réutilisations
    tabs:
      preview: Aperçu
      previewDraft: Aperçu (brouillon)
      publications: Publications
      informations: Informations

</i18n>

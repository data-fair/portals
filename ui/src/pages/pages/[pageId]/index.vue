<template>
  <v-container data-iframe-height>
    <v-card>
      <v-tabs
        v-model="tab"
        :items="[
          { text: t('tabs.preview'), value: 'preview' },
          { text: t('tabs.previewDraft'), value: 'preview-draft' },
          // { text: t('tabs.permissions'), value: 'permissions' },
          { text: t('tabs.publications'), value: 'publications' },
          { text: t('tabs.informations'), value: 'informations' }
        ]"
      />

      <!-- no v-card-text around the windows: the preview panes carry the page background of
           the portal edge to edge, like v-main does there, and pad their content themselves -->
      <v-tabs-window v-model="tab">
        <portal-preview-provider>
          <v-tabs-window-item value="preview">
            <!-- a v-sheet, not a bg-background class: v-theme-provider renders no element of
                 its own, so only a vuetify component carries the preview theme vars -->
            <v-sheet
              color="background"
              class="pa-4"
            >
              <page-elements :model-value="pageFetch.data.value?.config.elements" />
            </v-sheet>
          </v-tabs-window-item>

          <v-tabs-window-item value="preview-draft">
            <v-sheet
              color="background"
              class="pa-4"
            >
              <page-elements :model-value="pageFetch.data.value?.draftConfig.elements" />
            </v-sheet>
          </v-tabs-window-item>
        </portal-preview-provider>

        <!-- <v-tabs-window-item value="permissions">
            TODO: add permissions management
          </v-tabs-window-item> -->

        <v-tabs-window-item
          value="publications"
          class="pa-4"
        >
          <page-edit-publication />
        </v-tabs-window-item>

        <v-tabs-window-item
          value="informations"
          class="pa-4"
        >
          <page-activity />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
    <navigation-right>
      <page-actions />
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const { t } = useI18n()
const { pageFetch } = usePageStore()
const tab = useStringSearchParam('tab', { default: 'preview' })

watch(pageFetch.data, (page) => {
  if (!page) return
  setBreadcrumbs([
    { text: t('pages'), to: '/pages' },
    { text: page.title }
  ])
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    confirmDeletePage: Are you sure you want to delete the page "{title}"? This action is irreversible and data cannot be recovered.
    deletePage: Delete page
    deletingPage: Deleting page
    editPage: Edit page
    no: No
    pages: Pages
    tabs:
      permissions: Permissions
      preview: Preview
      previewDraft: Preview (draft)
      publications: Publications
      informations: Informations
    yes: Yes

  fr:
    confirmDeletePage: Êtes-vous sûr de vouloir supprimer la page "{title}" ? Cette action est définitive et les données ne pourront pas être récupérées.
    deletePage: Supprimer la page
    deletingPage: Suppression de la page
    editPage: Éditer la page
    no: Non
    pages: Pages
    tabs:
      permissions: Permissions
      preview: Aperçu
      previewDraft: Aperçu (brouillon)
      publications: Publications
      informations: Informations
    yes: Oui

</i18n>

<template>
  <v-container
    data-iframe-height
    style="min-height: 500px"
  >
    <v-card>
      <v-tabs
        v-model="tab"
        :items="[
          { text: t('tabs.preview'), value: 'preview' },
          { text: t('tabs.previewDraft'), value: 'preview-draft' },
          { text: t('tabs.permissions'), value: 'permissions' },
          { text: t('tabs.publications'), value: 'publications' },
          { text: t('tabs.informations'), value: 'informations' }
        ]"
      />

      <v-card-text>
        <portal-preview-provider>
          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="preview">
              <page-elements :model-value="pageFetch.data.value?.config.elements" />
            </v-tabs-window-item>

            <v-tabs-window-item value="preview-draft">
              <page-elements :model-value="pageFetch.data.value?.draftConfig.elements" />
            </v-tabs-window-item>

            <!-- <v-tabs-window-item value="permissions">
              TODO: add permissions management
            </v-tabs-window-item> -->

            <v-tabs-window-item value="publications">
              <page-edit-publication />
            </v-tabs-window-item>

            <v-tabs-window-item value="informations">
              <page-activity />
            </v-tabs-window-item>
          </v-tabs-window>
        </portal-preview-provider>
      </v-card-text>
    </v-card>
    <navigation-right>
      <page-actions
        :group-id="route.params.groupId"
        :page-id="route.params.pageId"
      />
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const { t } = useI18n()
const route = useRoute<'/pages/[groupId]/[pageId]'>()

const { pageFetch } = usePageStore()

const tab = useStringSearchParam('tab', { default: 'preview' })

const groupTitle = computed(() => {
  const page = pageFetch.data.value
  if (!page) return ''
  if (page.type === 'generic' && page.config.genericMetadata?.group) return page.config.genericMetadata.group.title
  return t('groupTitle.' + route.params.groupId)
})

watch(pageFetch.data, (page) => {
  if (!page) return
  setBreadcrumbs([
    { text: t('pages'), to: '/pages' },
    { text: groupTitle.value, to: `/pages/${route.params.groupId}` },
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
    groupTitle:
      standard: Standard pages
      event: Events
      news: News
      default: Other pages
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
    groupTitle:
      standard: Pages standard
      event: Événements
      news: Actualités
      default: Autres pages
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

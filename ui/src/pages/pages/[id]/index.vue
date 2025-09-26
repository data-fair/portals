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
          { text: t('tabs.publications'), value: 'publications' }
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

            <v-tabs-window-item value="permissions">
              TODO
            </v-tabs-window-item>

            <v-tabs-window-item value="publications">
              <page-edit-publication />
            </v-tabs-window-item>
          </v-tabs-window>
        </portal-preview-provider>
      </v-card-text>
    </v-card>
    <navigation-right>
      <v-list-item
        :to="`/pages/${route.params.id}/edit-config`"
        :title="t('editPage')"
      >
        <template #prepend>
          <v-icon
            color="primary"
            :icon="mdiPencil"
          />
        </template>
      </v-list-item>
      <v-divider class="my-2" />
      <v-menu
        :close-on-content-click="false"
        max-width="500"
      >
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            :title="t('deletePage')"
          >
            <template #prepend>
              <v-icon
                color="warning"
                :icon="mdiDelete"
              />
            </template>
          </v-list-item>
        </template>
        <template #default="{isActive}">
          <v-card
            variant="elevated"
            :title="t('deletingPage')"
            :text="t('confirmDeletePage', { title: pageFetch.data.value?.title })"
            :loading="deletePage.loading.value ? 'warning' : undefined"
          >
            <v-card-actions>
              <v-spacer />
              <v-btn
                :disabled="deletePage.loading.value"
                @click="isActive.value = false"
              >
                {{ t('no') }}
              </v-btn>
              <v-btn
                color="warning"
                variant="flat"
                :loading="deletePage.loading.value"
                @click="deletePage.execute()"
              >
                {{ t('yes') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-menu>
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import { mdiPencil } from '@mdi/js'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import PageElements from '#portal/app/components/page/page-elements.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute<'/pages/[id]/'>()

const { pageFetch } = usePageStore()

const tab = useStringSearchParam('tab', { default: 'preview' })

const deletePage = useAsyncAction(async () => {
  await $fetch(`pages/${route.params.id}`, { method: 'DELETE' })
  router.push('/pages/')
})

watch(pageFetch.data, (page) => {
  if (!page) return
  setBreadcrumbs([{
    text: t('pages'),
    to: '/pages'
  }, {
    text: page.config.title
  }])
})

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
    yes: Oui

</i18n>

<style lang="css">
.vjsf-node-list>.v-card>.v-list>.v-divider {
  display: none;
}
.v-dialog>.vjsf-edit-dialog-content {
  right: 0;
  margin: 0;
  top: 0;
  bottom: 0;
  max-height: 100%;
  height: 100%;
  width: 500px;
}
</style>

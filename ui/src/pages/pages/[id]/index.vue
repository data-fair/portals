<template>
  <v-container
    data-iframe-height
    style="min-height: 500px"
  >
    <v-card>
      <v-tabs
        v-model="tab"
      >
        <v-tab value="preview">
          Aperçu
        </v-tab>
        <v-tab value="preview-draft">
          Aperçu (brouillon)
        </v-tab>
        <v-tab value="permissions">
          Permissions
        </v-tab>
        <v-tab value="publications">
          Publications
        </v-tab>
      </v-tabs>

      <v-card-text>
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
      </v-card-text>
    </v-card>
    <navigation-right>
      <v-list-item :to="`/pages/${route.params.id}/edit-config`">
        <template #prepend>
          <v-icon
            color="primary"
            :icon="mdiPencil"
          />
        </template>
        Éditer la page
      </v-list-item>
      <v-divider class="my-2" />
      <v-menu
        :close-on-content-click="false"
        max-width="500"
      >
        <template #activator="{ props }">
          <v-list-item v-bind="props">
            <template #prepend>
              <v-icon
                color="warning"
                :icon="mdiDelete"
              />
            </template>
            Supprimer la page
          </v-list-item>
        </template>
        <template #default="{isActive}">
          <v-card
            title="Suppression de la page"
            variant="elevated"
            :loading="deletePage.loading.value ? 'warning' : false"
          >
            <v-card-text>
              Voulez-vous vraiment supprimer la page "{{ pageFetch.data.value?.title }}" ? La suppression est définitive et les données ne pourront pas être récupérées.
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                :disabled="deletePage.loading.value"
                @click="isActive.value = false"
              >
                Non
              </v-btn>
              <v-btn
                color="warning"
                variant="flat"
                :loading="deletePage.loading.value"
                @click="deletePage.execute()"
              >
                Oui
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
import PageElements from '../../../../../portal/app/components/page/page-elements.vue'

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
    text: 'Pages',
    to: '/pages'
  }, {
    text: page.config.title
  }])
})

</script>

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

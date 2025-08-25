<template>
  <v-container
    data-iframe-height
    style="min-height: 500px"
  >
    <v-row>
      <v-col>
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
      </v-col>
      <navigation-right>
        <v-list
          density="compact"
          data-iframe-height
        >
          <v-list-item
            :to="`/pages/${route.params.id}/edit-config`"
          >
            <template #prepend>
              <v-icon
                color="primary"
                :icon="mdiPencil"
              />
            </template>
            Éditer la page
          </v-list-item>
        </v-list>
      </navigation-right>
    </v-row>
  </v-container>
</template>

<!--
<i18n lang="yaml">
fr:
en:
</i18n>
-->

<script lang="ts" setup>
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import { mdiPencil } from '@mdi/js'
import PageElements from '../../../../../portal/app/components/page/page-elements.vue'

const route = useRoute<'/pages/[id]/'>()

const { pageFetch } = usePageStore()

const tab = useStringSearchParam('tab', { default: 'preview' })

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

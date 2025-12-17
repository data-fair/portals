<template>
  <v-container
    data-iframe-height
    style="min-height: 500px"
  >
    <v-card>
      <v-tabs
        v-model="tab"
        :items="[
          // { text: t('tabs.preview'), value: 'preview' }, // TODO: add preview of the reuse
          { text: t('tabs.publications'), value: 'publications' }
        ]"
      />

      <v-card-text>
        <v-tabs-window v-model="tab">
          <!-- <v-tabs-window-item value="preview">
            TODO: add preview of the reuse
          </v-tabs-window-item> -->

          <v-tabs-window-item value="publications">
            <reuse-edit-publication />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
    <navigation-right>
      <reuse-actions :reuse-id="route.params.id" />
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const { t } = useI18n()
const route = useRoute<'/reuses/[id]/'>()

const { reuseFetch } = useReuseStore()

const tab = useStringSearchParam('tab', { default: 'preview' })

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
      publications: Publications
      informations: Informations

  fr:
    reuses: Réutilisations
    tabs:
      preview: Aperçu
      publications: Publications
      informations: Informations

</i18n>

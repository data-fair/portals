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
          { text: t('tabs.publications'), value: 'publications' },
          { text: t('tabs.informations'), value: 'informations' }
        ]"
      />

      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="preview">
            <use-preview :use-config="useFetch.data.value?.config" />
          </v-tabs-window-item>

          <v-tabs-window-item value="publications">
            <use-edit-publication />
          </v-tabs-window-item>

          <v-tabs-window-item value="informations">
            <use-activity />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
    <navigation-right>
      <use-actions :use-id="route.params.id" />
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const { t } = useI18n()
const route = useRoute<'/uses/[id]'>()

const { useFetch } = useUseStore()

const tab = useStringSearchParam('tab', { default: 'preview' })

watch(useFetch.data, (use) => {
  if (!use) return
  setBreadcrumbs([
    { text: t('uses'), to: '/uses' },
    { text: use.title }
  ])
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    uses: Uses
    tabs:
      preview: Preview
      publications: Publications
      informations: Informations

  fr:
    uses: Réutilisations
    tabs:
      preview: Aperçu
      publications: Publications
      informations: Informations

</i18n>

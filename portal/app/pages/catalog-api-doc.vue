<template>
  <!-- Minimal layout (default): the API documentation iframe fills the whole viewport -->
  <d-frame-wrapper
    v-if="!keepPortalLayout"
    :iframe-title="t('apiDoc')"
    :src="`/openapi-viewer/?urlType=catalog`"
    class="fill-height"
    resize="no"
    sync-params
  />

  <!-- Portal layout kept: header, navigation and footer stay around the iframe
       (RGAA 12.2/12.6/12.7). We reproduce the "full" layout's main/container chain so
       the iframe fills the height (h-100 / fill-height), and expose the #contenu
       skip-link target directly — deliberately without any breadcrumb. -->
  <v-main v-else>
    <div
      id="contenu"
      ref="contentEl"
      tabindex="-1"
      class="h-100"
    >
      <v-container
        fluid
        class="pa-0 h-100"
      >
        <d-frame-wrapper
          :iframe-title="t('apiDoc')"
          :src="`/openapi-viewer/?urlType=catalog`"
          class="fill-height"
          sync-params
        />
      </v-container>
    </div>
  </v-main>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'full' })

const { setBreadcrumbs } = useNavigationStore()
const { portalConfig } = usePortalStore()
const { t } = useI18n()

const keepPortalLayout = computed(() => portalConfig.value.catalogApiDocFullLayout)
if (keepPortalLayout.value) setPageLayout('default')

// the d-frame wrapper gets an inline "height: <content>px; min-height: 0" on each resize
// message, so the iframe background stops with the content ; this shadow stylesheet wins
// over the inline style and makes the iframe fill at least the available height while
// still growing with the content
const contentEl = useTemplateRef('contentEl')
onMounted(async () => {
  if (!keepPortalLayout.value) return
  await customElements.whenDefined('d-frame')
  const dFrame = contentEl.value?.querySelector('d-frame')
  if (dFrame?.shadowRoot) {
    const style = document.createElement('style')
    style.textContent = '.d-frame-wrapper { min-height: 100% !important; }'
    dFrame.shadowRoot.appendChild(style)
  }
})

setBreadcrumbs([
  { type: 'standard', subtype: 'datasets' },
  { title: t('apiDoc') }
])

usePageSeo({
  title: t('apiDoc'),
  description: t('apiDocDescription')
})
</script>

<i18n lang="yaml">
  en:
    dataset: Datasets
    apiDoc: Catalog API Documentation
    apiDocDescription: API documentation for developers wishing to explore or harvest the data catalog.
  fr:
    dataset: Jeux de données
    apiDoc: Documentation de l'API du catalogue
    apiDocDescription: Documentation de l'API à destination de développeurs souhaitant explorer ou moissonner le catalogue de données.
</i18n>

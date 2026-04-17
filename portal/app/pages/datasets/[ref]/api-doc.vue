<template>
  <!-- TODO: API Doc-->
  <!-- <p
    v-if="useReadApiKey && actualReadApiKey"
    class="my-0 mx-2"
  >
    Cette API peut être utilisée sans authentification grâce à une clé que vous pouvez renseigner dans le paramètre de requête "apiKey". La clé est régulièrement renouvellée, elle expirera le {{ $d(new Date(dataset.readApiKey.expiresAt)) }}.
    <br>
    Utilisation de la clé : <a class="simple-link" :href="readApiKeyExample">{{ readApiKeyExample }}</a>
  </p> -->
  <d-frame-wrapper
    :iframe-title="`${t('dataset')} - ${datasetFetch.data.value?.title} - ${t('apiDoc')}`"
    :src="`/openapi-viewer/?urlType=dataset&id=${$route.params.ref}`"
    class="fill-height"
    resize="no"
    sync-params
  />
</template>

<script setup lang="ts">
import type { LinkItem } from '#api/types/portal'
import type { VBreadcrumbs } from 'vuetify/components'

type BreadcrumbItem = NonNullable<VBreadcrumbs['$props']['items']>[number]

definePageMeta({ layout: 'full' })

const { setBreadcrumbs } = useNavigationStore()
const { t } = useI18n()
const route = useRoute()

const standardPagesFetch = await useFetch<Record<string, boolean>>('/portal/api/pages/standard-exists', { watch: false })
const datasetsCatalogExists = computed(() => standardPagesFetch.data.value?.datasets || false)

const datasetFetch = await useLocalFetch<{ title: string, summary: string, description: string, updatedAt?: string }>(`/data-fair/api/v1/datasets/${route.params.ref}`)

watch([datasetFetch.data, datasetsCatalogExists], () => {
  const items: (LinkItem | BreadcrumbItem)[] = []
  if (datasetsCatalogExists.value) { items.push({ type: 'standard', subtype: 'datasets' }) }
  items.push({ title: datasetFetch.data.value?.title || t('dataset'), to: '/datasets/' + route.params.ref })
  items.push({ title: t('apiDoc') })
  setBreadcrumbs(items)
}, { immediate: true })

usePageSeo({
  title: () => t('apiDoc') + ' - ' + (datasetFetch.data.value?.title || t('dataset')),
  description: () => datasetFetch.data.value?.summary
})

onMounted(() => window.parent.postMessage(['df-child', 'reinit-height'], '*'))
</script>

<i18n lang="yaml">
  en:
    dataset: Dataset
    apiDoc: API Documentation
  fr:
    dataset: Jeu de données
    apiDoc: Documentation de l'API
</i18n>

<!-- <script setup lang="ts">

export default {
  components: {
    Error,
    DFrameWrapper: () => process.client ? import('../../../components-no-autoload/d-frame-wrapper.vue') : null
  },
  layout: 'minimal',
  middleware: 'portal-required',
  data: () => ({
    dataset: null,
    actualReadApiKey: null
  }),
  async fetch () {
    this.dataset = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets/' + this.$route.params.ref, {
      params: {
        html: 'vuetify',
        publicationSites: 'data-fair-portals:' + this.portal._id
      }
    })
    if (this.useReadApiKey) {
      this.actualReadApiKey = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/datasets/' + this.$route.params.ref + '/read-api-key')
    }
  },
  head () {
    return datasetPageHead(this.dataset, null, this.pageUrl, true)
  },
  computed: {
    ...mapState(['config', 'publicUrl', 'portal', 'draft']),
    ...mapGetters(['dataFairUrl', 'openapiViewerUrl']),
    pageUrl () {
      return this.publicUrl + '/datasets/' + this.$route.params.ref + '/api-doc'
    },
    iframeSrc () {
      return `${this.openapiViewerUrl}/?urlType=dataset&id=${this.$route.params.ref}`
    },
    useReadApiKey () {
      return this.dataset.userPermissions.includes('getReadApiKey') && this.dataset.readApiKey?.active
    },
    readApiKeyExample () {
      return `${this.dataFairUrl}/api/v1/datasets/${this.$route.params.ref}/lines?apiKey=${this.actualReadApiKey?.current}`
    }
  }
}
</script> -->

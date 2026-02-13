<template>
  <v-container data-iframe-height>
    <theme-loader v-if="editConfig" />

    <v-defaults-provider
      :defaults="{
        global: {
          hideDetails: 'auto'
        },
        VjsfVerticalTabs: {
          VBtn: { class: 'text-none' },
          VTabs: { color: 'primary' }
        }
      }"
    >
      <v-form
        v-if="editConfig"
        v-model="formValid"
      >
        <vjsf-portal-config
          v-if="vjsfOptions"
          v-model="editConfig"
          :locale="locale"
          :options="vjsfOptions"
          @update:model-value="saveDraft.execute()"
        >
          <template #colors-preview="context">
            <colors-preview
              :colors-key="context.colorsKey"
              :theme="context.node.data"
              :dark="context.dark"
            />
          </template>
          <template #font-families-preview>
            <font-families-preview />
          </template>
          <template #nav-link-preview="{ node }">
            <nav-link-preview
              v-if="formValid"
              :config="node.data.navLinksConfig"
            />
          </template>

          <template #app-bar-preview="context">
            <preview
              :append-title="context.home ? t('appBarPreview') + ' - ' + t('home'): t('appBarPreview')"
              no-padding
            >
              <layout-app-bar
                v-if="formValid"
                :home="context.home"
              />
            </preview>
          </template>
          <template #footer-preview>
            <preview
              :append-title="t('footer')"
              no-padding
            >
              <layout-footer v-if="formValid" />
            </preview>
          </template>
          <template #breadcrumb-preview>
            <preview
              :append-title="t('breadcrumbs')"
              no-padding
            >
              <layout-breadcrumbs v-if="formValid" />
            </preview>
          </template>

          <template #dataset-card-preview="{ node }">
            <card-preview
              :card-config="node.data.card"
              type="dataset"
            />
          </template>
          <template #application-card-preview="{ node }">
            <card-preview
              :card-config="node.data.card"
              type="application"
            />
          </template>
          <template #reuse-card-preview="{ node }">
            <card-preview
              :card-config="node.data.card"
              type="reuse"
            />
          </template>

          <template #color-select-item="context">
            <v-theme-provider theme="preview-colors">
              <v-list-item v-bind="context.props">
                <template #prepend>
                  <v-sheet
                    :style="{ backgroundColor: context.node.props?.background ? `rgb(var(--v-theme-${context.item.raw.value}))` : `rgb(var(--v-theme-text-${context.item.raw.value}, var(--v-theme-${context.item.raw.value})))` }"
                    :height="20"
                    :width="20"
                    class="mr-4"
                    rounded="circle"
                    border
                  />
                </template>
              </v-list-item>
            </v-theme-provider>
          </template>
          <template #color-select-selection="context">
            <v-theme-provider theme="preview-colors">
              <span class="v-select__selection-text d-inline-flex align-center">
                <v-sheet
                  :style="{ backgroundColor: context.node.props?.background ? `rgb(var(--v-theme-${context.item.raw.value}))` : `rgb(var(--v-theme-text-${context.item.raw.value}, var(--v-theme-${context.item.raw.value})))` }"
                  :height="20"
                  :width="20"
                  class="mr-2"
                  rounded="circle"
                  border
                />
                {{ context.item.raw.title }}
              </span>
            </v-theme-provider>
          </template>

          <!-- TODO: fix vjsf bug -->
          <!-- <template #link-item-summary="{ node }">
            <link-item-summary :item="node.data" />
          </template> -->
          <template #image-upload="{ node, statefulLayout, width, height, label }">
            <image-upload
              :model-value="node.data"
              :label="label"
              :width="width"
              :height="height"
              :resource="{ type: 'portal', _id: route.params.id }"
              @update:model-value="(data: any) => statefulLayout.input(node, data)"
            />
          </template>
        </vjsf-portal-config>
      </v-form>
    </v-defaults-provider>

    <navigation-right v-if="portalFetch.data.value">
      <portal-actions
        :has-draft-diff="hasDraftDiff"
        :is-saving-draft="saveDraft.loading.value"
        :portal="{
          id: route.params.id,
          title: portalFetch.data.value.config.title,
          url: portalFetch.data.value.ingress?.url,
          whiteLabel: portalFetch.data.value.whiteLabel,
          isReference: portalFetch.data.value.isReference
        }"
        @refresh-portal="portalFetch.refresh()"
      />
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import type { Portal, PortalConfig } from '#api/types/portal'
import type { Page, Group } from '#api/types/page'
import type { Options as VjsfOptions } from '@koumoul/vjsf'

import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import equal from 'fast-deep-equal'

const { t, locale } = useI18n()
const session = useSessionAuthenticated()
const route = useRoute<'/portals/[id]/'>()

const portalFetch = useFetch<Portal>($apiPath + '/portals/' + route.params.id)
const editConfig = ref<PortalConfig>()
const formValid = ref(false)
const { portalConfig } = providePortalStore()

// Initialize editConfig and portalStore when init portal config is fetched
watch(portalFetch.data, () => {
  if (!portalFetch.data.value) return
  editConfig.value = portalFetch.data.value.draftConfig
  portalConfig.value = editConfig.value
})
// Synchronize editConfig changes back to portalConfig
watch(editConfig, (newConfig) => {
  if (newConfig) portalConfig.value = newConfig
})

const saveDraft = useAsyncAction(async () => {
  if (!formValid.value) return
  await $fetch(`/portals/${route.params.id}`, { method: 'PATCH', body: { draftConfig: editConfig.value } })
})

const hasDraftDiff = computed(() => {
  return !equal(editConfig.value, portalFetch.data.value?.config)
})

watch(portalFetch.data, (portal) => {
  if (!portal) return
  setBreadcrumbs([{ text: t('portals'), to: '/portals' }, { text: portal.config.title }])
})

const pagesFetch = useFetch<{ results: Page[] }>($apiPath + '/pages', {
  query: {
    portal: route.params.id,
    type: 'event,news,generic',
    select: '_id,type,title,config.title,config.eventMetadata,config.newsMetadata,config.genericMetadata',
    size: 1000,
    sort: 'config.title'
  }
})

// List of pages that can be linked in the portal
const pages = computed(() => {
  const results = pagesFetch.data.value?.results ?? []
  if (!results.length) return { event: [], news: [], generic: [] }

  const result = { event: [], news: [], generic: [] } as Record<'event' | 'news' | 'generic', any[]>
  const genericByGroup: Record<string, { title: string, pages: any[] }> = {} // store each group of generic pages

  results.forEach(page => {
    const metaKey = page.type + 'Metadata' // 'eventMetadata' | 'newsMetadata' | 'genericMetadata'
    const metadata = page.config[metaKey] as Page['config']['eventMetadata'] | Page['config']['newsMetadata'] | Page['config']['genericMetadata']
    if (!metadata) return

    const item = {
      key: page._id,
      slug: metadata.slug,
      title: page.config.title,
      titleBackOffice: page.title,
      group: metadata.group as Group | undefined,
    }

    if (page.type === 'generic') {
      const groupId = item.group?._id ?? 'no-group'
      genericByGroup[groupId] ??= { title: item.group?.title ?? 'Sans groupe', pages: [] }
      genericByGroup[groupId].pages.push(item)
    } else {
      result[page.type as 'event' | 'news'].push(item)
    }
  })

  // insert headers for generic pages
  Object.values(genericByGroup).forEach(({ title, pages }) => {
    result.generic.push({ title, header: true }, ...pages)
  })

  return result
})

const vjsfOptions = computed<VjsfOptions | null>(() => ({
  context: {
    pages: pages.value,
    owner: session.account.value,
    // used by schema https://github.com/data-fair/lib/theme to hide some parts
    simplifiedTheme: true
  },
  density: 'comfortable',
  initialValidation: 'always',
  titleDepth: 4,
  updateOn: 'blur'
}))

</script>

<i18n lang="yaml">
  en:
    appBarPreview: Header & Navigation Bar
    breadcrumbs: Breadcrumbs
    footer: Footer
    home: Home
    portals: Portals
  fr:
    appBarPreview: Entête & Barre de navigation
    breadcrumbs: Fil d'Ariane
    footer: Pied de page
    home: Accueil
    portals: Portails
</i18n>

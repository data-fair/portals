<template>
  <v-container data-iframe-height>
    <v-defaults-provider
      :defaults="{
        global: {
          hideDetails: 'auto'
        },
        VSwitch: {
          color: 'primary'
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
            <preview>
              <font-families-preview />
            </preview>
          </template>
          <template #app-bar-preview="context">
            <preview>
              <layout-app-bar
                v-if="formValid"
                :home="context.home"
              />
            </preview>
          </template>
          <template #footer-preview="context">
            <preview>
              <layout-footer
                v-if="formValid"
                :home="context.home"
              />
            </preview>
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
              :resource="portalRef"
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
        :portal-title="portalFetch.data.value.config.title"
        :portal-url="portalFetch.data.value.ingress?.url"
        @refresh-portal="portalFetch.refresh()"
      />
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import type { Portal, PortalConfig } from '#api/types/portal'
import type { Page, Groupe } from '#api/types/page'
import type { Options as VjsfOptions } from '@koumoul/vjsf'

import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import equal from 'fast-deep-equal'

const { t, locale } = useI18n()
const session = useSession()
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

const portalRef = { type: 'portal' as const, _id: route.params.id }

const saveDraft = useAsyncAction(async () => {
  if (!formValid.value) return
  await $fetch(`/portals/${route.params.id}`, { method: 'PATCH', body: { draftConfig: editConfig.value } })
})

const hasDraftDiff = computed(() => {
  return !equal(editConfig.value, portalFetch.data.value?.config)
})

watch(portalFetch.data, (portal) => {
  if (!portal) return
  setBreadcrumbs([{
    text: t('portals'),
    to: '/portals'
  }, {
    text: portal.config.title
  }])
})

const pagesFetch = useFetch<{ results: Page[] }>($apiPath + '/pages', {
  query: {
    portal: route.params.id,
    type: 'event,news,generic',
    select: '_id,type,config.title,config.eventMetadata,config.newsMetadata,config.genericMetadata',
    limit: 1000,
    sort: 'config.title'
  }
})

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
      group: metadata.group as Groupe | undefined,
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
    portals: Portals
    appBarPreview: App Bar Preview
  fr:
    portals: Portails
    appBarPreview: Aperçu du header et de la barre de navigation
</i18n>

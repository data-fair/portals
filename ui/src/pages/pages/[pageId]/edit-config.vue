<template>
  <v-container data-iframe-height>
    <page-config-errors :errors="storedConfigErrors" />
    <portal-preview-provider>
      <v-form
        v-if="editConfig"
        v-model="formValid"
      >
        <div class="d-flex justify-end mb-1">
          <df-agent-chat-action
            action-id="configure-page"
            :visible-prompt="t('configurePrompt')"
            :hidden-context="configureContext"
          />
        </div>
        <vjsf-page-config
          v-model="editConfig"
          :locale="locale"
          :options="vjsfOptions"
          @update:model-value="saveDraft.execute()"
        >
          <template #page-elements="{node, statefulLayout}">
            <v-defaults-provider :defaults="vjsfDefaults">
              <page-edit-elements
                :model-value="node.data"
                :add-item-message="t('addItemMessage')"
                :pages="pages"
                root
                @update:model-value="(data: any) => statefulLayout.input(node, data)"
              />
            </v-defaults-provider>
          </template>

          <template #image-upload="{ node, statefulLayout, width, height, label }">
            <image-upload
              :model-value="node.data"
              :label="label"
              :width="width"
              :height="height"
              :resource="pageRef"
              hide-details="auto"
              @update:model-value="(data: any) => statefulLayout.input(node, data)"
            />
          </template>
        </vjsf-page-config>
      </v-form>
    </portal-preview-provider>

    <navigation-right>
      <page-edit-actions :changes-stack="changesStack" />
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import type { Options as VjsfOptions } from '@koumoul/vjsf'
import type { Page, Group, PageConfig } from '#api/types/page/index.ts'
import type { ErrorObject } from 'ajv'

import equal from 'fast-deep-equal'
import { validate as validatePageConfig } from '#api/types/page-config/index.ts'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import { DfAgentChatAction } from '@data-fair/lib-vuetify-agents'
import { usePageConfigWebMCP } from '~/composables/use-page-config-webmcp'

const { t, locale } = useI18n()
const route = useRoute<'/pages/[pageId]/edit-config'>()
const pageRef = { type: 'page' as const, _id: inject('page-id') as string }

const { pageFetch, patchPage } = usePageStore()

const editConfig = ref<PageConfig>()
// errors of the stored config that healing could not fix, they block the draft saves
// and the form does not display the ones carried by page elements
const storedConfigErrors = ref<string[]>([])
watch(pageFetch.data, () => {
  if (!pageFetch.data.value) return
  // old configs can carry properties that the schema rejects (leftovers of an element
  // type switch, propagated by page duplication), the form would be invalid from the
  // start and saving the draft would be silently blocked. The validate function is
  // compiled with removeAdditional and strips them from its input.
  const draftConfig = structuredClone(toRaw(pageFetch.data.value.draftConfig))
  if (validatePageConfig(draftConfig)) {
    storedConfigErrors.value = []
  } else {
    const validationErrors = (validatePageConfig as unknown as { errors?: ErrorObject[] | null }).errors ?? []
    storedConfigErrors.value = [...new Set(validationErrors.map(error => `${error.instancePath} ${error.message}`))]
  }
  if (!equal(draftConfig, toRaw(pageFetch.data.value.draftConfig))) console.warn('removed properties rejected by the page config schema')
  if (equal(toRaw(editConfig.value), draftConfig)) return
  editConfig.value = draftConfig
}, { immediate: true })
provide('page-config', editConfig)

const changesStack = useChangesStack(editConfig)
const formValid = ref(false)

const pagesFetch = useFetch<{ results: Page[] }>($apiPath + '/pages', {
  query: {
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

const vjsfOptions = computed<VjsfOptions>(() => ({
  titleDepth: 4,
  density: 'compact',
  updateOn: 'blur',
  initialValidation: 'always',
  context: {
    pageType: pageFetch.data.value?.type,
    pages: pages.value
  },
  pluginsOptions: {
    markdown: {
      cspNonce: $cspNonce,
      easyMDEOptions: { previewRender: renderMarkdown }
    }
  }
}))
const vjsfDefaults = {
  'VjsfList-Edit-VDialog': {
    minHeight: '100%',
    opacity: 0.1,
    contentClass: 'right-0 ma-0',
    transition: 'slide-x-reverse-transition',
    persistent: false
  },
  'VjsfList-Edit-VDialog-VSheet': {
    rounded: '0'
  }
}

const saveDraft = useAsyncAction(async () => {
  if (!formValid.value) return
  await patchPage.execute({ draftConfig: editConfig.value })
  // the stored draft was accepted by the API, it no longer carries errors
  storedConfigErrors.value = []
})

const { configureContext } = usePageConfigWebMCP(editConfig, locale, (data: any) => {
  editConfig.value = { ...editConfig.value, ...data } as PageConfig
  saveDraft.execute()
})

watch(pageFetch.data, (page) => {
  if (!page) return
  setBreadcrumbs([
    { text: t('pages'), to: '/pages' },
    { text: page.title, to: `/pages/${route.params.pageId}` },
    { text: t('edit') }
  ])
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    addItemMessage: Add a block to the page
    edit: Editing draft
    pages: Pages
    pageConfig: Page configuration
    configurePrompt: Help me configure this page

  fr:
    addItemMessage: Ajouter un bloc à la page
    edit: Édition du brouillon
    pages: Pages
    pageConfig: Configuration de la page
    configurePrompt: Aide-moi à configurer cette page

</i18n>

<style lang="css">
/* Hide dividers in vjsf node list */
.vjsf-node-list>.v-card>.v-list>.v-divider {
  display: none;
}
</style>

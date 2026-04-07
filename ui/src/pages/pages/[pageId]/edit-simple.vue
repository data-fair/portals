<template>
  <v-container data-iframe-height>
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
      <vjsf-page-config-simple
        v-model="editConfig"
        :locale="locale"
        :options="vjsfOptions"
        :data-title="t('pageConfig')"
        prefix-name="pageConfig_"
        :sub-agent="true"
        @update:model-value="saveDraft.execute()"
      >
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
      </vjsf-page-config-simple>
    </v-form>

    <navigation-right>
      <page-edit-actions :changes-stack="changesStack" />
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import type { Options as VjsfOptions } from '@koumoul/vjsf'
import type { Page, Group, PageConfig } from '#api/types/page/index.ts'

import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import { DfAgentChatAction } from '@data-fair/lib-vuetify-agents'

const { t, locale } = useI18n()
const route = useRoute<'/pages/[pageId]/edit-simple'>()
const pageRef = { type: 'page' as const, _id: inject('page-id') as string }

const { pageFetch, patchPage } = usePageStore()

const editConfig = ref<PageConfig>()
watch(pageFetch.data, () => {
  if (pageFetch.data.value) editConfig.value = pageFetch.data.value.draftConfig
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

const configureContext = computed(() => {
  const lines = [
    'Use the subagent tool pageConfig_form to help the user configure this page.',
    'Start by asking the user what they want to achieve.',
  ]
  if (editConfig.value?.title) lines.push(`The page title is "${editConfig.value.title}".`)
  if (editConfig.value?.description) lines.push(`Description: ${editConfig.value.description}`)
  return lines.join(' ')
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

const saveDraft = useAsyncAction(async () => {
  if (!formValid.value) return
  await patchPage.execute({ draftConfig: editConfig.value })
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
    edit: Editing draft (simple)
    pages: Pages
    pageConfig: Page configuration
    configurePrompt: Help me configure this page

  fr:
    addItemMessage: Ajouter un bloc à la page
    edit: Édition du brouillon (simple)
    pages: Pages
    pageConfig: Configuration de la page
    configurePrompt: Aide-moi à configurer cette page

</i18n>

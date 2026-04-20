<template>
  <v-container data-iframe-height>
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
              <div
                v-if="markupEnabled"
                class="d-flex justify-end mb-2"
              >
                <v-btn-toggle
                  v-model="editMode"
                  density="compact"
                  mandatory
                  variant="outlined"
                  divided
                >
                  <v-btn value="form">
                    {{ t('formMode') }}
                  </v-btn>
                  <v-btn value="markup">
                    {{ t('markupMode') }}
                  </v-btn>
                </v-btn-toggle>
              </div>
              <page-edit-elements
                v-if="editMode === 'form'"
                :model-value="node.data"
                :add-item-message="t('addItemMessage')"
                :pages="pages"
                root
                @update:model-value="(data: any) => statefulLayout.input(node, data)"
              />
              <page-edit-elements-markup
                v-else
                :node="node"
                :stateful-layout="statefulLayout"
                :model-value="node.data"
                :pages="pages"
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

import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import { DfAgentChatAction } from '@data-fair/lib-vuetify-agents'
import { usePageConfigWebMCP } from '~/composables/use-page-config-webmcp'
import { shallowRef, watch } from 'vue'

// The same compiled layout backs: (a) the main <vjsf-page-config> mount on this page,
// (b) the inline per-element VJSF instance inside markup-element-form-widget.vue, and
// (c) the WebMCP agent StatefulLayout in use-page-config-webmcp.ts. All three share
// AJV validators, normalized layouts, expressions and skeleton trees; only
// options.context differs to select the right rendering behavior.
const pageConfigCompiledLayoutImports: Record<string, () => Promise<any>> = {
  fr: () => import('#api/types/page-config/.type/compiled-layout-fr.js'),
  en: () => import('#api/types/page-config/.type/compiled-layout-en.js')
}

const { t, locale } = useI18n()
const route = useRoute<'/pages/[pageId]/edit-config'>()
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

const vjsfOptions = computed<VjsfOptions>(() => ({
  titleDepth: 4,
  density: 'compact',
  updateOn: 'blur',
  initialValidation: 'always',
  context: {
    // `page-editor` activates the `page-elements` slot delegation on `/elements`,
    // which is what powers the Form/Markup toggle below. Other consumers of this
    // compiled layout (WebMCP, the markup-inline element form) pass different modes.
    mode: 'page-editor',
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

// Expose the outer compiled layout to descendants (via provide) so the markup inline
// form in markup-element-form-widget.vue can reuse it — no recompile, no duplicated
// schema, no duplicated AJV validators.
const pageConfigCompiledLayout = shallowRef<any>(null)
watch(locale, async (loc) => {
  const importFn = pageConfigCompiledLayoutImports[loc] ?? pageConfigCompiledLayoutImports.fr
  const mod = await importFn()
  pageConfigCompiledLayout.value = mod.compiledLayout
}, { immediate: true })
provide('vjsf:page-config-compiled-layout', pageConfigCompiledLayout)
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
})

const { configureContext } = usePageConfigWebMCP(editConfig, locale, (data: any) => {
  editConfig.value = { ...editConfig.value, ...data } as PageConfig
  saveDraft.execute()
})

const markupEnabled = computed(() => {
  if (typeof window === 'undefined') return false
  return window.localStorage?.getItem('df-markup-edit') === '1'
})
const editMode = ref<'form' | 'markup'>('form')

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
    formMode: Form
    markupMode: Markup

  fr:
    addItemMessage: Ajouter un bloc à la page
    edit: Édition du brouillon
    pages: Pages
    pageConfig: Configuration de la page
    configurePrompt: Aide-moi à configurer cette page
    formMode: Formulaire
    markupMode: Balisage

</i18n>

<style lang="css">
/* Hide dividers in vjsf node list */
.vjsf-node-list>.v-card>.v-list>.v-divider {
  display: none;
}
</style>

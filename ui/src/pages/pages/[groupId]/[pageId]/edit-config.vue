<template>
  <v-container data-iframe-height>
    <portal-preview-provider>
      <v-form
        v-if="editConfig"
        v-model="formValid"
      >
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
        </vjsf-page-config>
      </v-form>

      <navigation-right>
        <page-edit-actions :changes-stack="changesStack" />
      </navigation-right>
    </portal-preview-provider>
  </v-container>
</template>

<script lang="ts" setup>
import type { Options as VjsfOptions } from '@koumoul/vjsf'
import type { PageConfig } from '#api/types/page-config'
import type { Page, Group } from '#api/types/page'

import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const { t, locale } = useI18n()
const route = useRoute<'/pages/[groupId]/[pageId]/edit-config'>()

const { pageFetch, patchPage } = usePageStore()

const editConfig = ref<PageConfig>()
watch(pageFetch.data, () => {
  if (pageFetch.data.value) editConfig.value = pageFetch.data.value.draftConfig
}, { immediate: true })

const changesStack = useChangesStack(editConfig)
const formValid = ref(false)

const pagesFetch = useFetch<{ results: Page[] }>($apiPath + '/pages', {
  query: {
    type: 'event,news,generic',
    select: '_id,type,title,config.title,config.eventMetadata,config.newsMetadata,config.genericMetadata',
    limit: 1000,
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
  },
  VSwitch: {
    color: 'primary'
  }
}

const saveDraft = useAsyncAction(async () => {
  if (!formValid.value) return
  await patchPage.execute({ draftConfig: editConfig.value })
})

const groupTitle = computed(() => {
  const page = pageFetch.data.value
  if (!page) return ''
  if (page.type === 'generic' && page.config.genericMetadata?.group) return page.config.genericMetadata.group.title
  return t('groupTitle.' + route.params.groupId)
})

watch(pageFetch.data, (page) => {
  if (!page) return
  setBreadcrumbs([
    { text: t('pages'), to: '/pages' },
    { text: groupTitle.value, to: `/pages/${route.params.groupId}` },
    { text: page.title, to: `/pages/${route.params.groupId}/${route.params.pageId}` },
    { text: t('edit') }
  ])
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    addItemMessage: Add a block to the page
    edit: Editing draft
    groupTitle:
      default: Other pages
      event: Events
      news: News
      standard: Standard pages
    pages: Pages

  fr:
    addItemMessage: Ajouter un bloc à la page
    edit: Édition du brouillon
    groupTitle:
      default: Autres pages
      event: Événements
      news: Actualités
      standard: Pages standard
    pages: Pages

</i18n>

<style lang="css">
/* Hide dividers in vjsf node list */
.vjsf-node-list>.v-card>.v-list>.v-divider {
  display: none;
}
</style>

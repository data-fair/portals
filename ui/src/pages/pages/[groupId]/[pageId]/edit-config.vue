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

const vjsfOptions = computed<VjsfOptions>(() => ({
  titleDepth: 4,
  density: 'compact',
  updateOn: 'blur',
  initialValidation: 'always',
  context: {
    pageType: pageFetch.data.value?.type
  }
}))
const vjsfDefaults = {
  'VjsfList-Edit-VDialog': {
    minHeight: '100%',
    opacity: 0.1,
    contentClass: 'right-0 ma-0'
  },
  'VjsfList-Edit-VDialog-VSheet': {
    rounded: 's-lg e-0' // larger radius on left side, no radius on right side
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
    cancelDraft: Cancel draft
    contactInfoExample: <strong>My address</strong></br>Peace Street</br>75000Paris, France
    edit: Editing draft
    groupTitle:
      standard: Standard pages
      event: Events
      news: News
      default: Other pages
    pages: Pages
    redoLastChange: Redo last change
    undoLastChange: Undo last change
    validateDraft: Validate draft

  fr:
    addItemMessage: Ajouter un bloc à la page
    cancelDraft: Annuler le brouillon
    contactInfoExample: <strong>Mon adresse</strong></br>rue de la paix</br>75000 Paris, France
    edit: Édition du brouillon
    groupTitle:
      standard: Pages standard
      event: Événements
      news: Actualités
      default: Autres pages
    pages: Pages
    redoLastChange: Rétablir le dernier changement
    undoLastChange: Annuler le dernier changement
    validateDraft: Valider le brouillon

</i18n>

<style lang="css">
/* Hide dividers in vjsf node list */
.vjsf-node-list>.v-card>.v-list>.v-divider {
  display: none;
}
</style>

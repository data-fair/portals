<template>
  <v-container data-iframe-height>
    <portal-preview-provider>
      <v-form
        v-if="editConfig"
        v-model="formValid"
      >
        <vjsf-page-config
          v-model="editConfig"
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
        <!-- Validate draft -->
        <v-list-item
          :disabled="validateDraft.loading.value || saveDraft.loading.value"
          :title="t('validateDraft')"
          @click="validateDraft.execute()"
        >
          <template #prepend>
            <v-icon
              color="primary"
              :icon="mdiFileReplace"
            />
          </template>
        </v-list-item>
        <v-list-item
          :disabled="cancelDraft.loading.value || saveDraft.loading.value"
          :title="t('cancelDraft')"
          @click="cancelDraft.execute()"
        >
          <template #prepend>
            <v-icon
              color="warning"
              :icon="mdiCancel"
            />
          </template>
        </v-list-item>
      </navigation-right>
      <v-btn
        v-if="changesStack.canUndo.value"
        :icon="mdiUndo"
        :title="t('undoLastChange')"
        variant="flat"
        style="position: absolute; bottom: 16px; right: 70px;z-index:2300;"
        @click="changesStack.undo()"
      />
      <v-btn
        v-if="changesStack.canRedo.value"
        :icon="mdiRedo"
        :title="t('redoLastChange')"
        variant="flat"
        style="position: absolute; bottom: 16px; right: 16px;z-index:2300;"
        @click="changesStack.redo()"
      />
    </portal-preview-provider>
  </v-container>
</template>

<script lang="ts" setup>
import type { Options as VjsfOptions } from '@koumoul/vjsf'
import type { PageConfig } from '#api/types/page-config/index'

import VjsfMarkdown from '@koumoul/vjsf-markdown'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import { mdiFileReplace, mdiUndo, mdiRedo } from '@mdi/js'
import useChangesStack from '~/composables/use-changes-stack'

const { t } = useI18n()
const route = useRoute<'/pages/[id]/'>()

const { pageFetch, patchPage } = usePageStore()

const editConfig = ref<PageConfig>()
watch(pageFetch.data, () => {
  if (pageFetch.data.value) editConfig.value = pageFetch.data.value.draftConfig
}, { immediate: true })

const changesStack = useChangesStack(editConfig)
const formValid = ref(false)

const vjsfOptions: VjsfOptions = {
  titleDepth: 4,
  density: 'compact',
  locale: 'fr',
  updateOn: 'blur',
  initialValidation: 'always',
  plugins: [VjsfMarkdown]
}
const vjsfDefaults = {
  'VjsfList-Edit-VDialog': {
    width: '400px',
    persistent: true,
    scrollStrategy: 'none',
    opacity: 0.1,
    contentClass: 'vjsf-edit-dialog-content'
  }
}

const saveDraft = useAsyncAction(async () => {
  if (!formValid.value) return
  await patchPage.execute({ draftConfig: editConfig.value })
})

const cancelDraft = useAsyncAction(async () => {
  await $fetch(`pages/${route.params.id}/draft`, { method: 'DELETE' })
  await pageFetch.refresh()
  changesStack.reset()
})

const validateDraft = useAsyncAction(async () => {
  await $fetch(`pages/${route.params.id}/draft`, { method: 'POST' })
  await pageFetch.refresh()
  changesStack.reset()
})

watch(pageFetch.data, (page) => {
  if (!page) return
  setBreadcrumbs([{
    text: 'Pages',
    to: '/pages'
  }, {
    text: page.config.title
  }, {
    text: 'Édition'
  }])
})

</script>

<i18n lang="yaml">
  en:
    contactInfoExample: <strong>My address</strong></br>Peace Street</br>75000Paris, France
    addItemMessage: Add a block to the page
    validateDraft: Validate draft
    cancelDraft: Cancel draft
    undoLastChange: Undo last change
    redoLastChange: Redo last change

  fr:
    contactInfoExample: <strong>Mon adresse</strong></br>rue de la paix</br>75000 Paris, France
    addItemMessage: Ajouter un bloc à la page
    validateDraft: Valider le brouillon
    cancelDraft: Annuler le brouillon
    undoLastChange: Annuler le dernier changement
    redoLastChange: Rétablir le dernier changement

</i18n>

<style lang="css">
.vjsf-node-list>.v-card>.v-list>.v-divider {
  display: none;
}
.v-dialog>.vjsf-edit-dialog-content {
  right: 0;
  margin: 0;
  top: 0;
  bottom: 0;
  max-height: 100%;
  height: 100%;
  width: 500px;
}
</style>

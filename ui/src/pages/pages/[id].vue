<template>
  <v-container>
    <v-row>
      <v-col>
        {{ editConfig }}
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
                  add-item-message="ajouter un bloc à la page"
                  @update:model-value="(data: any) => statefulLayout.input(node, data)"
                />
              </v-defaults-provider>
            </template>
          </vjsf-page-config>
        </v-form>
      </v-col>
      <navigation-right>
        <v-list
          density="compact"
          data-iframe-height
        >
          <v-list-item
            :disabled="validateDraft.loading.value || saveDraft.loading.value"
            @click="validateDraft.execute()"
          >
            <template #prepend>
              <v-icon
                color="primary"
                :icon="mdiFileReplace"
              />
            </template>
            Valider le brouillon
          </v-list-item>
          <v-list-item
            :disabled="cancelDraft.loading.value || saveDraft.loading.value"
            @click="cancelDraft.execute()"
          >
            <template #prepend>
              <v-icon
                color="warning"
                :icon="mdiCancel"
              />
            </template>
            Annuler le brouillon
          </v-list-item>
        </v-list>
      </navigation-right>
    </v-row>
    <v-btn
      v-if="changesStack.canUndo.value"
      :icon="mdiUndo"
      title="annuler dernier changement"
      variant="flat"
      style="position: absolute; bottom: 16px; right: 70px;z-index:2300;"
      @click="changesStack.undo()"
    />
    <v-btn
      v-if="changesStack.canRedo.value"
      :icon="mdiRedo"
      title="rétablir dernier changement"
      variant="flat"
      style="position: absolute; bottom: 16px; right: 16px;z-index:2300;"
      @click="changesStack.redo()"
    />
  </v-container>
</template>

<!--
<i18n lang="yaml">
fr:
en:
</i18n>
-->

<script lang="ts" setup>
import { type Options as VjsfOptions } from '@koumoul/vjsf'
import VjsfMarkdown from '@koumoul/vjsf-markdown'
import { type Page } from '#api/types/page/index'
import { type PageConfig } from '#api/types/page-config/index'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import { mdiFileReplace, mdiUndo, mdiRedo } from '@mdi/js'
import useChangesStack from '~/composables/use-changes-stack'

const route = useRoute<'/pages/[id]'>()

provide('page-id', route.params.id)

const pageFetch = useFetch<Page>($apiPath + '/pages/' + route.params.id)
const editConfig = ref<PageConfig>()
watch(pageFetch.data, () => {
  if (pageFetch.data.value) editConfig.value = pageFetch.data.value.draftConfig
})

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
  await $fetch(`/pages/${route.params.id}`, { method: 'PATCH', body: { draftConfig: editConfig.value } })
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
  }])
})

</script>

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

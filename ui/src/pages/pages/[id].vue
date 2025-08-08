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
              <page-edit-elements
                :model-value="node.data"
                @update:model-value="(data: any) => statefulLayout.input(node, data)"
              />
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
      style="position: absolute; bottom: 16px; right: 70px;z-index:3000;"
      @click="changesStack.undo()"
    />
    <v-btn
      v-if="changesStack.canRedo.value"
      :icon="mdiRedo"
      title="rétablir dernier changement"
      variant="flat"
      style="position: absolute; bottom: 16px; right: 16px;z-index:3000;"
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

const pageFetch = useFetch<Page>($apiPath + '/pages/' + route.params.id)
const editConfig = ref<PageConfig>()
watch(pageFetch.data, () => {
  if (pageFetch.data.value) editConfig.value = pageFetch.data.value.draftConfig
})

const changesStack = useChangesStack(editConfig)

const formValid = ref(false)

const vjsfOptions: VjsfOptions = {
  titleDepth: 4,
  density: 'comfortable',
  locale: 'fr',
  updateOn: 'blur',
  initialValidation: 'always',
  plugins: [VjsfMarkdown]
}

const saveDraft = useAsyncAction(async () => {
  if (!formValid.value) return
  await $fetch(`/pages/${route.params.id}`, { method: 'PATCH', body: { draftConfig: editConfig.value } })
})

const cancelDraft = useAsyncAction(async () => {
  await $fetch(`pages/${route.params.id}/draft`, { method: 'DELETE' })
})

const validateDraft = useAsyncAction(async () => {
  await $fetch(`pages/${route.params.id}/draft`, { method: 'POST' })
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
</style>

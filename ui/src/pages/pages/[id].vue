<template>
  <v-container>
    <v-row>
      <v-col>
        {{ editConfig }}
        <v-form
          v-if="editConfig"
          v-model="formValid"
        >
          <vjsf
            v-if="vjsfOptions"
            v-model="editConfig"
            :schema="configSchema"
            :options="vjsfOptions"
            @update:model-value="saveDraft.execute()"
          >
            <template #page-preview-element="context">
              <page-preview-element v-bind="context" />
            </template>
          </vjsf>
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
  </v-container>
</template>

<!--
<i18n lang="yaml">
fr:
en:
</i18n>
-->

<script lang="ts" setup>
import Vjsf, { type Options as VjsfOptions } from '@koumoul/vjsf'
import VjsfMarkdown from '@koumoul/vjsf-markdown'
import { type Page } from '#api/types/page/index'
import { type PageConfig } from '#api/types/page-config/index'
import configSchema from '../../../../api/types/page-config/schema'
import Debug from 'debug'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import { mdiFileReplace } from '@mdi/js'

const debug = Debug('page-edit')

const route = useRoute<'/pages/[id]'>()

const pageFetch = useFetch<Page>($apiPath + '/pages/' + route.params.id)
const editConfig = ref<PageConfig>()
watch(pageFetch.data, () => {
  if (pageFetch.data.value) editConfig.value = pageFetch.data.value.draftConfig
})

const formValid = ref(false)

const vjsfOptions = computed<VjsfOptions | null>(() => {
  debug('compute vjsf options')
  return {
    titleDepth: 4,
    density: 'comfortable',
    locale: 'fr',
    updateOn: 'blur',
    initialValidation: 'always',
    plugins: [VjsfMarkdown]
  }
})

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
</style>

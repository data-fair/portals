<template>
  <v-container>
    <v-row>
      <v-col>
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
          />
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
import { type Portal } from '#api/types/portal/index'
import { type PortalConfig } from '#api/types/portal-config/index'
import configSchema from '../../../../api/types/portal-config/schema'
import Debug from 'debug'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import { mdiFileReplace } from '@mdi/js'

const debug = Debug('portal-edit')

const route = useRoute<'/portals/[id]'>()

const portalFetch = useFetch<Portal>($apiPath + '/portals/' + route.params.id)
const editConfig = ref<PortalConfig>()
watch(portalFetch.data, () => {
  if (portalFetch.data.value) editConfig.value = portalFetch.data.value.draftConfig
})

const formValid = ref(false)

const vjsfOptions = computed<VjsfOptions | null>(() => {
  debug('compute vjsf options')
  return {
    titleDepth: 4,
    density: 'comfortable',
    locale: 'fr',
    updateOn: 'blur',
    initialValidation: 'always'
  }
})

const saveDraft = useAsyncAction(async () => {
  console.log('SAVE DRAFT')
  await $fetch(`/portals/${route.params.id}`, { method: 'PATCH', body: { draftConfig: editConfig.value } })
  console.log('DONE')
})

const cancelDraft = useAsyncAction(async () => {
  await $fetch(`portals/${route.params.id}/draft`, { method: 'DELETE' })
})

const validateDraft = useAsyncAction(async () => {
  await $fetch(`portals/${route.params.id}/draft`, { method: 'POST' })
})

watch(portalFetch.data, (portal) => {
  if (!portal) return
  setBreadcrumbs([{
    text: 'Portails',
    to: '/portals'
  }, {
    text: portal.config.title
  }])
})

</script>

<style lang="css">
</style>

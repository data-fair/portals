<template>
  <v-container>
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
import configSchema from '../../../../../../api/types/portal-config/schema'
import Debug from 'debug'

const debug = Debug('portal-edit')

const route = useRoute<'/embed/portal/[id]/edit'>()

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
  await $fetch(`portals/${route.params.id}`, { method: 'PATCH', body: { draftConfig: editConfig.value } })
})

/*
const cancelDraft = useAsyncAction(async () => {
  await $fetch(`portals/${route.params.id}/draft`, { method: 'DELETE' })
})

const validateDraft = useAsyncAction(async () => {
  await $fetch(`portals/${route.params.id}/draft`, { method: 'POST' })
})
*/

</script>

<style lang="css">
</style>

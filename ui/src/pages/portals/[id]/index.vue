<template>
  <v-container data-iframe-height>
    <v-form
      v-if="editConfig"
      v-model="formValid"
    >
      <vjsf-portal-config
        v-if="vjsfOptions"
        v-model="editConfig"
        :options="vjsfOptions"
        @update:model-value="saveDraft.execute()"
      >
        <template #colors-preview="context">
          <colors-preview
            :colors-key="context.colorsKey"
            :theme="context.node.data"
            :dark="context.dark"
          />
        </template>
        <template #font-families-preview="context">
          <font-families-preview
            :portal-config="context.node.data"
          />
        </template>
        <template #app-bar-preview="context">
          <v-card>
            <layout-app-bar
              :portal-config="editConfig"
              :detached="true"
              :home="context.home"
            />
          </v-card>
        </template>
        <template #image-upload="{node, statefulLayout, width, height, label}">
          <image-upload
            :model-value="node.data"
            :label="label"
            :width="width"
            :height="height"
            :resource="portalRef"
            @update:model-value="(data: any) => {console.log('input data', data); statefulLayout.input(node, data)}"
          />
        </template>
      </vjsf-portal-config>
    </v-form>

    <navigation-right v-if="portalFetch.data.value">
      <portal-actions
        :has-draft-diff="hasDraftDiff"
        :is-saving-draft="saveDraft.loading.value"
        :portal-title="portalFetch.data.value.config.title"
        :portal-url="portalFetch.data.value.ingress?.url"
        @refresh-portal="portalFetch.refresh()"
      />
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import type { Portal } from '#api/types/portal'
import type { PortalConfig } from '#api/types/portal-config'
import type { Options as VjsfOptions } from '@koumoul/vjsf'

import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import equal from 'fast-deep-equal'
import LayoutAppBar from '../../../../../portal/app/components/layout/layout-app-bar.vue'

const { t } = useI18n()
const route = useRoute<'/portals/[id]/'>()

const portalFetch = useFetch<Portal>($apiPath + '/portals/' + route.params.id)
const editConfig = ref<PortalConfig>()
const formValid = ref(false)
watch(portalFetch.data, () => {
  if (portalFetch.data.value) editConfig.value = portalFetch.data.value.draftConfig
})

const portalRef = { type: 'portal' as const, _id: route.params.id }

const saveDraft = useAsyncAction(async () => {
  await $fetch(`/portals/${route.params.id}`, { method: 'PATCH', body: { draftConfig: editConfig.value } })
})

const hasDraftDiff = computed(() => {
  return !equal(editConfig.value, portalFetch.data.value?.config)
})

watch(portalFetch.data, (portal) => {
  if (!portal) return
  setBreadcrumbs([{
    text: t('portals'),
    to: '/portals'
  }, {
    text: portal.config.title
  }])
})

const vjsfOptions = computed<VjsfOptions | null>(() => {
  return {
    titleDepth: 4,
    density: 'comfortable',
    locale: 'fr',
    updateOn: 'blur',
    initialValidation: 'always',
    context: {
      simplifiedTheme: true
    }
  }
})

</script>

<i18n lang="yaml">
  en:
    portals: Portals

  fr:
    portals: Portails

</i18n>

<!--
<style scoped>
</style>
-->

<template>
  <v-container data-iframe-height>
    <v-defaults-provider
      :defaults="{
        global: {
          hideDetails: 'auto'
        }
      }"
    >
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
            <v-theme-provider theme="preview-colors">
              <font-families-preview :portal-config="context.node.data" />
            </v-theme-provider>
          </template>
          <template #app-bar-preview="context">
            <v-theme-provider theme="preview-colors">
              <v-card>
                <LayoutAppBar
                  :portal-config="editConfig"
                  :detached="true"
                  :home="context.home"
                />
              </v-card>
            </v-theme-provider>
          </template>
          <template #footer-preview="context">
            <v-theme-provider theme="preview-colors">
              <v-card>
                <LayoutFooter
                  :portal-config="editConfig"
                  :detached="true"
                  :home="context.home"
                />
              </v-card>
            </v-theme-provider>
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
    </v-defaults-provider>

    <navigation-right v-if="portalFetch.data.value">
      <portal-actions
        :is-valid-draft="formValid"
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
import type { Portal, PortalConfig } from '#api/types/portal'
import type { Options as VjsfOptions } from '@koumoul/vjsf'

import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import LayoutAppBar from '#portal/app/components/layout/layout-app-bar.vue'
import equal from 'fast-deep-equal'

const { t } = useI18n()
const route = useRoute<'/portals/[id]/'>()
const session = useSessionAuthenticated()

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

const vjsfOptions = computed<VjsfOptions | null>(() => ({
  context: {
    simplifiedTheme: true
  },
  density: 'comfortable',
  initialValidation: 'always',
  locale: session.lang.value,
  titleDepth: 4,
  updateOn: 'blur'
}))

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

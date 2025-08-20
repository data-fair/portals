<template>
  <v-container>
    <v-row>
      <v-col>
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
      </v-col>
      <navigation-right>
        <v-list
          density="compact"
          data-iframe-height
        >
          <v-list-item
            :disabled="validateDraft.loading.value || saveDraft.loading.value || !hasDraftDiff"
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
            :disabled="cancelDraft.loading.value || saveDraft.loading.value || !hasDraftDiff"
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
          <v-divider class="my-4" />
          <v-list-item
            v-if="session.user.value.adminMode"
            :to="`/portals/${route.params.id}/ingress`"
          >
            <template #prepend>
              <v-icon
                color="admin"
                :icon="mdiShieldLinkVariant"
              />
            </template>
            Gérer l'exposition sur un domaine
          </v-list-item>
          <v-list-item
            :href="$uiConfig.draftUrlPattern.replace('{id}', route.params.id)"
          >
            <template #prepend>
              <v-icon
                :icon="mdiShieldLinkVariant"
              />
            </template>
            Voir le brouillon
          </v-list-item>
          <v-list-item
            v-if="portalFetch.data.value?.ingress"
            :href="portalFetch.data.value?.ingress.url"
          >
            <template #prepend>
              <v-icon
                :icon="mdiLink"
              />
            </template>
            Visiter le portail
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
import { type Options as VjsfOptions } from '@koumoul/vjsf'
import { type Portal } from '#api/types/portal/index'
import { type PortalConfig } from '#api/types/portal-config/index'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import { mdiFileReplace, mdiLink, mdiShieldLinkVariant } from '@mdi/js'
import equal from 'fast-deep-equal'

const route = useRoute<'/portals/[id]/'>()
const session = useSessionAuthenticated()

const portalFetch = useFetch<Portal>($apiPath + '/portals/' + route.params.id)
const editConfig = ref<PortalConfig>()
watch(portalFetch.data, () => {
  if (portalFetch.data.value) editConfig.value = portalFetch.data.value.draftConfig
})

const portalRef = { type: 'portal', _id: route.params.id }

const hasDraftDiff = computed(() => {
  return !equal(editConfig.value, portalFetch.data.value?.config)
})

const formValid = ref(false)

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

const saveDraft = useAsyncAction(async () => {
  await $fetch(`/portals/${route.params.id}`, { method: 'PATCH', body: { draftConfig: editConfig.value } })
})

const cancelDraft = useAsyncAction(async () => {
  await $fetch(`portals/${route.params.id}/draft`, { method: 'DELETE' })
  await portalFetch.refresh()
})

const validateDraft = useAsyncAction(async () => {
  await $fetch(`portals/${route.params.id}/draft`, { method: 'POST' })
  await portalFetch.refresh()
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

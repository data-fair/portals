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
        <vjsf-reuse-config
          v-model="editConfig"
          :locale="locale"
          :options="vjsfOptions"
          @update:model-value="saveConfig.execute()"
        >
          <template #image-upload="{ node, statefulLayout, width, height, label }">
            <image-upload
              :model-value="node.data"
              :label="label"
              :width="width"
              :height="height"
              :resource="reuseRef"
              @update:model-value="(data: any) => statefulLayout.input(node, data)"
            />
          </template>
          <template #color-select-item="context">
            <v-list-item v-bind="context.props">
              <template #prepend>
                <v-icon
                  :icon="mdiCircle"
                  :color="context.item.raw.value"
                />
              </template>
            </v-list-item>
          </template>
          <template #color-select-selection="context">
            <span :class="'v-select__selection-text'">
              <v-icon
                :icon="mdiCircle"
                :color="context.item.raw.value"
                class="mr-3"
              />{{ context.item.raw.title }}
            </span>
          </template>
        </vjsf-reuse-config>
      </v-form>
    </v-defaults-provider>

    <navigation-right>
      <embed-reuse-actions
        :changes-stack="changesStack"
        :reuse-id="route.params.id"
      />
    </navigation-right>
  </v-container>
</template>

<script setup lang="ts">
import type { Options as VjsfOptions } from '@koumoul/vjsf'
import type { ReuseConfig } from '#api/types/reuse'

import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import { mdiCircle } from '@mdi/js'
import equal from 'fast-deep-equal'

const { t, locale } = useI18n()
const route = useRoute<'/embed/reuses/[id]'>()

const { reuseFetch, patchReuse } = provideReuseStore(route.params.id)

const editConfig = ref<ReuseConfig>()
watch(reuseFetch.data, () => {
  if (reuseFetch.data.value) editConfig.value = reuseFetch.data.value.draftConfig
}, { immediate: true })

const changesStack = useChangesStack(editConfig)
const formValid = ref(false)
const reuseRef = { type: 'reuse' as const, _id: route.params.id }

const vjsfOptions = computed<VjsfOptions>(() => ({
  titleDepth: 4,
  density: 'compact',
  updateOn: 'blur',
  initialValidation: 'always',
  context: { isEmbed: true } // Fetch only datasets of the current portal
}))

const saveConfig = useAsyncAction(async () => {
  if (!formValid.value) return
  // Only send patch if config has changed
  if (equal(editConfig.value, reuseFetch.data.value?.draftConfig)) return

  const patch: Record<string, any> = { draftConfig: editConfig.value }
  // If there are pending publication requests, mark validation as required
  if (reuseFetch.data.value?.requestedPortals?.length) {
    patch.requestedValidationDraft = true
  }
  await patchReuse.execute(patch)
})

watch(reuseFetch.data, (reuse) => {
  if (!reuse) return
  setBreadcrumbs([
    { text: t('reuses'), to: '/reuses' },
    { text: reuse.title }
  ])
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    reuses: Reuses

  fr:
    reuses: Réutilisations
</i18n>

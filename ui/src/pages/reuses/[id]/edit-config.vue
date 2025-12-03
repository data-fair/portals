<template>
  <v-container data-iframe-height>
    <v-defaults-provider
      :defaults="{
        global: {
          hideDetails: 'auto'
        },
        VSwitch: {
          color: 'primary'
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
        </vjsf-reuse-config>
      </v-form>
    </v-defaults-provider>

    <navigation-right>
      <reuse-edit-actions :changes-stack="changesStack" />
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import type { Options as VjsfOptions } from '@koumoul/vjsf'
import type { ReuseConfig } from '#api/types/reuse-config'

import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const { t, locale } = useI18n()
const route = useRoute<'/reuses/[id]/edit-config'>()

const { reuseFetch, patchReuse } = useReuseStore()

const editConfig = ref<ReuseConfig>()
watch(reuseFetch.data, () => {
  if (reuseFetch.data.value) editConfig.value = reuseFetch.data.value.config
}, { immediate: true })

const changesStack = useChangesStack(editConfig)
const formValid = ref(false)
const reuseRef = { type: 'reuse' as const, _id: route.params.id }

const vjsfOptions = computed<VjsfOptions>(() => ({
  titleDepth: 4,
  density: 'compact',
  updateOn: 'blur',
  initialValidation: 'always'
}))

const saveConfig = useAsyncAction(async () => {
  if (!formValid.value) return
  await patchReuse.execute({ config: editConfig.value })
})

watch(reuseFetch.data, (reuse) => {
  if (!reuse) return
  setBreadcrumbs([
    { text: t('reuses'), to: '/reuses' },
    { text: reuse.title, to: `/reuses/${route.params.id}` },
    { text: t('edit') }
  ])
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    reuses: Reuses
    edit: Editing

  fr:
    reuses: Réutilisations
    edit: Édition

</i18n>

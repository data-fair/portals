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
        <vjsf-use-config
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
              :resource="useRef"
              @update:model-value="(data: any) => statefulLayout.input(node, data)"
            />
          </template>
        </vjsf-use-config>
      </v-form>
    </v-defaults-provider>

    <navigation-right v-if="useFetch.data.value">
      <use-edit-actions :changes-stack="changesStack" />
    </navigation-right>
  </v-container>
</template>

<script lang="ts" setup>
import type { Options as VjsfOptions } from '@koumoul/vjsf'
import type { UseConfig } from '#api/types/use-config'

import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const { t, locale } = useI18n()
const route = useRoute<'/uses/[id]/edit-config'>()
const session = useSession()

const { useFetch, patchUse } = useUseStore()

const editConfig = ref<UseConfig>()
watch(useFetch.data, () => {
  if (useFetch.data.value) editConfig.value = useFetch.data.value.config
}, { immediate: true })

const changesStack = useChangesStack(editConfig)
const formValid = ref(false)

const useRef = { type: 'use' as const, _id: route.params.id }

const vjsfOptions = computed<VjsfOptions>(() => ({
  titleDepth: 4,
  density: 'compact',
  updateOn: 'blur',
  initialValidation: 'always',
  context: {
    owner: session.account.value
  }
}))

const saveConfig = useAsyncAction(async () => {
  if (!formValid.value) return
  await patchUse.execute({ config: editConfig.value })
})

watch(useFetch.data, (use) => {
  if (!use) return
  setBreadcrumbs([
    { text: t('uses'), to: '/uses' },
    { text: use.title, to: `/uses/${route.params.id}` },
    { text: t('edit') }
  ])
}, { immediate: true })

</script>

<i18n lang="yaml">
  en:
    uses: Uses
    edit: Editing

  fr:
    uses: Réutilisations
    edit: Édition

</i18n>

<template>
  <v-form v-model="formValid">
    <vjsf-page-permissions
      v-if="permissionsModel"
      v-model="permissionsModel"
      :options="vjsfOptions"
      @update:model-value="savePermissions"
    />
  </v-form>
</template>

<script setup lang="ts">
import type { Options as VjsfOptions } from '@koumoul/vjsf'

const { pageFetch, patchPage } = usePageStore()

const permissionsModel = ref<{ public?: boolean, permissions?: any[] } | null>(null)

watch(pageFetch.data, (p) => {
  if (!p) return
  permissionsModel.value = {
    public: p.public,
    permissions: p.permissions ?? []
  }
}, { immediate: true })

const formValid = ref(false)

const vjsfOptions = computed<VjsfOptions>(() => ({
  titleDepth: 4,
  density: 'compact',
  updateOn: 'blur',
  initialValidation: 'always',
  context: { owner: pageFetch.data.value?.owner }
}))

const savePermissions = (value: { public?: boolean, permissions?: any[] }) => {
  if (!formValid.value) return
  patchPage.execute({
    public: value.public,
    permissions: value.permissions ?? []
  })
}
</script>

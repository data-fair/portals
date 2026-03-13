<template>
  <vjsf-page-permissions
    v-if="permissionsModel"
    v-model="permissionsModel"
    :options="vjsfOptions"
    @update:model-value="savePermissions"
  />
</template>

<script setup lang="ts">
import type { Options as VjsfOptions } from '@koumoul/vjsf'

const { page, patchPage } = usePageStore()

const permissionsModel = ref<{ public?: boolean, permissions?: any[] } | null>(null)

watch(() => page.value, (p) => {
  if (!p) return
  permissionsModel.value = {
    public: p.public,
    permissions: p.permissions ?? []
  }
}, { immediate: true })

const vjsfOptions = computed<VjsfOptions>(() => ({
  density: 'comfortable',
  context: { owner: page.value?.owner }
}))

const savePermissions = (value: { public?: boolean, permissions?: any[] }) => {
  patchPage.execute({
    ...(value.public !== undefined ? { public: value.public } : {}),
    ...(value.permissions !== undefined ? { permissions: value.permissions } : {})
  })
}
</script>

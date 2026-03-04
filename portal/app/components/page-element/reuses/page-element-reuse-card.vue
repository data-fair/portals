<template>
  <reuse-card
    v-if="reuse"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :reuse="reuse"
    :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.reuses.card"
    :is-portal-config="element.usePortalConfig || !element.cardConfig"
  />
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse'
import type { ReuseCardElement } from '#api/types/page-config'

const { element } = defineProps<{ element: ReuseCardElement }>()
const { portalConfig, preview } = usePortalStore()

let reuse: Ref<Pick<Reuse, '_id' | 'slug' | 'config' | 'updatedAt'> | null | undefined>
if (!preview) {
  const reuseFetch = useFetch<Reuse>(() => element.reuse?.slug ? '/portal/api/reuses/' + element.reuse.slug : '', { immediate: false })
  reuse = reuseFetch.data
  watch(() => element.reuse?.slug, (slug) => {
    if (slug) reuseFetch.refresh()
  }, { immediate: true })
} else {
  // Mock data for preview
  reuse = ref({
    _id: 'reuse-i',
    slug: element.reuse?.slug || 'reuse-1',
    config: {
      title: element.reuse?.title || 'Réutilisation 1',
      summary: 'Exemple de réutilisation pour la prévisualisation.',
      author: 'Auteur exemple'
    },
    updatedAt: new Date().toISOString()
  })
}

</script>

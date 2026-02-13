<template>
  <reuse-card
    v-if="reuseFetch.data?.value"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :reuse="reuseFetch.data?.value"
    :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.reuses.card"
    :is-portal-config="element.usePortalConfig || !element.cardConfig"
  />
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse'
import type { ReuseCardElement } from '#api/types/page-config'

const { element } = defineProps<{ element: ReuseCardElement }>()
const { portalConfig } = usePortalStore()

const reuseFetch = useFetch<Reuse>(() => element.reuse?.slug ? '/portal/api/reuses/' + element.reuse.slug : '', { immediate: false })

watch(() => element.reuse?.slug, (slug) => {
  if (slug) reuseFetch.refresh()
}, { immediate: true })

</script>

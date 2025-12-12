<template>
  <router-link
    :to="to"
    :href="parentUrls.parentUrls[to] ?? undefined"
    target="_top"
    style="text-decoration: none; color: inherit;"
  >
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import useDFrameParentUrls from '@data-fair/frame/lib/vue/use-parent-urls'
import { useVueRouterDFrameContent } from '@data-fair/frame/lib/vue-router/d-frame-content'

const { to } = defineProps<{ to: string }>()

const router = useRouter()
const dFrameContent = useVueRouterDFrameContent()
const parentUrls = useDFrameParentUrls(dFrameContent, router)
watch(() => to, () => { parentUrls.get(to) }, { immediate: true })

</script>

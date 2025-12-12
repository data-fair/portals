<template>
  <nuxt-link
    :to="to"
    :href="parentUrls.get(to).value"
    target="_top"
    style="text-decoration: none; color: inherit;"
  >
    <slot />
  </nuxt-link>
</template>

<script setup lang="ts">
import useDFrameParentUrls from '@data-fair/frame/lib/vue/use-parent-urls'
import { useVueRouterDFrameContent } from '@data-fair/frame/lib/vue-router/d-frame-content'

defineProps<{ to: string }>()

const router = useRouter()
const dFrameContent = useVueRouterDFrameContent()
const parentUrls = useDFrameParentUrls(dFrameContent, router)

</script>

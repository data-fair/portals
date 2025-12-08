<template>
  <router-link
    :to="to"
    :href="parentUrls.get(to).value"
    target="_top"
    style="text-decoration: none; color: inherit;"
  >
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import useDFrameParentUrls from '@data-fair/frame/lib/vue/use-parent-urls'
import dFrameContentVueRouter from '@data-fair/frame/lib/vue-router/d-frame-content'

defineProps<{ to: string }>()

const router = useRouter()
const dFrameContent = dFrameContentVueRouter(router)
const parentUrls = useDFrameParentUrls(dFrameContent, router)

</script>

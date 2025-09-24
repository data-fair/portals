<template>
  <NuxtLink
    v-if="portalConfig.style.navLinkMode.startsWith('link')"
    :to="to"
  >
    <v-icon
      v-if="icon && portalConfig.style.navLinkIcon"
      :icon="icon"
      :color="portalConfig.style.navLinkColor"
    />
    {{ text }}
  </NuxtLink>
  <v-btn
    v-else-if="portalConfig.style.navLinkMode.startsWith('btn')"
    :to="to"
    :text="text"
    :variant="portalConfig.style.navLinkMode === 'btn-outlined' ? 'outlined' : undefined"
    :prepend-icon="icon && portalConfig.style.navLinkIcon ? icon : undefined"
    color="primary"
  />
</template>

<script setup lang="ts">
defineProps<{
  to: string
  text: string
  icon?: string
}>()

// const { portalConfig } = usePortalStore()
// TODO: Use a global style config
const portalConfig = {
  style: {
    navLinkMode: 'btn-outlined',
    navLinkIcon: true,
    navLinkColor: 'primary',
  }
}

</script>

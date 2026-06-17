<template>
  <v-alert
    v-if="visible"
    :type="element.alertType !== 'none' ? element.alertType : undefined"
    :title="element.title"
    :color="element.alertType === 'none' ? element.color : undefined"
    :variant="element.variant && element.variant !== 'default' ? element.variant : undefined"
    :border="element.variant === 'tonal' ? 'start' : undefined"
    :closable="closable"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    @click:close="onClose"
  >
    <template
      v-if="element.alertType === 'none' && element.icon && (element.icon.mdi?.svgPath || element.icon.custom)"
      #prepend
    >
      <v-icon
        :icon="element.icon.mdi?.svgPath || element.icon.custom"
        :color="element.icon.color"
      />
    </template>
    <template #text>
      <!--eslint-disable-next-line vue/no-v-html -->
      <div v-html="element._html" />
    </template>
  </v-alert>
</template>

<script setup lang="ts">
import type { AlertElement } from '#api/types/page-elements/index.ts'

const { element } = defineProps({
  element: { type: Object as () => AlertElement, required: true }
})

const { preview } = usePortalStore()

// dismissals are persisted in a cookie shared with SSR, but never in the editor preview
const dismissedAlerts = preview
  ? null
  : useCookie<string[] | undefined>('df_portal_dismissed_alerts', {
    maxAge: 60 * 60 * 24 * 365, // 1 an
    sameSite: true,
    path: '/'
  })

const closable = computed(() => !!element.closable && !!element.uuid)
const isDismissed = computed(() => !!element.uuid && !!dismissedAlerts?.value?.includes(element.uuid))
const visible = computed(() => !(closable.value && isDismissed.value))

const onClose = () => {
  if (dismissedAlerts && element.uuid && !dismissedAlerts.value?.includes(element.uuid)) {
    dismissedAlerts.value = [...(dismissedAlerts.value ?? []), element.uuid]
  }
}
</script>

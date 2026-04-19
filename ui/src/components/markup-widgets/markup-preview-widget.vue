<template>
  <div class="markup-preview-widget-frame">
    <div
      v-if="failed"
      class="markup-preview-widget-error"
    >
      {{ t('previewFailed') }}
    </div>
    <div
      v-else-if="!element"
      class="markup-preview-widget-missing"
    >
      {{ t('elementUnavailable') }}
    </div>
    <page-preview-element
      v-else
      :key="elementPointer"
      :model-value="element"
      :context="context"
      :pages="pages"
    />
  </div>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-elements/index.ts'
import { onErrorCaptured } from 'vue'

const props = defineProps<{
  elementPointer: string
  element: PageElement | undefined
  pages: unknown
}>()

const { t } = useI18n()

const context = computed(() => ({ isRoot: false, index: 0, parentLength: 1 }))

const failed = ref(false)
onErrorCaptured((err) => {
  failed.value = true
  console.error('[markup-preview-widget] render failed for', props.elementPointer, err)
  return false
})
</script>

<i18n lang="yaml">
en:
  previewFailed: Preview failed to render
  elementUnavailable: Element unavailable
fr:
  previewFailed: Échec du rendu de l'aperçu
  elementUnavailable: Élément indisponible
</i18n>

<style scoped>
.markup-preview-widget-frame {
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.24);
  border-radius: 4px;
  margin: 4px 0;
  padding: 8px;
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.markup-preview-widget-error,
.markup-preview-widget-missing {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-style: italic;
  font-size: 0.875rem;
}
</style>

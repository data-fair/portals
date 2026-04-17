<template>
  <div>
    <v-textarea
      v-model="text"
      :rows="20"
      auto-grow
      variant="outlined"
      density="compact"
      spellcheck="false"
      :class="['markup-textarea', errors.length ? 'markup-textarea--error' : '']"
      hide-details="auto"
      @blur="applyChange"
    />
    <v-alert
      v-if="errors.length"
      type="error"
      variant="tonal"
      density="compact"
      class="mt-2"
    >
      <ul class="pl-2 ma-0">
        <li
          v-for="(e, idx) in errors"
          :key="idx"
        >
          L{{ e.line }}:{{ e.col }} — {{ e.message }}
        </li>
      </ul>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-elements/index.ts'
import {
  serializeElements,
  deserializeElements,
  type DeserializeError
} from '@data-fair/portals-shared-markup'

const elements = defineModel<PageElement[]>({ required: true })

const text = ref('')
const errors = ref<DeserializeError[]>([])
let lastExternalText = ''

function refreshFromElements () {
  const next = serializeElements(elements.value ?? [])
  // don't clobber in-progress edits the user has not yet applied
  if (text.value === lastExternalText) {
    text.value = next
  }
  lastExternalText = next
}

watch(elements, refreshFromElements, { immediate: true, deep: true })

function applyChange () {
  const result = deserializeElements(text.value)
  if (result.errors.length > 0 || result.elements == null) {
    errors.value = result.errors
    return
  }
  errors.value = []
  const reserialized = serializeElements(result.elements)
  // normalize text to canonical form so subsequent external-sync check works
  text.value = reserialized
  lastExternalText = reserialized
  elements.value = result.elements as PageElement[]
}
</script>

<style scoped>
.markup-textarea :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.35;
  tab-size: 2;
  white-space: pre;
}

.markup-textarea--error :deep(.v-field) {
  border-color: rgb(var(--v-theme-error));
}
</style>

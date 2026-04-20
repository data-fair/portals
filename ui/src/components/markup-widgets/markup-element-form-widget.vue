<template>
  <div
    v-if="element"
    class="markup-element-form-widget"
  >
    <vjsf-page-element
      :model-value="element"
      :locale="locale"
      :options="vjsfOptions"
      @update:model-value="onChange"
    />
  </div>
  <div
    v-else
    class="markup-element-form-widget markup-element-form-widget--placeholder"
  >
    {{ t('elementUnavailable') }}
  </div>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-elements/index.ts'
import type { StatefulLayout } from '@json-layout/core/state'
import type { Options as VjsfOptions } from '@koumoul/vjsf'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import VjsfPageElement from '~/components/vjsf/vjsf-page-element.vue'
import MarkupOneOfSelectPassthrough from '~/components/markup-widgets/markup-one-of-select-passthrough.vue'

// Mirror of the markup-image-widget pattern: the outer page-config
// StatefulLayout delegates `/elements` to a slot so per-element StateNodes
// don't exist on it. We clone the elements array along the JSON pointer,
// replace the target element with the form's emitted value, and call
// `statefulLayout.input(elementsNode, nextRoot)` — the same write protocol
// markup-image-widget.vue uses.
//
// The `element` prop comes from the parent's parse-state cache (updated on
// every keystroke), so the form stays in sync with the markup mid-edit —
// the outer `elementsNode.data` only refreshes on blur.
const props = defineProps<{
  elementPointer: string
  element?: PageElement
  elementsNode: any | null
  statefulLayout: StatefulLayout | null
  pages?: unknown
}>()

const { t, locale } = useI18n()

const element = computed(() => props.element)

const pageRef = { type: 'page' as const, _id: inject('page-id') as string }
const $cspNonce = inject<string>('cspNonce', '')

const vjsfOptions: VjsfOptions = {
  titleDepth: 5,
  density: 'compact',
  updateOn: 'blur',
  initialValidation: 'always',
  // Override the root one-of-select: the markup tag is the source of truth
  // for element type, so the dropdown at the root is redundant. Nested
  // one-ofs (link config, contact fields) still use the standard selector.
  nodeComponents: {
    'one-of-select': MarkupOneOfSelectPassthrough
  } as any,
  pluginsOptions: {
    markdown: {
      cspNonce: $cspNonce,
      easyMDEOptions: { previewRender: renderMarkdown }
    }
  } as any,
  icons: {
    close: '$tableGroupExpand'
  } as any,
  context: { pages: props.pages, pageRef }
}

function onChange (data: any) {
  const sl = props.statefulLayout
  const en = props.elementsNode
  if (!sl || !en) return
  const root = en.data
  if (!Array.isArray(root)) return
  const segments = props.elementPointer.split('/').filter(Boolean)
  if (segments.length === 0) return

  const nextRoot: any[] = root.slice()
  let cur: any = nextRoot
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]
    const key: any = Array.isArray(cur) ? Number(seg) : seg
    const prev = cur[key]
    if (prev == null || typeof prev !== 'object') return
    cur[key] = Array.isArray(prev) ? prev.slice() : { ...prev }
    cur = cur[key]
  }
  const lastSeg = segments[segments.length - 1]
  const lastKey: any = Array.isArray(cur) ? Number(lastSeg) : lastSeg
  cur[lastKey] = data

  sl.input(en, nextRoot)
}
</script>

<i18n lang="yaml">
en:
  elementUnavailable: Element unavailable
fr:
  elementUnavailable: Élément indisponible
</i18n>

<style scoped>
.markup-element-form-widget {
  min-width: 0;
  font-size: 0.875rem;
}

.markup-element-form-widget--placeholder {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-style: italic;
}
</style>

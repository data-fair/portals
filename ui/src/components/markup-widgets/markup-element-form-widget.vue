<template>
  <div
    ref="el"
    class="markup-element-form-widget vjsf"
  >
    <tree
      v-if="element && wrappedCompiledLayout && innerStatefulLayout && stateTree"
      :model-value="stateTree"
      :stateful-layout="innerStatefulLayout"
    />
    <div
      v-else-if="!element"
      class="markup-element-form-widget--placeholder"
    >
      {{ t('elementUnavailable') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-elements/index.ts'
import type { StatefulLayout } from '@json-layout/core/state'
import type { ShallowRef } from 'vue'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import Tree from '@koumoul/vjsf/components/tree.vue'
// @ts-expect-error package only ships types as `nodes/index.d.ts`, not `.js.d.ts`
import { nodeComponents as defaultVjsfNodeComponents } from '@koumoul/vjsf/components/nodes/index.js'
import { useVjsf } from '@koumoul/vjsf/composables/use-vjsf.js'
import MarkupOneOfSelectPassthrough from '~/components/markup-widgets/markup-one-of-select-passthrough.vue'

// The outer page-config VJSF (edit-config.vue) provides its compiled layout via
// `vjsf:page-config-compiled-layout`. We reuse it here — no fresh schema, no AJV
// recompile. We re-root on the element $defs sub-skeleton-tree (keyed
// `{mainTree}/properties/elements/items`) so this instance's StatefulLayout has a
// single page element as its root data. The outer layout stays untouched.
const props = defineProps<{
  elementPointer: string
  element?: PageElement
  elementsNode: any | null
  statefulLayout: StatefulLayout | null
  pages?: unknown
}>()

const { t } = useI18n()
const pageRef = { type: 'page' as const, _id: inject('page-id') as string }
const $cspNonce = inject<string>('cspNonce', '')

const injectedCompiledLayout = inject<ShallowRef<any>>(
  'vjsf:page-config-compiled-layout'
) ?? shallowRef(null)

// Wrap the outer compiled layout with a different `mainTree` so useVjsf — which
// always picks `skeletonTrees[mainTree]` — instantiates a StatefulLayout rooted on
// the element sub-tree. Everything else (validators, normalized layouts,
// expressions, per-branch skeletons) is shared by reference with the outer layout.
const wrappedCompiledLayout = computed(() => {
  const cl = injectedCompiledLayout.value
  if (!cl) return null
  const key = `${cl.mainTree}/properties/elements/items`
  if (!cl.skeletonTrees[key]) return null
  return { ...cl, mainTree: key }
})

const elementModel = computed(() => props.element)

const vjsfOptions = computed(() => ({
  titleDepth: 5,
  density: 'compact' as const,
  updateOn: 'blur' as const,
  initialValidation: 'always' as const,
  // `markup-inline` mode is read by markup-one-of-select-passthrough.vue to skip
  // the root one-of selector (the markup tag is the source of truth for element
  // type). Nested one-ofs inside an element still show their selector.
  context: { mode: 'markup-inline', pages: props.pages, pageRef },
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
  } as any
}))

const emit = defineEmits<{
  (e: 'update:modelValue', data: any): void
  (e: 'update:state', state: any): void
}>()

// `el` is the template ref useVjsf expects for width measurement
// (useElementSize). Without binding it to a rendered DOM element the internal
// width stays 0 and `initStatefulLayout` never runs — so we bind it to the
// always-rendered wrapper div above.
const {
  el,
  statefulLayout: innerStatefulLayout,
  stateTree
} = useVjsf(
  ref(null) as any,
  elementModel as any,
  vjsfOptions as any,
  defaultVjsfNodeComponents,
  (eventName: string, payload: any) => {
    if (eventName === 'update:modelValue') onChange(payload)
    else emit(eventName as any, payload)
  },
  null as any,
  null as any,
  wrappedCompiledLayout as any
)
// `el` is bound via `ref="el"` in the template — vue-tsc doesn't track
// destructured template refs as reads, so touch it here to silence
// noUnusedLocals without a blanket `@ts-nocheck`.
el

// Write-back: the outer StatefulLayout owns the elements array; this widget pushes
// the edited element back into it along the known JSON pointer. Same protocol as
// markup-image-widget.vue uses for per-attribute writes.
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

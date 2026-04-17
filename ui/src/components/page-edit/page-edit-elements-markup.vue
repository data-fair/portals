<template>
  <div
    ref="editorEl"
    :class="['markup-editor', hasErrors ? 'markup-editor--error' : '']"
  />
  <teleport
    v-for="w in activeWidgets"
    :key="w.key"
    :to="w.host"
  >
    <markup-image-widget
      :element-pointer="w.elementPointer"
      :group="w.group"
      :elements-node="node ?? null"
      :stateful-layout="statefulLayout ?? null"
      :resource="pageRef"
    />
  </teleport>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-elements/index.ts'
import type { StatefulLayout } from '@json-layout/core/state'
import type { Completion } from '@codemirror/autocomplete'
import { shallowRef } from 'vue'
import { serializeElements, deserializeElements, tagDescriptors, type ImageUploadGroup, type MarkupSourceMap } from '@data-fair/portals-shared-markup'
import {
  portalMarkupExtensions,
  portalMarkupImageUploadWidgets,
  setMarkupExternalDiagnostics,
  collectErrorsByDataPath,
  findNodeByDataPath,
  offsetToElementPointer,
  toCmDiagnostic,
  type AttributeValueContext
} from '@data-fair/portals-shared-markup/codemirror'
import MarkupImageWidget from '~/components/markup-widgets/markup-image-widget.vue'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { forEachDiagnostic, lintKeymap, type Diagnostic } from '@codemirror/lint'
import { completionKeymap } from '@codemirror/autocomplete'

// `node` is the VJSF StateNode for the elements array; `statefulLayout` is the
// form-mode instance that already runs ajv validation and knows how to resolve
// suggestions (schema enums, oneOf items, URL-fetched lists). We piggy-back on
// both so validation and completion stay in sync with form mode.
const props = defineProps<{
  node?: any | null
  statefulLayout?: StatefulLayout | null
}>()

const elements = defineModel<PageElement[]>({ required: true })

// The CodeMirror autocomplete captures this locale at mount time. Locale
// changes mid-session don't propagate — the Form↔Markup toggle remounts this
// component, which re-reads `locale.value`.
const { locale } = useI18n()

const pageRef = { type: 'page' as const, _id: inject('page-id') as string }

const editorEl = ref<HTMLElement | null>(null)
const hasErrors = ref(false)
let view: EditorView | null = null
let lastExternalText = ''
let lastSourceMap: MarkupSourceMap = { byPointer: new Map(), byElementPointer: new Map() }

interface ActiveWidget {
  key: string
  host: HTMLElement
  elementPointer: string
  group: ImageUploadGroup
}
const activeWidgets = shallowRef<ActiveWidget[]>([])
let widgetSeq = 0

function elementsDataPath (): string {
  return (props.node?.dataPath ?? '') as string
}

function refreshExternalDiagnostics (): void {
  if (!view) return
  if (!props.node || !props.statefulLayout) {
    view.dispatch({ effects: setMarkupExternalDiagnostics.of([]) })
    return
  }
  const errors = collectErrorsByDataPath(props.node)
  const docLength = view.state.doc.length
  const prefix = elementsDataPath()
  const diagnostics: Diagnostic[] = []
  for (const err of errors) {
    const d = toCmDiagnostic(err, lastSourceMap, prefix, docLength)
    if (d) diagnostics.push(d)
  }
  view.dispatch({ effects: setMarkupExternalDiagnostics.of(diagnostics) })
}

async function asyncValueCompletions (ctx: AttributeValueContext): Promise<Completion[] | null> {
  const sl = props.statefulLayout
  const rootNode = props.node
  if (!sl || !rootNode) return null
  const elementPointer = offsetToElementPointer(lastSourceMap, ctx.from)
  if (!elementPointer) return null
  const attrSuffix = ctx.attributePath.map(seg => '/' + seg).join('')
  const targetPath = elementsDataPath() + elementPointer + attrSuffix
  const target = findNodeByDataPath(rootNode, targetPath) ??
    findNodeByDataPath((sl as any).stateTree?.root, targetPath)
  if (!target) return null
  let items: Array<{ title?: string, value?: unknown, key?: string }> = []
  try {
    items = await sl.getItems(target, ctx.currentValue)
  } catch {
    return null
  }
  const completions: Completion[] = []
  for (const it of items) {
    const value = it.value !== undefined ? String(it.value) : (it.key ?? '')
    completions.push({
      label: String(it.title ?? value),
      apply: value,
      type: 'enum'
    })
  }
  return completions
}

function buildExtensions (locale: string) {
  return [
    lineNumbers(),
    foldGutter(),
    history(),
    indentOnInput(),
    bracketMatching(),
    highlightActiveLine(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([...defaultKeymap, ...historyKeymap, ...lintKeymap, ...completionKeymap, indentWithTab]),
    portalMarkupExtensions({ locale, asyncValueCompletions }),
    portalMarkupImageUploadWidgets({
      tagDescriptors,
      // Instead of createApp-per-widget (which loses access to the main app's
      // Vuetify + uiNotif + session plugins), we register the mount site as a
      // Teleport target in the parent template. The widget renders as part of
      // this component's tree and inherits all plugins/providers.
      mountWidget: (container, { elementPointer, group }) => {
        const key = `${elementPointer}:${group.jsonPath.join('/')}:${widgetSeq++}`
        activeWidgets.value = [...activeWidgets.value, { key, host: container, elementPointer, group }]
        return () => {
          activeWidgets.value = activeWidgets.value.filter(w => w.key !== key)
        }
      }
    }),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        // Keep the source map fresh so async completions and diagnostics land
        // at the right offsets while the user types.
        lastSourceMap = deserializeElements(update.state.doc.toString()).sourceMap
      }
      if (!update.docChanged && !update.transactions.some(tr => tr.effects.length)) return
      let count = 0
      forEachDiagnostic(update.state, () => { count++ })
      hasErrors.value = count > 0
    }),
    EditorView.domEventHandlers({
      blur: () => { applyChange() }
    })
  ]
}

function applyChange () {
  if (!view) return
  const text = view.state.doc.toString()
  const result = deserializeElements(text)
  lastSourceMap = result.sourceMap
  refreshExternalDiagnostics()
  if (result.errors.length > 0 || result.elements == null) {
    // leave model untouched — diagnostics are already inline via the linter
    return
  }
  const reserialized = serializeElements(result.elements)
  if (reserialized !== text) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: reserialized }
    })
    lastSourceMap = deserializeElements(reserialized).sourceMap
  }
  lastExternalText = view.state.doc.toString()
  elements.value = result.elements as PageElement[]
}

function refreshFromElements () {
  if (!view) return
  const next = serializeElements(elements.value ?? [])
  const current = view.state.doc.toString()
  if (current === next) {
    lastExternalText = next
    lastSourceMap = deserializeElements(next).sourceMap
    refreshExternalDiagnostics()
    return
  }
  // don't clobber in-progress edits the user has not yet applied
  if (current !== lastExternalText) return
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: next }
  })
  lastExternalText = next
  lastSourceMap = deserializeElements(next).sourceMap
  refreshExternalDiagnostics()
}

onMounted(() => {
  const initial = serializeElements(elements.value ?? [])
  lastExternalText = initial
  lastSourceMap = deserializeElements(initial).sourceMap
  view = new EditorView({
    state: EditorState.create({ doc: initial, extensions: buildExtensions(locale.value) }),
    parent: editorEl.value!
  })
  refreshExternalDiagnostics()
})

watch(elements, refreshFromElements, { deep: true })
// StatefulLayout rebuilds produce a new `node` identity — re-dispatch errors
// whenever either identity changes so stale diagnostics get cleared.
watch(() => props.node, refreshExternalDiagnostics)
watch(() => props.statefulLayout, refreshExternalDiagnostics)

onBeforeUnmount(() => {
  view?.destroy()
  view = null
})
</script>

<style scoped>
.markup-editor {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.38);
  border-radius: 4px;
  overflow: hidden;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
}

.markup-editor--error {
  border-color: rgb(var(--v-theme-error));
}

.markup-editor :deep(.cm-editor) {
  outline: none;
  background: transparent;
}

.markup-editor :deep(.cm-editor.cm-focused) {
  outline: none;
}

.markup-editor :deep(.cm-scroller) {
  font-family: inherit;
  font-size: inherit;
  line-height: 1.35;
}

.markup-editor :deep(.cm-content) {
  padding: 8px 0;
}

.markup-editor :deep(.cm-gutters) {
  background: transparent;
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
</style>

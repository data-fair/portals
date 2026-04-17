<template>
  <div
    ref="editorEl"
    :class="['markup-editor', hasErrors ? 'markup-editor--error' : '']"
  />
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-elements/index.ts'
import { serializeElements, deserializeElements } from '@data-fair/portals-shared-markup'
import { portalMarkupExtensions } from '@data-fair/portals-shared-markup/codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { forEachDiagnostic, lintKeymap } from '@codemirror/lint'
import { completionKeymap } from '@codemirror/autocomplete'

const elements = defineModel<PageElement[]>({ required: true })

// The CodeMirror autocomplete captures this locale at mount time. Locale
// changes mid-session don't propagate — the Form↔Markup toggle remounts this
// component, which re-reads `locale.value`.
const { locale } = useI18n()

const editorEl = ref<HTMLElement | null>(null)
const hasErrors = ref(false)
let view: EditorView | null = null
let lastExternalText = ''

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
    portalMarkupExtensions({ locale }),
    EditorView.updateListener.of((update) => {
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
  if (result.errors.length > 0 || result.elements == null) {
    // leave model untouched — diagnostics are already inline via the linter
    return
  }
  const reserialized = serializeElements(result.elements)
  if (reserialized !== text) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: reserialized }
    })
  }
  lastExternalText = reserialized
  elements.value = result.elements as PageElement[]
}

function refreshFromElements () {
  if (!view) return
  const next = serializeElements(elements.value ?? [])
  const current = view.state.doc.toString()
  if (current === next) {
    lastExternalText = next
    return
  }
  // don't clobber in-progress edits the user has not yet applied
  if (current !== lastExternalText) return
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: next }
  })
  lastExternalText = next
}

onMounted(() => {
  const initial = serializeElements(elements.value ?? [])
  lastExternalText = initial
  view = new EditorView({
    state: EditorState.create({ doc: initial, extensions: buildExtensions(locale.value) }),
    parent: editorEl.value!
  })
})

watch(elements, refreshFromElements, { deep: true })

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

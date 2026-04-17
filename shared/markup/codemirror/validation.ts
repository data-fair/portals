import { linter, type Diagnostic } from '@codemirror/lint'
import type { EditorView } from '@codemirror/view'
import { deserializeElements } from '../deserializer.ts'

/**
 * CM6 lint extension. On each (debounced) document change, runs the
 * hand-written markup deserializer and surfaces each parse/shape error as an
 * inline Diagnostic anchored at the reported line/col.
 *
 * Scope: deserializer errors only (unknown tags, malformed attributes,
 * mismatched close tags, type-coercion failures, etc.). JSON Schema / ajv
 * validation is intentionally not run here; it will be added later when the
 * markup editor shares a StatefulLayout with the form editor.
 */
export const portalMarkupLinter = linter((view: EditorView): Diagnostic[] => {
  const text = view.state.doc.toString()
  if (text === '') return []
  const { errors } = deserializeElements(text)
  const diagnostics: Diagnostic[] = []
  for (const err of errors) {
    const lineNo = Math.max(1, Math.min(err.line, view.state.doc.lines))
    const line = view.state.doc.line(lineNo)
    const from = Math.min(line.from + Math.max(0, err.col - 1), line.to)
    const to = Math.min(from + 1, line.to === from ? line.to : line.to)
    diagnostics.push({
      from,
      to: to > from ? to : Math.min(from + 1, view.state.doc.length),
      severity: 'error',
      message: err.message,
      source: 'markup'
    })
  }
  return diagnostics
}, { delay: 300 })

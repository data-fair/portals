import { linter, type Diagnostic } from '@codemirror/lint'
import { StateEffect, StateField, type Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import { deserializeElements } from '../deserializer.ts'

/**
 * Dispatch to replace the externally-provided diagnostics (e.g. JSON-Schema
 * validation errors distributed from a StatefulLayout). Use:
 *   view.dispatch({ effects: setMarkupExternalDiagnostics.of(diagnostics) })
 */
export const setMarkupExternalDiagnostics = StateEffect.define<Diagnostic[]>()

/**
 * Holds the last-dispatched external diagnostics. Merged with deserializer
 * diagnostics by `portalMarkupLinter`.
 */
const markupExternalDiagnosticsField = StateField.define<Diagnostic[]>({
  create: () => [],
  update (value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setMarkupExternalDiagnostics)) return effect.value
    }
    return value
  }
})

/**
 * CM6 lint extension. Merges:
 *  - deserializer diagnostics (parse/shape errors: unknown tags, malformed
 *    attributes, type-coercion failures, etc.), anchored at the reported
 *    line/col;
 *  - external diagnostics set via `setMarkupExternalDiagnostics` (e.g. ajv
 *    errors translated through a source map by a StatefulLayout adapter).
 */
const deserializerLinter = linter((view: EditorView): Diagnostic[] => {
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

const externalDiagnosticsLinter = linter(
  (view: EditorView): Diagnostic[] => view.state.field(markupExternalDiagnosticsField),
  { needsRefresh: (update) => update.transactions.some(tr => tr.effects.some(e => e.is(setMarkupExternalDiagnostics))) }
)

export const portalMarkupLinter: Extension = [
  markupExternalDiagnosticsField,
  deserializerLinter,
  externalDiagnosticsLinter
]

import { StateField } from '@codemirror/state'
import { deserializeElements, type DeserializeError } from '../deserializer.ts'
import type { MarkupSourceMap } from '../types.ts'

/**
 * One parse per transaction, shared by every consumer (node-preview field,
 * image-upload view plugin, linter, host updateListener). Reading the field
 * costs O(1); computing it from scratch is O(doc × descriptors).
 */
export interface MarkupParseState {
  sourceMap: MarkupSourceMap
  errors: ReadonlyArray<DeserializeError>
  elements: any[] | null
}

export const markupParseStateField = StateField.define<MarkupParseState>({
  create: (state) => parseDoc(state.doc.toString()),
  update (value, tr) {
    if (!tr.docChanged) return value
    return parseDoc(tr.state.doc.toString())
  }
})

function parseDoc (doc: string): MarkupParseState {
  return deserializeElements(doc)
}

import type { Extension } from '@codemirror/state'
import { autocompletion } from '@codemirror/autocomplete'
import { portalMarkup } from './language.ts'
import { portalMarkupLinter } from './validation.ts'
import { portalMarkupCompletion, type AsyncValueCompletions } from './completion.ts'
import { markupParseStateField } from './parse-state.ts'

export { portalMarkup, portalMarkupLanguage } from './language.ts'
export { portalMarkupLinter, setMarkupExternalDiagnostics } from './validation.ts'
export { portalMarkupCompletion } from './completion.ts'
export type { AsyncValueCompletions, AttributeValueContext } from './completion.ts'
export { markupParseStateField } from './parse-state.ts'
export type { MarkupParseState } from './parse-state.ts'
export {
  collectErrorsByDataPath,
  findNodeByDataPath,
  toRelativePointer,
  offsetToElementPointer,
  resolveRange,
  toCmDiagnostic
} from './bridge.ts'
export type { ErrorNodeLike, MarkupError } from './bridge.ts'
export { portalMarkupImageUploadWidgets, computeImageUploadRanges } from './image-upload-widgets.ts'
export type { ImageUploadRange, ImageUploadWidgetsOptions, MountWidget, MountWidgetArgs } from './image-upload-widgets.ts'
export {
  portalMarkupNodePreviewWidgets,
  computeNodePreviewRanges,
  toggleNodePreview,
  nodePreviewState
} from './node-preview-widgets.ts'
export type {
  NodePreviewRange,
  NodePreviewWidgetsOptions,
  MountPreview,
  MountPreviewArgs
} from './node-preview-widgets.ts'

export function portalMarkupExtensions (opts: {
  locale: string
  asyncValueCompletions?: AsyncValueCompletions
}): Extension[] {
  return [
    markupParseStateField,
    portalMarkup(),
    autocompletion({ override: [portalMarkupCompletion(opts.locale, { asyncValueCompletions: opts.asyncValueCompletions })] }),
    portalMarkupLinter
  ]
}

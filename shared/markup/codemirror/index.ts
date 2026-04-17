import type { Extension } from '@codemirror/state'
import { autocompletion } from '@codemirror/autocomplete'
import { portalMarkup } from './language.ts'
import { portalMarkupLinter } from './validation.ts'
import { portalMarkupCompletion, type AsyncValueCompletions } from './completion.ts'

export { portalMarkup, portalMarkupLanguage } from './language.ts'
export { portalMarkupLinter, setMarkupExternalDiagnostics } from './validation.ts'
export { portalMarkupCompletion } from './completion.ts'
export type { AsyncValueCompletions, AttributeValueContext } from './completion.ts'
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

/**
 * Bundle of extensions for the page-edit markup editor:
 * language support (highlighting, folding, indentation) + autocomplete
 * (tag names, attribute names, enum/boolean values, plus optional
 * caller-provided async value suggestions) + lint diagnostics (deserializer
 * errors + externally-pushed diagnostics via `setMarkupExternalDiagnostics`).
 */
export function portalMarkupExtensions (opts: {
  locale: string
  asyncValueCompletions?: AsyncValueCompletions
}): Extension[] {
  return [
    portalMarkup(),
    autocompletion({ override: [portalMarkupCompletion(opts.locale, { asyncValueCompletions: opts.asyncValueCompletions })] }),
    portalMarkupLinter
  ]
}

import type { Extension } from '@codemirror/state'
import { autocompletion } from '@codemirror/autocomplete'
import { portalMarkup } from './language.ts'
import { portalMarkupLinter } from './validation.ts'
import { portalMarkupCompletion } from './completion.ts'

export { portalMarkup, portalMarkupLanguage } from './language.ts'
export { portalMarkupLinter } from './validation.ts'
export { portalMarkupCompletion } from './completion.ts'

/**
 * Bundle of extensions for the page-edit markup editor:
 * language support (highlighting, folding, indentation) + autocomplete
 * (tag names, attribute names, enum/boolean values) + lint diagnostics.
 */
export function portalMarkupExtensions (opts: { locale: string }): Extension[] {
  return [
    portalMarkup(),
    autocompletion({ override: [portalMarkupCompletion(opts.locale)] }),
    portalMarkupLinter
  ]
}

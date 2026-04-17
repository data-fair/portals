import type { Extension } from '@codemirror/state'
import { portalMarkup } from './language.ts'
import { portalMarkupLinter } from './validation.ts'

export { portalMarkup, portalMarkupLanguage } from './language.ts'
export { portalMarkupLinter } from './validation.ts'

/**
 * Bundle of extensions recommended for the page-edit markup editor:
 * language support (highlighting, folding, indentation) + lint diagnostics.
 */
export function portalMarkupExtensions (): Extension[] {
  return [portalMarkup(), portalMarkupLinter]
}

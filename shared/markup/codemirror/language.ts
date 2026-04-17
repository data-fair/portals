import {
  LRLanguage,
  LanguageSupport,
  foldInside,
  foldNodeProp,
  indentNodeProp,
  delimitedIndent
} from '@codemirror/language'
import { styleTags, tags as t } from '@lezer/highlight'
import { parser } from './portal-markup.grammar.ts'

const portalMarkupParser = parser.configure({
  props: [
    styleTags({
      'TagName/Name': t.tagName,
      'AttributeName/Name': t.attributeName,
      AttributeValue: t.string,
      String: t.string,
      Text: t.content
    }),
    foldNodeProp.add({
      Element: foldInside
    }),
    indentNodeProp.add({
      Element: delimitedIndent({ closing: '</' })
    })
  ]
})

export const portalMarkupLanguage = LRLanguage.define({
  parser: portalMarkupParser,
  languageData: {
    commentTokens: {},
    indentOnInput: /^\s*<\/\w+>\s*$/
  }
})

export function portalMarkup (): LanguageSupport {
  return new LanguageSupport(portalMarkupLanguage)
}

/**
 * CM6 autocomplete source for portal markup. Uses the Lezer syntax tree to
 * detect the cursor context and returns suggestions across three branches:
 *
 *   - Tag name context (inside `<` or at top level) — every real tag plus
 *     virtual slot tags (collected via `collectVirtualTags`).
 *   - Attribute name context — leaf attribute paths for the enclosing tag,
 *     excluding ones already written.
 *   - Attribute value context — schema-derived enum/boolean values, merged
 *     with host-provided async completions (dataset ids, etc.).
 *
 * Descriptor titles are resolved against the editor's locale (captured at
 * mount because `useI18n().locale` is not reactive once CM6 is running).
 */
import type { CompletionContext, CompletionResult, CompletionSource, Completion } from '@codemirror/autocomplete'
import type { EditorView } from '@codemirror/view'
import type { SyntaxNode } from '@lezer/common'
import { syntaxTree } from '@codemirror/language'
import { tagDescriptors } from '../tag-descriptors.ts'
import type { AttributeDescriptor } from '../types.ts'

/**
 * Context describing an attribute-value cursor position, passed to a
 * user-provided `asyncValueCompletions` callback. The callback is expected to
 * return CodeMirror completion items (or `null`/empty array for no
 * suggestions). The markup bundle takes care of merging them with static
 * schema-derived options (enum / boolean).
 */
export interface AttributeValueContext {
  /** Current tag name (real or virtual). */
  tagName: string
  /** Attribute name as it appears in markup (may contain dots). */
  attributeName: string
  /** JSON path within the element, e.g. `["background", "color"]`. */
  attributePath: string[]
  /** Value already typed between the quotes. */
  currentValue: string
  /** Start offset of the value content (just inside the opening quote). */
  from: number
  /** End offset of the value content (just before the closing quote). */
  to: number
}

export type AsyncValueCompletions = (ctx: AttributeValueContext) => Promise<Completion[] | null>

function localized (titles: Record<string, string> | undefined, locale: string): string | undefined {
  if (!titles) return undefined
  return titles[locale] ?? titles.en ?? Object.values(titles)[0]
}

function findAncestor (node: SyntaxNode | null, names: string[]): SyntaxNode | null {
  let n = node
  while (n) {
    if (names.includes(n.name)) return n
    n = n.parent
  }
  return null
}

let _virtualTagsCache: Array<{ name: string, titles?: Record<string, string> }> | null = null
function virtualTagList () {
  if (_virtualTagsCache) return _virtualTagsCache
  const seen = new Map<string, Record<string, string> | undefined>()
  for (const desc of Object.values(tagDescriptors)) {
    for (const slot of desc.childrenSlots) {
      if (!slot.virtualTag || seen.has(slot.virtualTag)) continue
      seen.set(slot.virtualTag, slot.titles)
    }
  }
  _virtualTagsCache = [...seen.entries()].map(([name, titles]) => ({ name, titles }))
  return _virtualTagsCache
}

function tagNameOptions (locale: string): Completion[] {
  const out: Completion[] = []
  for (const [name, desc] of Object.entries(tagDescriptors)) {
    out.push({ label: name, detail: localized(desc.titles, locale), type: 'class' })
  }
  for (const vt of virtualTagList()) {
    out.push({ label: vt.name, detail: localized(vt.titles, locale), type: 'keyword' })
  }
  return out
}

function attributesForTag (tagName: string): AttributeDescriptor[] | null {
  const real = tagDescriptors[tagName]
  if (real) return real.attributes
  for (const desc of Object.values(tagDescriptors)) {
    for (const slot of desc.childrenSlots) {
      if (slot.virtualTag === tagName && slot.itemAttributes) return slot.itemAttributes
    }
  }
  return null
}

function attributeNameOptions (attrs: AttributeDescriptor[], locale: string): Completion[] {
  return attrs.map(attr => ({
    label: attr.name,
    detail: localized(attr.titles, locale),
    type: 'property' as const,
    info: attr.required ? 'required' : undefined,
    apply: (view: EditorView, _c: Completion, from: number, to: number) => {
      view.dispatch({
        changes: { from, to, insert: `${attr.name}=""` },
        selection: { anchor: from + attr.name.length + 2 }
      })
    }
  }))
}

function findAttributeDescriptor (tagName: string, attrName: string): AttributeDescriptor | null {
  const attrs = attributesForTag(tagName)
  if (!attrs) return null
  return attrs.find(a => a.name === attrName) ?? null
}

function valueOptionsFor (attr: AttributeDescriptor, locale: string): Completion[] {
  if (attr.enumValues && attr.enumValues.length > 0) {
    return attr.enumValues.map(v => {
      const s = String(v)
      return {
        label: s,
        detail: localized(attr.enumTitles?.[s], locale),
        type: 'enum' as const
      }
    })
  }
  if (attr.type === 'boolean') {
    return [
      { label: 'true', type: 'constant' as const },
      { label: 'false', type: 'constant' as const }
    ]
  }
  return []
}

function mergeCompletions (primary: Completion[], secondary: Completion[]): Completion[] {
  if (secondary.length === 0) return primary
  const seen = new Set(primary.map(o => o.label))
  const merged = primary.slice()
  for (const o of secondary) {
    if (seen.has(o.label)) continue
    seen.add(o.label)
    merged.push(o)
  }
  return merged
}

type Context =
  | { kind: 'tagname' }
  | { kind: 'attrname', tagName: string }
  | { kind: 'attrvalue', tagName: string, attrName: string, valueFrom: number, valueTo: number }

function textOf (state: { sliceDoc: (from: number, to: number) => string }, node: SyntaxNode): string {
  return state.sliceDoc(node.from, node.to)
}

function findTagNameText (state: { sliceDoc: (from: number, to: number) => string }, openOrSelf: SyntaxNode): string | null {
  const tagNameNode = openOrSelf.getChild('TagName')
  return tagNameNode ? textOf(state, tagNameNode) : null
}

function detectContext (ctx: CompletionContext): Context | null {
  const state = ctx.state
  const tree = syntaxTree(state)
  const node = tree.resolveInner(ctx.pos, -1)

  // --- Tag-name context ---
  if (findAncestor(node, ['TagName'])) return { kind: 'tagname' }

  // --- Attribute-value context ---
  // Cursor sits inside an AttributeValue (between the quotes).
  const valueNode = findAncestor(node, ['AttributeValue', 'String'])
  const openTagForValue = findAncestor(node, ['OpenTag', 'SelfClosingTag'])
  if (valueNode && openTagForValue) {
    const attrNode = findAncestor(valueNode, ['Attribute'])
    if (attrNode) {
      const nameNode = attrNode.getChild('AttributeName')
      if (nameNode) {
        const attrName = textOf(state, nameNode)
        // The AttributeValue's text is `"..."` — offsets +1 / -1 to narrow to just inside the quotes.
        const valueFrom = valueNode.from + 1
        const valueTo = valueNode.to - 1
        const tagName = findTagNameText(state, openTagForValue)
        if (tagName) return { kind: 'attrvalue', tagName, attrName, valueFrom, valueTo }
      }
    }
  }

  // --- Attribute-name context ---
  // We're inside an OpenTag/SelfClosingTag but outside its TagName and outside
  // any AttributeValue (which handles the value branch).
  const openTag = findAncestor(node, ['OpenTag', 'SelfClosingTag'])
  if (openTag && !valueNode) {
    const tagName = findTagNameText(state, openTag)
    if (tagName) return { kind: 'attrname', tagName }
  }

  // --- Fallback text-based probe for partial "<x" parse ---
  // The zero-repetition `*` is deliberate: it covers the bare `<|` cursor case
  // where the parser may not yet have produced a TagName node.
  const before = ctx.matchBefore(/<[A-Za-z0-9_-]*/)
  if (before) return { kind: 'tagname' }

  return null
}

export function portalMarkupCompletion (
  locale: string,
  opts: { asyncValueCompletions?: AsyncValueCompletions } = {}
): CompletionSource {
  const asyncValueCompletions = opts.asyncValueCompletions
  return (ctx: CompletionContext): CompletionResult | Promise<CompletionResult | null> | null => {
    const which = detectContext(ctx)
    if (!which) return null

    if (which.kind === 'attrvalue') {
      const attr = findAttributeDescriptor(which.tagName, which.attrName)
      if (!attr) return null
      const staticOptions = valueOptionsFor(attr, locale)
      if (!asyncValueCompletions) {
        if (staticOptions.length === 0) return null
        return {
          from: which.valueFrom,
          to: which.valueTo,
          options: staticOptions,
          validFor: /^[^"]*$/
        }
      }
      const attrCtx: AttributeValueContext = {
        tagName: which.tagName,
        attributeName: which.attrName,
        attributePath: attr.jsonPath,
        currentValue: ctx.state.sliceDoc(which.valueFrom, which.valueTo),
        from: which.valueFrom,
        to: which.valueTo
      }
      return Promise.resolve(asyncValueCompletions(attrCtx))
        .catch(() => null)
        .then(asyncOptions => {
          const merged = mergeCompletions(staticOptions, asyncOptions ?? [])
          if (merged.length === 0) return null
          return {
            from: which.valueFrom,
            to: which.valueTo,
            options: merged,
            validFor: /^[^"]*$/
          }
        })
    }

    if (which.kind === 'tagname') {
      const partial = ctx.matchBefore(/<[A-Za-z0-9_-]*/)
      const from = partial ? partial.from + 1 : ctx.pos
      return {
        from,
        to: ctx.pos,
        options: tagNameOptions(locale),
        validFor: /^[A-Za-z0-9_-]*$/
      }
    }

    if (which.kind === 'attrname') {
      const attrs = attributesForTag(which.tagName)
      if (!attrs) return null
      const partial = ctx.matchBefore(/[A-Za-z][A-Za-z0-9_.-]*/)
      const from = partial ? partial.from : ctx.pos
      return {
        from,
        to: ctx.pos,
        options: attributeNameOptions(attrs, locale),
        validFor: /^[A-Za-z0-9_.-]*$/
      }
    }

    return null
  }
}

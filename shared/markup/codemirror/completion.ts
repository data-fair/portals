import type { CompletionContext, CompletionResult, CompletionSource, Completion } from '@codemirror/autocomplete'
import type { SyntaxNode } from '@lezer/common'
import { syntaxTree } from '@codemirror/language'
import { tagDescriptors } from '../tag-descriptors.ts'
import type { AttributeDescriptor } from '../types.ts'

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
    apply: (view: any, _c: Completion, from: number, to: number) => {
      view.dispatch({
        changes: { from, to, insert: `${attr.name}=""` },
        selection: { anchor: from + attr.name.length + 2 }
      })
    }
  }))
}

type Context =
  | { kind: 'tagname' }
  | { kind: 'attrname', tagName: string }

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

  // --- Attribute-name context ---
  // We're inside an OpenTag/SelfClosingTag but outside its TagName and outside
  // any AttributeValue (which handles the value branch).
  const openTag = findAncestor(node, ['OpenTag', 'SelfClosingTag'])
  const valueNode = findAncestor(node, ['AttributeValue', 'String'])
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

export function portalMarkupCompletion (locale: string): CompletionSource {
  return (ctx: CompletionContext): CompletionResult | null => {
    const which = detectContext(ctx)
    if (!which) return null

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

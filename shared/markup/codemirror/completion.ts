import type { CompletionContext, CompletionResult, CompletionSource, Completion } from '@codemirror/autocomplete'
import type { SyntaxNode } from '@lezer/common'
import { syntaxTree } from '@codemirror/language'
import { tagDescriptors } from '../tag-descriptors.ts'

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

function detectContext (ctx: CompletionContext): { kind: 'tagname' } | null {
  const state = ctx.state
  const tree = syntaxTree(state)
  const node = tree.resolveInner(ctx.pos, -1)

  if (findAncestor(node, ['TagName'])) return { kind: 'tagname' }

  // Match "<" optionally followed by tag name chars (covers both "<|" and "<tit|")
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

    return null
  }
}

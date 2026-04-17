import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { EditorState } from '@codemirror/state'
import { CompletionContext, type Completion, type CompletionResult } from '@codemirror/autocomplete'
import { portalMarkupLanguage } from '../../../shared/markup/codemirror/language.ts'
import { portalMarkupCompletion, type AsyncValueCompletions, type AttributeValueContext } from '../../../shared/markup/codemirror/completion.ts'

function runCompletion (doc: string, locale = 'en'): CompletionResult | null {
  const cursor = doc.indexOf('|')
  assert.notEqual(cursor, -1, 'doc must contain a | marker for the cursor')
  const text = doc.slice(0, cursor) + doc.slice(cursor + 1)
  const state = EditorState.create({ doc: text, extensions: [portalMarkupLanguage] })
  const ctx = new CompletionContext(state, cursor, false)
  const source = portalMarkupCompletion(locale)
  const res = source(ctx)
  return res instanceof Promise ? null : (res ?? null)
}

async function runCompletionAsync (
  doc: string,
  asyncValueCompletions: AsyncValueCompletions,
  locale = 'en'
): Promise<{ result: CompletionResult | null, received: AttributeValueContext | null }> {
  const cursor = doc.indexOf('|')
  assert.notEqual(cursor, -1, 'doc must contain a | marker for the cursor')
  const text = doc.slice(0, cursor) + doc.slice(cursor + 1)
  const state = EditorState.create({ doc: text, extensions: [portalMarkupLanguage] })
  const ctx = new CompletionContext(state, cursor, false)
  let received: AttributeValueContext | null = null
  const wrapped: AsyncValueCompletions = async (c) => {
    received = c
    return asyncValueCompletions(c)
  }
  const source = portalMarkupCompletion(locale, { asyncValueCompletions: wrapped })
  const res = await Promise.resolve(source(ctx))
  return { result: res ?? null, received }
}

function labels (r: CompletionResult | null): string[] {
  return (r?.options ?? []).map((o: Completion) => o.label)
}

test.describe('markup completion — tag names', () => {
  test('suggests real tags after "<"', () => {
    const r = runCompletion('<|')
    const found = labels(r)
    assert.ok(found.includes('title'), 'includes <title>')
    assert.ok(found.includes('banner'), 'includes <banner>')
  })

  test('suggests virtual tags too', () => {
    const r = runCompletion('<|')
    const found = labels(r)
    assert.ok(found.includes('tab'), 'includes virtual <tab>')
    assert.ok(found.includes('left'), 'includes virtual <left>')
    assert.ok(found.includes('action'), 'includes virtual <action>')
  })

  test('filters by partial prefix', () => {
    const r = runCompletion('<tit|')
    const found = labels(r)
    assert.ok(found.includes('title'))
  })

  test('returns localized detail in fr', () => {
    const r = runCompletion('<|', 'fr')
    const title = (r?.options ?? []).find((o: Completion) => o.label === 'title')
    assert.ok(title, 'title option present')
    assert.ok(typeof title!.detail === 'string' && title!.detail.length > 0, 'has a detail')
  })
})

test.describe('markup completion — attribute names', () => {
  test('suggests attributes of a real tag', () => {
    const r = runCompletion('<title |')
    const found = labels(r)
    assert.ok(found.includes('titleSize'), 'titleSize present')
    assert.ok(found.includes('centered'), 'centered present')
  })

  test('does not suggest attributes of unrelated tags', () => {
    const r = runCompletion('<title |')
    const found = labels(r)
    assert.equal(found.includes('elevation'), false)
  })

  test('suggests itemAttributes for a virtual tag', () => {
    const r = runCompletion('<tabs>\n  <tab |\n</tabs>')
    const found = labels(r)
    assert.ok(found.includes('title'), 'virtual <tab> exposes its title attr')
  })

  test('returns null for unknown tag', () => {
    const r = runCompletion('<nonsense |')
    assert.equal(r, null)
  })
})

test.describe('markup completion — attribute values', () => {
  test('suggests enum values for enum attribute', () => {
    const r = runCompletion('<title titleSize="|"')
    const found = labels(r)
    assert.ok(found.includes('h1'), 'h1 present')
    assert.ok(found.includes('h2'), 'h2 present')
  })

  test('suggests true/false for boolean attribute', () => {
    const r = runCompletion('<title centered="|"')
    const found = labels(r)
    assert.deepEqual(found.sort(), ['false', 'true'])
  })

  test('returns null for free-text (non-enum, non-boolean) attribute', () => {
    const r = runCompletion('<title content="|"')
    assert.equal(r, null)
  })

  test('returns null for unknown tag in value context', () => {
    const r = runCompletion('<nonsense foo="|"')
    assert.equal(r, null)
  })
})

test.describe('markup completion — async value completions', () => {
  test('invokes callback with attribute context and merges after static options', async () => {
    const { result, received } = await runCompletionAsync(
      '<title titleSize="|"',
      async () => [{ label: 'custom' } as Completion]
    )
    assert.ok(received, 'callback received context')
    assert.equal(received!.tagName, 'title')
    assert.equal(received!.attributeName, 'titleSize')
    assert.deepEqual(received!.attributePath, ['titleSize'])
    assert.equal(received!.currentValue, '')
    const opts = (result?.options ?? []).map((o: Completion) => o.label)
    // static options come first, async append after, de-duped
    assert.ok(opts.indexOf('h1') < opts.indexOf('custom'), 'static before async')
  })

  test('falls through to async when attribute has no static options', async () => {
    // icon.mdi.name is a free-text string attribute (no enum, not boolean).
    const { result } = await runCompletionAsync(
      '<title icon.mdi.name="|"',
      async () => [{ label: 'suggested' } as Completion]
    )
    const opts = (result?.options ?? []).map((o: Completion) => o.label)
    assert.deepEqual(opts, ['suggested'])
  })

  test('dot-path attribute yields nested jsonPath in ctx', async () => {
    const { received } = await runCompletionAsync(
      '<title icon.color="|"',
      async () => []
    )
    assert.ok(received)
    assert.equal(received!.attributeName, 'icon.color')
    assert.deepEqual(received!.attributePath, ['icon', 'color'])
  })

  test('de-duplicates async options whose label collides with a static one', async () => {
    const { result } = await runCompletionAsync(
      '<title titleSize="|"',
      async () => [{ label: 'h1' } as Completion, { label: 'extra' } as Completion]
    )
    const labels = (result?.options ?? []).map((o: Completion) => o.label)
    assert.equal(labels.filter(l => l === 'h1').length, 1, 'h1 appears once')
    assert.ok(labels.includes('extra'))
  })

  test('swallows callback errors and still returns static options', async () => {
    const { result } = await runCompletionAsync(
      '<title titleSize="|"',
      async () => { throw new Error('boom') }
    )
    const labels = (result?.options ?? []).map((o: Completion) => o.label)
    assert.ok(labels.includes('h1'))
  })
})

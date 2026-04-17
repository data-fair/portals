import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { EditorState } from '@codemirror/state'
import { CompletionContext, type Completion, type CompletionResult } from '@codemirror/autocomplete'
import { portalMarkupLanguage } from '../../../shared/markup/codemirror/language.ts'
import { portalMarkupCompletion } from '../../../shared/markup/codemirror/completion.ts'

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

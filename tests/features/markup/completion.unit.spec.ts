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

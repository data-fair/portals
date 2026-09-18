import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { renderMarkdown } from '../../../shared/markdown/index.ts'

const anchors = (html: string) => [...html.matchAll(/<a\b[^>]*>/g)].map(m => m[0])

test.describe('renderMarkdown link rel', () => {
  test('a link to the personal space is nofollow', () => {
    const [a] = anchors(renderMarkdown('Voir mon [espace](/me/reuses)'))
    assert.match(a, /href="\/me\/reuses"/)
    assert.match(a, /rel="nofollow"/)
  })

  test('a public link has no rel', () => {
    const [a] = anchors(renderMarkdown('Le [catalogue](/datasets)'))
    assert.doesNotMatch(a, /rel=/)
  })

  test('a user-written rel is replaced by the computed one', () => {
    const [a] = anchors(renderMarkdown('<a href="/me/account" rel="sponsored">compte</a>'))
    assert.match(a, /rel="nofollow"/)
    assert.doesNotMatch(a, /sponsored/)
  })

  test('a raw link opened in a new tab gets noopener', () => {
    const [a] = anchors(renderMarkdown('<a href="https://example.com" target="_blank">ext</a>'))
    assert.match(a, /rel="noopener"/)
  })
})

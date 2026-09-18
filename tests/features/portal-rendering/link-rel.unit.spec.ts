import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { isPrivatePath, linkRel } from '../../../shared/markdown/link-rel.ts'

test.describe('isPrivatePath', () => {
  test('matches the personal space root and its sub-pages', () => {
    assert.equal(isPrivatePath('/me'), true)
    assert.equal(isPrivatePath('/me/reuses'), true)
    assert.equal(isPrivatePath('/me/reuses?dataset=x'), true)
  })

  test('matches the auth service', () => {
    assert.equal(isPrivatePath('/simple-directory/login?redirect=https://x/'), true)
  })

  test('does not match paths that merely start with the same letters', () => {
    assert.equal(isPrivatePath('/media'), false)
    assert.equal(isPrivatePath('/members/1'), false)
    assert.equal(isPrivatePath('/simple-directory'), false)
  })

  test('handles absolute urls and non-http schemes', () => {
    assert.equal(isPrivatePath('https://data.example.com/me/account'), true)
    assert.equal(isPrivatePath('https://example.com/datasets'), false)
    assert.equal(isPrivatePath('mailto:contact@example.com'), false)
  })

  test('does not throw on an unparseable href', () => {
    assert.equal(isPrivatePath('http://'), false)
  })
})

test.describe('linkRel', () => {
  test('is undefined for a public link opened in the same tab', () => {
    assert.equal(linkRel('/datasets'), undefined)
    assert.equal(linkRel(undefined), undefined)
  })

  test('keeps noopener for a new tab', () => {
    assert.equal(linkRel('https://example.com', true), 'noopener')
  })

  test('adds nofollow for a private link', () => {
    assert.equal(linkRel('/me/reuses'), 'nofollow')
    assert.equal(linkRel('/me/reuses', true), 'noopener nofollow')
  })

  test('does not throw on an unparseable href', () => {
    assert.equal(linkRel('https://[', true), 'noopener')
  })
})

import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { migrateTextAlign } from '../../../upgrade/2.37.2/text-align.ts'

test.describe('text align migration', () => {
  test('converts the centered option of text blocks, nested ones included', () => {
    const config = {
      elements: [
        { type: 'text', centered: true, content: 'a' },
        { type: 'text', centered: false, content: 'b' },
        { type: 'tabs', tabs: [{ children: [{ type: 'card', children: [{ type: 'text', centered: true, content: 'c' }] }] }] }
      ]
    }
    assert.equal(migrateTextAlign(config), true)
    assert.deepEqual(config, {
      elements: [
        { type: 'text', content: 'a', align: 'center' },
        { type: 'text', content: 'b' },
        { type: 'tabs', tabs: [{ children: [{ type: 'card', children: [{ type: 'text', content: 'c', align: 'center' }] }] }] }
      ]
    })
  })

  test('leaves the centered option of other blocks alone', () => {
    const config = { elements: [{ type: 'title', centered: true, content: 'a' }, { type: 'button', centered: true }] }
    assert.equal(migrateTextAlign(config), false)
    assert.deepEqual(config, { elements: [{ type: 'title', centered: true, content: 'a' }, { type: 'button', centered: true }] })
  })

  test('does nothing on a second run', () => {
    const config = { elements: [{ type: 'text', centered: true, content: 'a' }] }
    migrateTextAlign(config)
    assert.equal(migrateTextAlign(config), false)
    assert.deepEqual(config, { elements: [{ type: 'text', content: 'a', align: 'center' }] })
  })
})

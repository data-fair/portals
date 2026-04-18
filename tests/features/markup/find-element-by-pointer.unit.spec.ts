import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { findElementByPointer } from '../../../shared/markup/walker.ts'

const tree = [
  { type: 'title', titleSize: 'h2', content: 'a' },
  {
    type: 'card',
    children: [
      { type: 'text', content: 'inner' },
      {
        type: 'tabs',
        tabs: [
          { title: 't1', children: [{ type: 'text', content: 'deep' }] }
        ]
      }
    ]
  }
]

test.describe('findElementByPointer', () => {
  test('resolves a top-level pointer', () => {
    const el = findElementByPointer(tree, '/0')
    assert.ok(el)
    assert.equal(el!.type, 'title')
  })

  test('resolves a pointer into a direct children slot', () => {
    const el = findElementByPointer(tree, '/1/children/0')
    assert.ok(el)
    assert.equal(el!.type, 'text')
    assert.equal((el as any).content, 'inner')
  })

  test('resolves a pointer into a structured slot', () => {
    const el = findElementByPointer(tree, '/1/children/1/tabs/0/children/0')
    assert.ok(el)
    assert.equal(el!.type, 'text')
    assert.equal((el as any).content, 'deep')
  })

  test('returns undefined for an out-of-range index', () => {
    assert.equal(findElementByPointer(tree, '/99'), undefined)
    assert.equal(findElementByPointer(tree, '/1/children/9'), undefined)
  })

  test('returns undefined for an empty or malformed pointer', () => {
    assert.equal(findElementByPointer(tree, ''), undefined)
    assert.equal(findElementByPointer(tree, '/'), undefined)
    assert.equal(findElementByPointer(tree, '/abc'), undefined)
  })

  test('returns undefined when traversing through a missing property', () => {
    assert.equal(findElementByPointer(tree, '/0/children/0'), undefined)
  })
})

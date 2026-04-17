import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'
import {
  collectErrorsByDataPath,
  findNodeByDataPath,
  offsetToElementPointer,
  resolveRange,
  toCmDiagnostic,
  toRelativePointer
} from '../../../shared/markup/codemirror/bridge.ts'

test.describe('markup ↔ StatefulLayout bridge', () => {
  test('toRelativePointer strips the elements-array prefix', () => {
    assert.equal(toRelativePointer('/elements', '/elements/3/href'), '/3/href')
    assert.equal(toRelativePointer('/elements', '/elements'), '/')
    assert.equal(toRelativePointer('/elements', '/other/3'), null)
    assert.equal(toRelativePointer('', '/foo'), '/foo')
  })

  test('collectErrorsByDataPath flattens a sparse error tree by dataPath', () => {
    const root = {
      dataPath: '/elements',
      children: [
        {
          dataPath: '/elements/0',
          error: 'bad element',
          children: [
            { dataPath: '/elements/0/href', error: 'bad url' }
          ]
        },
        { dataPath: '/elements/1', children: [] }
      ]
    }
    const errors = collectErrorsByDataPath(root)
    assert.deepEqual(errors, [
      { path: '/elements/0', message: 'bad element' },
      { path: '/elements/0/href', message: 'bad url' }
    ])
  })

  test('findNodeByDataPath walks children to return the first match', () => {
    interface N { dataPath: string, children?: N[] }
    const root: N = {
      dataPath: '/elements',
      children: [
        {
          dataPath: '/elements/0',
          children: [
            { dataPath: '/elements/0/href' }
          ]
        }
      ]
    }
    const found = findNodeByDataPath<N>(root, '/elements/0/href')
    assert.ok(found)
    assert.equal(found!.dataPath, '/elements/0/href')
    assert.equal(findNodeByDataPath<N>(root, '/elements/99'), null)
  })

  test('resolveRange prefers the tightest match then falls back to ancestors', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const attrRange = resolveRange(sourceMap, '/0/titleSize')
    assert.ok(attrRange)
    assert.equal(src.slice(attrRange!.from, attrRange!.to), 'h2')
    // For a non-existing child pointer, fall back to the parent element tag.
    const fallback = resolveRange(sourceMap, '/0/missing/required')
    assert.ok(fallback)
    assert.equal(src.slice(fallback!.from, fallback!.to), src.slice(0, src.indexOf('>') + 1))
  })

  test('offsetToElementPointer picks the innermost element containing the offset', () => {
    const src = [
      '<two-columns>',
      '  <left>',
      '    <title titleSize="h2">Hi</title>',
      '  </left>',
      '</two-columns>'
    ].join('\n')
    const { sourceMap } = deserializeElements(src)
    const titleValueOffset = src.indexOf('h2')
    const pointer = offsetToElementPointer(sourceMap, titleValueOffset)
    assert.equal(pointer, '/0/children/0')
  })

  test('toCmDiagnostic highlights the enum value span for an ajv enum error', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const d = toCmDiagnostic(
      { path: '/elements/0/titleSize', message: 'must match enum' },
      sourceMap,
      '/elements',
      src.length
    )
    assert.ok(d)
    assert.equal(src.slice(d!.from, d!.to), 'h2')
    assert.equal(d!.severity, 'error')
    assert.equal(d!.source, 'schema')
  })

  test('toCmDiagnostic falls back to the element open-tag span for required errors', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    // Simulate an ajv "required" error whose instancePath points at the parent element.
    const d = toCmDiagnostic(
      { path: '/elements/0', message: 'missing required property "href"' },
      sourceMap,
      '/elements',
      src.length
    )
    assert.ok(d)
    const openTag = src.slice(0, src.indexOf('>') + 1)
    assert.equal(src.slice(d!.from, d!.to), openTag)
  })

  test('toCmDiagnostic returns null when the error path is outside the prefix', () => {
    const src = '<title titleSize="h2">Hi</title>'
    const { sourceMap } = deserializeElements(src)
    const d = toCmDiagnostic(
      { path: '/somewhere-else', message: 'x' },
      sourceMap,
      '/elements',
      src.length
    )
    assert.equal(d, null)
  })
})
